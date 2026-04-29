"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useI18n } from "../i18n/I18nProvider";

const DARK_BG = "#020617";
const BLUE_DEEP = "#1d4ed8";
const TEXT_PRIMARY = "#e2e8f0";
const TEXT_SECONDARY = "#94a3b8";
const SURFACE_BG = "#0f172a";
const BORDER_COLOR = "#1e293b";

// Cambia este valor para emular la fecha de las peticiones en desarrollo.
// Usa formato YYYY-MM-DD. Ejemplo: "2026-01-15"
const DEV_INITIAL_REQUEST_DATE = "2026-05-01";

type Deduction = {
  description: string;
  amount: number;
};

type ManagementRecord = {
  id: string;
  initialAmount: number;
  creationDate: string;
  deductions: Deduction[];
};

function isValidDateString(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00`);
  return !Number.isNaN(date.getTime());
}

const dialogSx = {
  "& .MuiPaper-root": {
    backgroundColor: SURFACE_BG,
    color: TEXT_PRIMARY,
    border: `1px solid ${BORDER_COLOR}`,
  },
};

const textFieldSx = {
  "& .MuiInputBase-input": { color: TEXT_PRIMARY },
  "& .MuiInputBase-input.Mui-disabled": {
    color: TEXT_PRIMARY,
    WebkitTextFillColor: TEXT_PRIMARY,
    opacity: 1,
  },
  "& .MuiInputLabel-root": { color: TEXT_SECONDARY },
  "& .MuiInputLabel-root.Mui-disabled": { color: TEXT_SECONDARY },
  "& .MuiOutlinedInput-notchedOutline": { borderColor: BORDER_COLOR },
  "& .MuiOutlinedInput-root.Mui-disabled .MuiOutlinedInput-notchedOutline": {
    borderColor: BORDER_COLOR,
  },
  "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#334155" },
  "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: BLUE_DEEP,
  },
};

const outlinedButtonSx = {
  color: TEXT_PRIMARY,
  borderColor: "#334155",
  "&:hover": {
    borderColor: "#475569",
    backgroundColor: "#1e293b",
  },
};

const valuePillSx = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  width: "100%",
  px: 1.5,
  py: 0.75,
  borderRadius: 999,
  border: `1px solid ${BORDER_COLOR}`,
  backgroundColor: "#111827",
};

export default function ManagementPage() {
  const { t } = useI18n();
  const isDevelopment = process.env.NODE_ENV === "development";
  const currencyFormatter = useMemo(
    () =>
      new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: "COP",
        maximumFractionDigits: 0,
      }),
    []
  );
  const [records, setRecords] = useState<ManagementRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [initialAmount, setInitialAmount] = useState("");
  const [creationDate, setCreationDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [createError, setCreateError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openDeductionModal, setOpenDeductionModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<ManagementRecord | null>(null);
  const [deductionDescription, setDeductionDescription] = useState("");
  const [deductionAmount, setDeductionAmount] = useState("");
  const [deductionError, setDeductionError] = useState<string | null>(null);
  const [isSubmittingDeduction, setIsSubmittingDeduction] = useState(false);
  const [openViewDeductionsModal, setOpenViewDeductionsModal] = useState(false);
  const [draftDeductions, setDraftDeductions] = useState<Deduction[]>([]);
  const [editingDeductionIndex, setEditingDeductionIndex] = useState<number | null>(null);
  const [viewDeductionsError, setViewDeductionsError] = useState<string | null>(null);
  const [isUpdatingDeductions, setIsUpdatingDeductions] = useState(false);

  const baseRequestDate = useMemo(() => {
    if (isDevelopment && isValidDateString(DEV_INITIAL_REQUEST_DATE)) {
      return DEV_INITIAL_REQUEST_DATE;
    }
    return new Date().toISOString().slice(0, 10);
  }, [isDevelopment]);

  const currentDateMetrics = useMemo(() => {
    const currentDate = new Date(`${baseRequestDate}T00:00:00`);
    const currentDayOfMonth = currentDate.getDate();
    const totalDaysInMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0
    ).getDate();

    return { currentDayOfMonth, totalDaysInMonth };
  }, [baseRequestDate]);

  const fetchRecordsByDate = async (dateString: string) => {
    const selectedDate = new Date(`${dateString}T00:00:00`);
    const month = selectedDate.getMonth() + 1;
    const year = selectedDate.getFullYear();

    setIsLoading(true);
    setLoadError(null);

    try {
      const response = await fetch(`/api/management?month=${month}&year=${year}`);
      const data: ManagementRecord[] | { error?: string } = await response.json();

      if (!response.ok) {
        throw new Error("No se pudo consultar management");
      }

      const parsedData = Array.isArray(data) ? data : [];
      setRecords(parsedData);
      setOpenCreateModal(parsedData.length === 0);
    } catch (error) {
      setLoadError("No se pudieron cargar los registros para la fecha consultada.");
      setRecords([]);
      setOpenCreateModal(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchRecordsByDate(baseRequestDate);
  }, [baseRequestDate]);

  const handleCreateRecord = async () => {
    const amount = Number(initialAmount);
    if (!Number.isInteger(amount) || amount <= 0) {
      setCreateError("El monto debe ser un numero entero positivo.");
      return;
    }

    setIsSubmitting(true);
    setCreateError(null);

    try {
      const response = await fetch("/api/management", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          initialAmount: amount,
          creationDate: `${creationDate}T00:00:00.000Z`,
          deductions: [],
        }),
      });

      if (!response.ok) {
        throw new Error("No se pudo crear el registro");
      }

      setOpenCreateModal(false);
      await fetchRecordsByDate(baseRequestDate);
    } catch (error) {
      setCreateError("No se pudo crear el registro.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenDeductionModal = (record: ManagementRecord) => {
    setSelectedRecord(record);
    setDeductionDescription("");
    setDeductionAmount("");
    setDeductionError(null);
    setOpenDeductionModal(true);
  };

  const handleOpenViewDeductionsModal = (record: ManagementRecord) => {
    setSelectedRecord(record);
    setDraftDeductions(record.deductions);
    setEditingDeductionIndex(null);
    setViewDeductionsError(null);
    setOpenViewDeductionsModal(true);
  };

  const handleDraftDeductionChange = (
    index: number,
    key: keyof Deduction,
    value: string
  ) => {
    setDraftDeductions((previous) =>
      previous.map((item, currentIndex) => {
        if (currentIndex !== index) {
          return item;
        }

        if (key === "amount") {
          return { ...item, amount: Number(value) };
        }

        return { ...item, description: value };
      })
    );
  };

  const validateDeduction = (deduction: Deduction): boolean => {
    const description = deduction.description.trim();
    if (description.length < 3 || description.length > 50) {
      return false;
    }

    if (!Number.isInteger(deduction.amount)) {
      return false;
    }

    return true;
  };

  const handleCreateDeduction = async () => {
    if (!selectedRecord) {
      setDeductionError("No se encontro el registro para agregar la deduccion.");
      return;
    }

    const amount = Number(deductionAmount);
    if (deductionDescription.trim().length < 3 || deductionDescription.trim().length > 50) {
      setDeductionError("La descripcion debe tener entre 3 y 50 caracteres.");
      return;
    }

    if (!Number.isInteger(amount)) {
      setDeductionError("El monto de la deduccion debe ser un numero entero.");
      return;
    }

    setIsSubmittingDeduction(true);
    setDeductionError(null);

    try {
      const updatedDeductions = [
        ...selectedRecord.deductions,
        {
          description: deductionDescription.trim(),
          amount,
        },
      ];

      const response = await fetch("/api/management", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedRecord.id,
          date: selectedRecord.creationDate,
          deductions: updatedDeductions,
        }),
      });

      if (!response.ok) {
        throw new Error("No se pudo crear la deduccion");
      }

      setOpenDeductionModal(false);
      setSelectedRecord(null);
      await fetchRecordsByDate(baseRequestDate);
    } catch (error) {
      setDeductionError("No se pudo crear la deduccion.");
    } finally {
      setIsSubmittingDeduction(false);
    }
  };

  const handleUpdateDeductions = async () => {
    if (!selectedRecord) {
      setViewDeductionsError("No se encontro el registro para actualizar deducciones.");
      return;
    }

    if (!draftDeductions.every((item) => validateDeduction(item))) {
      setViewDeductionsError(
        "Cada deduccion debe tener descripcion de 3 a 50 caracteres y monto entero."
      );
      return;
    }

    setIsUpdatingDeductions(true);
    setViewDeductionsError(null);

    try {
      const response = await fetch("/api/management", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedRecord.id,
          date: selectedRecord.creationDate,
          deductions: draftDeductions.map((item) => ({
            description: item.description.trim(),
            amount: item.amount,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error("No se pudo actualizar deducciones");
      }

      setOpenViewDeductionsModal(false);
      setSelectedRecord(null);
      setEditingDeductionIndex(null);
      await fetchRecordsByDate(baseRequestDate);
    } catch (error) {
      setViewDeductionsError("No se pudo actualizar las deducciones.");
    } finally {
      setIsUpdatingDeductions(false);
    }
  };

  return (
    <Stack
      spacing={4}
      sx={{
        minHeight: "100vh",
        justifyContent: "center",
        alignItems: "center",
        px: 2,
        backgroundColor: DARK_BG,
        color: TEXT_PRIMARY,
      }}
    >
      <Typography variant="h2" sx={{ fontWeight: 700, textAlign: "center", color: TEXT_PRIMARY, paddingTop: { xs: 10, sm: 2 } }}>
        {t.management.title}
      </Typography>
      {isDevelopment && isValidDateString(DEV_INITIAL_REQUEST_DATE) ? (
        <Alert severity="info" sx={{ width: "100%", maxWidth: 760 }}>
          Fecha de emulacion activa para desarrollo: {DEV_INITIAL_REQUEST_DATE}
        </Alert>
      ) : null}
      {isLoading ? (
        <CircularProgress sx={{ color: BLUE_DEEP }} />
      ) : (
        <Stack spacing={2} sx={{ width: "100%", maxWidth: 760 }}>
          {loadError ? (
            <Alert severity="error">{loadError}</Alert>
          ) : records.length === 0 ? (
            <Alert severity="info">
              No hay registros para la fecha consultada. Crea uno nuevo desde el modal.
            </Alert>
          ) : (
            records.map((record) => {
              const deductionTotal = record.deductions.reduce((sum, item) => sum + item.amount, 0);
              const dailyAvailableAmount = record.initialAmount / currentDateMetrics.totalDaysInMonth;
              const availableBeforeDeductions =
                dailyAvailableAmount * currentDateMetrics.currentDayOfMonth;
              const availableAmount = availableBeforeDeductions - deductionTotal;

              return (
                <Box
                  key={record.id}
                  sx={{
                    backgroundColor: SURFACE_BG,
                    border: `1px solid ${BORDER_COLOR}`,
                    borderRadius: 2,
                    p: 2,
                  }}
                >
                  <Typography sx={{ color: TEXT_SECONDARY, mt: 2, mb: 1 }}>
                    Fecha de creación: {new Date(record.creationDate).toLocaleDateString()}
                  </Typography>
                  <Stack spacing={3} sx={{ mt: 2, width: "100%", mb: 3 }}>
                    <hr />
                    <Box
                      sx={{
                        ...valuePillSx,
                        borderColor: BLUE_DEEP,
                        backgroundColor: availableAmount > 0 ? "#0b1b42" : "#ff0000",
                        borderWidth: 2,
                        boxShadow: availableAmount > 0 ? "0 0 0 1px rgba(29, 78, 216, 0.35), 0 10px 24px rgba(29, 78, 216, 0.25)" : "0 0 0 1px rgba(255, 0, 0, 0.35), 0 10px 24px rgba(255, 0, 0, 0.25)",
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{ color: "#bfdbfe", fontWeight: 700, letterSpacing: 0.3 }}
                      >
                        Disponible
                      </Typography>
                      <Typography
                        sx={{
                          color: availableAmount > 0 ? "#ffffff" : "#000",
                          fontWeight: 800,
                          textAlign: "right",
                          fontSize: { xs: "1.15rem", sm: "1.35rem" },
                          lineHeight: 1.2,
                        }}
                      >
                        {currencyFormatter.format(availableAmount)}
                      </Typography>
                    </Box>
                    <hr />
                    <Box sx={valuePillSx}>
                      <Typography variant="caption" sx={{ color: TEXT_SECONDARY }}>
                        Monto inicial
                      </Typography>
                      <Typography sx={{ color: TEXT_PRIMARY, fontWeight: 600, textAlign: "right" }}>
                        {currencyFormatter.format(record.initialAmount)}
                      </Typography>
                    </Box>
                    <Box sx={valuePillSx}>
                      <Typography variant="caption" sx={{ color: TEXT_SECONDARY }}>
                        Deducciones
                      </Typography>
                      <Typography sx={{ color: TEXT_PRIMARY, fontWeight: 600, textAlign: "right" }}>
                        {currencyFormatter.format(deductionTotal)}
                      </Typography>
                    </Box>
                    <Box sx={valuePillSx}>
                      <Typography variant="caption" sx={{ color: TEXT_SECONDARY }}>
                        Dias del mes
                      </Typography>
                      <Typography sx={{ color: TEXT_PRIMARY, fontWeight: 600, textAlign: "right" }}>
                        {currentDateMetrics.totalDaysInMonth}
                      </Typography>
                    </Box>
                    <Box sx={valuePillSx}>
                      <Typography variant="caption" sx={{ color: TEXT_SECONDARY }}>
                        Dia actual
                      </Typography>
                      <Typography sx={{ color: TEXT_PRIMARY, fontWeight: 600, textAlign: "right" }}>
                        {currentDateMetrics.currentDayOfMonth}
                      </Typography>
                    </Box>
                    <Box sx={valuePillSx}>
                      <Typography variant="caption" sx={{ color: TEXT_SECONDARY }}>
                        Disponible antes
                      </Typography>
                      <Typography sx={{ color: TEXT_PRIMARY, fontWeight: 600, textAlign: "right" }}>
                        {currencyFormatter.format(availableBeforeDeductions)}
                      </Typography>
                    </Box>
                  </Stack>
                  <Button
                    variant="outlined"
                    onClick={() => handleOpenDeductionModal(record)}
                    sx={{ ...outlinedButtonSx, mt: 1, width: { xs: "100%", sm: "auto" } }}
                  >
                    Agregar deduccion
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => handleOpenViewDeductionsModal(record)}
                    sx={{ ...outlinedButtonSx, mt: 1, ml: { xs: 0, sm: 1 }, width: { xs: "100%", sm: "auto" } }}
                  >
                    Ver deducciones
                  </Button>
                </Box>
              );
            })
          )}
        </Stack>
      )}
      <Link href="/" style={{ textDecoration: "none" }}>
        <Button
          variant="contained"
          size="large"
          sx={{
            backgroundColor: BLUE_DEEP,
            color: TEXT_PRIMARY,
            "&:hover": { backgroundColor: "#1e40af" },
            mb: 5
          }}
        >
          {t.common.backToHome}
        </Button>
      </Link>
      <Dialog
        open={openDeductionModal}
        onClose={() => setOpenDeductionModal(false)}
        fullWidth
        maxWidth="sm"
        sx={dialogSx}
      >
        <DialogTitle>Agregar deduccion</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Descripcion"
              value={deductionDescription}
              onChange={(event) => setDeductionDescription(event.target.value)}
              fullWidth
              sx={textFieldSx}
            />
            <TextField
              label="Monto de deduccion"
              type="number"
              value={deductionAmount}
              onChange={(event) => setDeductionAmount(event.target.value)}
              fullWidth
              sx={textFieldSx}
            />
            {deductionError ? <Alert severity="error">{deductionError}</Alert> : null}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeductionModal(false)} sx={outlinedButtonSx}>
            Cerrar
          </Button>
          <Button
            onClick={handleCreateDeduction}
            variant="contained"
            disabled={isSubmittingDeduction}
            sx={{
              backgroundColor: BLUE_DEEP,
              color: TEXT_PRIMARY,
              "&:hover": { backgroundColor: "#1e40af" },
            }}
          >
            {isSubmittingDeduction ? "Guardando..." : "Agregar deduccion"}
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={openViewDeductionsModal}
        onClose={() => setOpenViewDeductionsModal(false)}
        fullWidth
        maxWidth="md"
        sx={dialogSx}
      >
        <DialogTitle>Deducciones del registro</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {draftDeductions.length === 0 ? (
              <Alert severity="info">Este registro no tiene deducciones.</Alert>
            ) : (
              draftDeductions.map((deduction, index) => {
                const isEditing = editingDeductionIndex === index;

                return (
                  <Box
                    key={`${deduction.description}-${index}`}
                    sx={{
                      border: `1px solid ${BORDER_COLOR}`,
                      borderRadius: 2,
                      p: 2,
                      backgroundColor: SURFACE_BG,
                    }}
                  >
                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: "minmax(220px, 1fr) minmax(160px, 220px) auto",
                        gap: 1.5,
                        alignItems: "center",
                      }}
                    >
                      <TextField
                        label="Descripcion"
                        value={deduction.description}
                        onChange={(event) =>
                          handleDraftDeductionChange(index, "description", event.target.value)
                        }
                        fullWidth
                        disabled={!isEditing}
                        sx={textFieldSx}
                      />
                      <TextField
                        label="Monto"
                        type="number"
                        value={deduction.amount}
                        onChange={(event) =>
                          handleDraftDeductionChange(index, "amount", event.target.value)
                        }
                        fullWidth
                        disabled={!isEditing}
                        sx={textFieldSx}
                      />
                      <Button
                        variant="outlined"
                        sx={outlinedButtonSx}
                        onClick={() => {
                          if (isEditing && !validateDeduction(deduction)) {
                            setViewDeductionsError(
                              "La deduccion editada no es valida. Revisa descripcion y monto."
                            );
                            return;
                          }

                          setViewDeductionsError(null);
                          setEditingDeductionIndex(isEditing ? null : index);
                        }}
                      >
                        {isEditing ? "Guardar" : "Editar"}
                      </Button>
                    </Box>
                  </Box>
                );
              })
            )}
            {viewDeductionsError ? <Alert severity="error">{viewDeductionsError}</Alert> : null}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenViewDeductionsModal(false)} sx={outlinedButtonSx}>
            Cerrar
          </Button>
          <Button
            onClick={handleUpdateDeductions}
            variant="contained"
            disabled={isUpdatingDeductions || editingDeductionIndex !== null}
            sx={{
              backgroundColor: BLUE_DEEP,
              color: TEXT_PRIMARY,
              "&:hover": { backgroundColor: "#1e40af" },
            }}
          >
            {isUpdatingDeductions ? "Actualizando..." : "Actualizar registro"}
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={openCreateModal}
        onClose={() => setOpenCreateModal(false)}
        fullWidth
        maxWidth="sm"
        sx={dialogSx}
      >
        <DialogTitle>Crear registro de management</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Monto inicial"
              type="number"
              value={initialAmount}
              onChange={(event) => setInitialAmount(event.target.value)}
              fullWidth
              sx={textFieldSx}
            />
            <TextField
              label="Fecha de creacion"
              type="date"
              value={creationDate}
              onChange={(event) => setCreationDate(event.target.value)}
              fullWidth
              sx={textFieldSx}
              slotProps={{ inputLabel: { shrink: true } }}
            />
            {createError ? <Alert severity="error">{createError}</Alert> : null}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreateModal(false)} sx={outlinedButtonSx}>
            Cerrar
          </Button>
          <Button
            onClick={handleCreateRecord}
            variant="contained"
            disabled={isSubmitting}
            sx={{
              backgroundColor: BLUE_DEEP,
              color: TEXT_PRIMARY,
              "&:hover": { backgroundColor: "#1e40af" },
            }}
          >
            {isSubmitting ? "Creando..." : "Crear registro"}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
