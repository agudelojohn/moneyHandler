"use client";

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Stack,
  Typography
} from "@mui/material";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { formatDateAsYyyyMmDd, formatDateWithMonthName, getDateFromDateString, getElapsedDaysInRange, getInclusiveDaysBetween, isValidDateString } from "../common/utils/dateHelpers";
import { useI18n } from "../i18n/I18nProvider";
import { COLORS } from "../theme";
import { DeductionModal } from "./components/DeductionModal";
import { ListDeductionsModal } from "./components/ListDeductionsModal";
import * as Sx from "./styles";
import type { Deduction, ManagementRecord } from "./types";
import { CreateManagementModal } from "./components/CreateManagementModal";
import { useUserSession, withUserIdHeader } from "../common/userSession";

// Cambia este valor para emular la fecha de las peticiones en desarrollo.
// Usa formato YYYY-MM-DD. Ejemplo: "2026-01-15"
const DEV_INITIAL_REQUEST_DATE = "";

const DateTypography = ({ labelText, date }: { labelText: string, date: string }) => {
  return (
    <Typography sx={{ color: COLORS.TEXT_SECONDARY, mt: 2, mb: 1 }}>
      {labelText}: {date}
    </Typography>
  )
}

const ItemValueTypography = ({ labelText, value }: { labelText: string, value: string }) => {
  return (
    <Box sx={Sx.valuePillSx}>
      <Typography variant="caption" sx={Sx.itemLabelSx}>
        {labelText}
      </Typography>
      <Typography sx={Sx.itemValueSx}>
        {value}
      </Typography>
    </Box>)
}


export default function ManagementPage() {
  const { t } = useI18n();
  const { activeUser } = useUserSession();
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
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [openDeductionModal, setOpenDeductionModal] = useState(false);
  const [managementRecord, setSelectedRecord] = useState<ManagementRecord | null>(null);
  const [openViewDeductionsModal, setOpenViewDeductionsModal] = useState(false);
  const [deductionsCollection, setDeductionsCollection] = useState<Deduction[]>([]);
  const [deletingDeductionIndex, setDeletingDeductionIndex] = useState<number | null>(null);

  const baseRequestDate = useMemo(() => {
    if (isDevelopment && isValidDateString(DEV_INITIAL_REQUEST_DATE)) {
      return DEV_INITIAL_REQUEST_DATE;
    }
    return formatDateAsYyyyMmDd(new Date());
  }, [isDevelopment]);

  const fetchRecordsByDate = useCallback(async (dateString: string) => {
    if (!activeUser) {
      setIsLoading(false);
      setLoadError("Debes seleccionar un usuario en la pantalla principal.");
      setRecords([]);
      setOpenCreateModal(false);
      return;
    }

    setIsLoading(true);
    setLoadError(null);

    try {
      const response = await fetch(`/api/management?date=${dateString}`, {
        headers: withUserIdHeader(activeUser.userId),
      });
      const data: ManagementRecord[] | { error?: string } = await response.json();

      if (!response.ok) {
        throw new Error("No se pudo consultar management");
      }

      const parsedData = Array.isArray(data)
        ? data.map((record) => ({
          ...record,
          deductions: Array.isArray(record.deductions)
            ? record.deductions.map((deduction) => ({
              ...deduction,
              isCredit: Boolean(deduction.isCredit),
            }))
            : [],
        }))
        : [];
      setRecords(parsedData);
      setOpenCreateModal(parsedData.length === 0);
    } catch {
      setLoadError("No se pudieron cargar los registros para la fecha consultada.");
      setRecords([]);
      setOpenCreateModal(false);
    } finally {
      setIsLoading(false);
    }
  }, [activeUser]);

  useEffect(() => {
    if (!activeUser) return;

    const timeoutId = window.setTimeout(() => {
      void fetchRecordsByDate(baseRequestDate);
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [activeUser, baseRequestDate, fetchRecordsByDate]);

  const handleOpenAddDeductionModal = (record: ManagementRecord) => {
    setSelectedRecord(record);
    setOpenDeductionModal(true);
  };

  const handleOpenViewDeductionsModal = (record: ManagementRecord) => {
    setSelectedRecord(record);
    setDeductionsCollection(
      record.deductions.map((item) => ({
        ...item,
        isCredit: Boolean(item.isCredit),
      }))
    );
    setOpenViewDeductionsModal(true);
  };

  const handleDraftDeductionChange = (
    index: number,
    key: keyof Deduction,
    value: string | boolean
  ) => {
    setDeductionsCollection((previous) =>
      previous.map((item, currentIndex) => {
        if (currentIndex !== index) {
          return item;
        }

        if (key === "amount") {
          return { ...item, amount: Number(value) };
        }

        if (key === "isCredit") {
          return { ...item, isCredit: Boolean(value) };
        }

        return { ...item, description: String(value) };
      })
    );
  };

  if (!activeUser) {
    return (
      <Stack spacing={3} sx={Sx.mainStackSx}>
        <Typography variant="h2" sx={Sx.titleSx}>{t.management.title}</Typography>
        <Alert severity="info">Debes seleccionar un usuario en la pantalla principal.</Alert>
        <Link href="/" style={{ textDecoration: "none" }}>
          <Button variant="contained" size="large" sx={Sx.backButtonSx}>
            {t.common.backToHome}
          </Button>
        </Link>
      </Stack>
    );
  }

  return (
    <Stack spacing={4} sx={Sx.mainStackSx}>
      <Typography variant="h2" sx={Sx.titleSx}>{t.management.title}</Typography>

      {/* Section: Development alert ONLY IN DEVELOPMENT MODE */}
      {isDevelopment && isValidDateString(DEV_INITIAL_REQUEST_DATE) ? (
        <Alert severity="info" sx={{ width: "100%", maxWidth: 760 }}>
          Fecha de emulación activa para desarrollo: {DEV_INITIAL_REQUEST_DATE}
        </Alert>
      ) : null}
      {/* End Section: Development alert ONLY IN DEVELOPMENT MODE */}

      {isLoading ? (
        <CircularProgress sx={{ color: COLORS.BLUE_DEEP }} />
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
              const referenceDate = getDateFromDateString(baseRequestDate);
              const startDate = new Date(record.startDate ?? record.creationDate);
              const endDate = new Date(record.endDate ?? record.creationDate);
              const totalDaysInRange = getInclusiveDaysBetween(startDate, endDate);
              const elapsedDays = getElapsedDaysInRange(referenceDate, startDate, endDate);
              const dailyAvailableAmount = record.initialAmount / totalDaysInRange;
              const availableBeforeDeductions = dailyAvailableAmount * elapsedDays;
              const availableAmount = availableBeforeDeductions - deductionTotal;

              return (
                <Box key={record.id} sx={Sx.containerSx} >
                  <DateTypography labelText="Fecha de creación" date={formatDateWithMonthName(new Date(record.creationDate))} />
                  <DateTypography labelText="Rango" date={`${formatDateWithMonthName(startDate)} - ${formatDateWithMonthName(endDate)}`} />

                  <Stack spacing={3} sx={{ mt: 2, width: "100%", mb: 3 }}>

                    <hr />
                    <Box sx={Sx.mainValuePillSx(availableAmount)}>
                      <Typography variant="caption" sx={Sx.valueTypographySx}>
                        {t.management.available}
                      </Typography>
                      <Typography sx={Sx.mainValueTypographySx(availableAmount)}>
                        {currencyFormatter.format(availableAmount)}
                      </Typography>
                    </Box>
                    <hr />

                    <ItemValueTypography labelText={t.management.initialAmount} value={currencyFormatter.format(record.initialAmount)} />
                    <ItemValueTypography labelText={t.management.deductions} value={currencyFormatter.format(deductionTotal)} />
                    <ItemValueTypography labelText={t.management.rangeDays} value={totalDaysInRange.toString()} />
                    <ItemValueTypography labelText={t.management.elapsedDays} value={elapsedDays.toString()} />
                    <ItemValueTypography labelText={t.management.dailyAvailable} value={currencyFormatter.format(dailyAvailableAmount)} />
                    <ItemValueTypography labelText={t.management.expectedPocket} value={currencyFormatter.format(record.initialAmount - deductionTotal)} />
                  </Stack>

                  <Button
                    variant="outlined"
                    onClick={() => handleOpenAddDeductionModal(record)}
                    sx={{ ...Sx.outlinedButtonSx, mt: 1, width: { xs: "100%" }, backgroundColor: '#0b1b42', "&:hover": { backgroundColor: "#1e40af" } }}
                  >
                    {t.management.addDeduction}
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => handleOpenViewDeductionsModal(record)}
                    sx={{ ...Sx.outlinedButtonSx, mt: 2, mb: 1, width: { xs: "100%" } }}
                  >
                    {t.management.viewDeductions}
                  </Button>
                </Box>
              );
            })
          )}
        </Stack>
      )}
      <Link href="/" style={{ textDecoration: "none" }}>
        <Button variant="contained" size="large" sx={Sx.backButtonSx}>
          {t.common.backToHome}
        </Button>
      </Link>

      <DeductionModal openDeductionModal={openDeductionModal}
        setOpenDeductionModal={setOpenDeductionModal}
        managementRecord={managementRecord}
        setSelectedRecord={setSelectedRecord}
        fetchRecordsByDate={fetchRecordsByDate}
        baseRequestDate={baseRequestDate}
        activeUserId={activeUser?.userId ?? ""}
      />

      <ListDeductionsModal
        managementRecord={managementRecord}
        openViewDeductionsModal={openViewDeductionsModal}
        setOpenViewDeductionsModal={setOpenViewDeductionsModal}
        deductionsCollection={deductionsCollection}
        handleDraftDeductionChange={handleDraftDeductionChange}
        currencyFormatter={currencyFormatter}
        setSelectedRecord={setSelectedRecord}
        fetchRecordsByDate={fetchRecordsByDate}
        baseRequestDate={baseRequestDate}
        setDeletingDeductionIndex={setDeletingDeductionIndex}
        deletingDeductionIndex={deletingDeductionIndex}
        setDeductionsCollection={setDeductionsCollection}
        activeUserId={activeUser?.userId ?? ""}
      />

      <CreateManagementModal
        openCreateModal={openCreateModal}
        setOpenCreateModal={setOpenCreateModal}
        fetchRecordsByDate={fetchRecordsByDate}
        baseRequestDate={baseRequestDate}
        activeUserId={activeUser?.userId ?? ""}
      />

    </Stack>
  );
}
