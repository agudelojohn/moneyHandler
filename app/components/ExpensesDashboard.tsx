"use client";

import { CATEGORIES } from "@/lib/aws/schemas/common";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type Category = (typeof CATEGORIES)[number];

type ExpenseItem = {
  PK: string;
  SK: string;
  id: string;
  amount: number;
  description: string;
  date: string;
  category: Category;
  userId?: string | null;
  type?: string;
};

type ExpenseFormState = {
  amount: string;
  description: string;
  date: string;
  category: Category;
};

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(amount);

const toLocalDateInputValue = (date: Date) => {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().split("T")[0];
};

const buildIsoFromInputDate = (dateInput: string) =>
  new Date(dateInput).toISOString();
const normalizeDescriptionKey = (value: string) =>
  value.toLowerCase().replaceAll(" ", "");

const initialForm = (): ExpenseFormState => ({
  amount: "",
  description: "",
  date: toLocalDateInputValue(new Date()),
  category: CATEGORIES[0],
});
const SELECT_DESCRIPTION = "__SELECT_DESCRIPTION__";

const yearlyRangeIso = () => {
  const year = new Date().getFullYear();
  const startDate = new Date(Date.UTC(year, 0, 1, 0, 0, 0, 0)).toISOString();
  const endDate = new Date(Date.UTC(year, 11, 31, 23, 59, 59, 999)).toISOString();
  return { startDate, endDate };
};

const yearlyDateInputRange = () => {
  const year = new Date().getFullYear();
  return {
    startDate: `${year}-01-01`,
    endDate: `${year}-12-31`,
  };
};

function EvolutionChart({ items }: { items: ExpenseItem[] }) {
  if (!items.length) {
    return (
      <Box
        sx={{
          height: 220,
          borderRadius: 3,
          border: "1px dashed",
          borderColor: "divider",
          display: "grid",
          placeItems: "center",
        }}
      >
        <Typography variant="body2" color="text.secondary">
          Sin datos para mostrar en el grafico.
        </Typography>
      </Box>
    );
  }

  const sorted = [...items].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const chartData = sorted.map((item) => ({
    ...item,
    chartDate: new Intl.DateTimeFormat("es-CO", {
      day: "2-digit",
      month: "short",
    }).format(new Date(item.date)),
  }));

  return (
    <Box sx={{ width: "100%", height: 260 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 12, right: 18, left: 8, bottom: 6 }}>
          <CartesianGrid strokeDasharray="4 4" stroke="#e2e8f0" />
          <XAxis dataKey="chartDate" tick={{ fontSize: 12 }} />
          <YAxis
            dataKey="amount"
            tick={{ fontSize: 12 }}
            tickFormatter={(value: number) => formatCurrency(value)}
          />
          <Tooltip
            formatter={(value) => {
              const numericValue = typeof value === "number" ? value : Number(value ?? 0);
              return formatCurrency(numericValue);
            }}
            labelFormatter={(_, payload) => {
              const row = payload?.[0]?.payload as ExpenseItem | undefined;
              if (!row) return "";
              return new Intl.DateTimeFormat("es-CO", { dateStyle: "medium" }).format(
                new Date(row.date)
              );
            }}
          />
          <Line
            type="monotone"
            dataKey="amount"
            stroke="#6f5ef9"
            strokeWidth={3}
            dot={{ r: 4, fill: "#2b6bef", strokeWidth: 0 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </Box>
  );
}

export default function ExpensesDashboard() {
  const { startDate: initialChartStartDate, endDate: initialChartEndDate } =
    yearlyDateInputRange();
  const [selectedCategory, setSelectedCategory] = useState<Category>(CATEGORIES[0]);
  const [selectedDescription, setSelectedDescription] = useState<string>(SELECT_DESCRIPTION);
  const [chartStartDate, setChartStartDate] = useState(initialChartStartDate);
  const [chartEndDate, setChartEndDate] = useState(initialChartEndDate);
  const [items, setItems] = useState<ExpenseItem[]>([]);
  const [searchValue, setSearchValue] = useState("");
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [form, setForm] = useState<ExpenseFormState>(initialForm());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const selectedItem = useMemo(
    () => items.find((item) => item.id === selectedItemId) ?? null,
    [items, selectedItemId]
  );

  const filteredItems = useMemo(() => {
    const query = searchValue.trim().toLowerCase();
    if (!query) return items;
    return items.filter((item) => {
      const byDescription = item.description.toLowerCase().includes(query);
      const byDate = new Intl.DateTimeFormat("es-CO", { dateStyle: "medium" })
        .format(new Date(item.date))
        .toLowerCase()
        .includes(query);
      return byDescription || byDate || item.id.toLowerCase().includes(query);
    });
  }, [items, searchValue]);

  const totalAmount = useMemo(
    () => items.reduce((acc, item) => acc + Number(item.amount), 0),
    [items]
  );

  const descriptionAmountMap = useMemo(() => {
    const mappedDescriptions = new Map<string, { label: string; amount: number }>();
    for (const item of items) {
      const normalizedKey = normalizeDescriptionKey(item.description);
      const current = mappedDescriptions.get(normalizedKey);
      mappedDescriptions.set(
        normalizedKey,
        current
          ? { ...current, amount: current.amount + Number(item.amount) }
          : { label: item.description, amount: Number(item.amount) }
      );
    }
    return mappedDescriptions;
  }, [items]);

  const chartItems = useMemo(() => {
    if (!selectedCategory || selectedDescription === SELECT_DESCRIPTION) return [];

    const byDescription = items.filter(
      (item) => normalizeDescriptionKey(item.description) === selectedDescription
    );

    if (!chartStartDate || !chartEndDate) return byDescription;
    const start = new Date(`${chartStartDate}T00:00:00`).getTime();
    const end = new Date(`${chartEndDate}T23:59:59.999`).getTime();
    if (Number.isNaN(start) || Number.isNaN(end) || start > end) return [];

    return byDescription.filter((item) => {
      const itemDate = new Date(item.date).getTime();
      return itemDate >= start && itemDate <= end;
    });
  }, [items, selectedDescription, chartStartDate, chartEndDate]);

  const rangeError = useMemo(() => {
    if (!chartStartDate || !chartEndDate) return null;
    return chartStartDate > chartEndDate
      ? "El rango de fechas de la grafica es invalido."
      : null;
  }, [chartStartDate, chartEndDate]);

  useEffect(() => {
    if (selectedDescription === SELECT_DESCRIPTION) return;
    if (!descriptionAmountMap.has(selectedDescription)) {
      setSelectedDescription(SELECT_DESCRIPTION);
    }
  }, [descriptionAmountMap, selectedDescription]);

  const loadExpenses = useCallback(async (category: Category) => {
    setError(null);
    setSuccessMessage(null);
    const { startDate, endDate } = yearlyRangeIso();
    const params = new URLSearchParams({ startDate, endDate, category });
    const response = await fetch(`/api/expenses?${params.toString()}`, {
      cache: "no-store",
    });
    if (!response.ok) {
      throw new Error("No se pudieron cargar los gastos");
    }
    const payload = (await response.json()) as ExpenseItem[];
    setItems(
      [...payload].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    );
  }, []);

  const handleCategoryChange = async (category: Category) => {
    setSelectedCategory(category);
    setSelectedDescription(SELECT_DESCRIPTION);
    setSelectedItemId(null);
    setForm(initialForm());
  };

  const handleSelectItem = (item: ExpenseItem) => {
    setSelectedItemId(item.id);
    setForm({
      amount: String(item.amount),
      description: item.description,
      date: toLocalDateInputValue(new Date(item.date)),
      category: item.category,
    });
    setSuccessMessage(null);
    setError(null);
  };

  const resetForm = () => {
    setSelectedItemId(null);
    setForm(initialForm());
  };

  const saveExpense = async () => {
    setError(null);
    setSuccessMessage(null);
    const amount = Number(form.amount);
    if (!Number.isInteger(amount) || amount <= 0) {
      setError("El monto debe ser un numero entero positivo.");
      return;
    }
    if (form.description.trim().length < 3) {
      setError("La descripcion debe tener minimo 3 caracteres.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (selectedItem) {
        const payload = {
          id: selectedItem.id,
          PK: selectedItem.PK,
          SK: selectedItem.SK,
          amount,
          description: form.description.trim(),
          date: buildIsoFromInputDate(form.date),
          category: form.category,
          userId: selectedItem.userId ?? null,
        };

        const response = await fetch("/api/expenses", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!response.ok) throw new Error("No se pudo actualizar el gasto.");
        setSuccessMessage("Gasto actualizado correctamente.");
      } else {
        const payload = {
          amount,
          description: form.description.trim(),
          date: buildIsoFromInputDate(form.date),
          category: form.category,
          userId: null,
        };
        const response = await fetch("/api/expenses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!response.ok) throw new Error("No se pudo crear el gasto.");
        setSuccessMessage("Gasto creado correctamente.");
      }

      await loadExpenses(selectedCategory);
      resetForm();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Error inesperado");
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteExpense = async (item: ExpenseItem) => {
    const shouldDelete = window.confirm(
      "Esta accion eliminara el registro seleccionado. Deseas continuar?"
    );
    if (!shouldDelete) return;
    setError(null);
    setSuccessMessage(null);
    setIsSubmitting(true);
    try {
      const params = new URLSearchParams({ date: item.date, id: item.id });
      const response = await fetch(`/api/expenses?${params.toString()}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("No se pudo eliminar el gasto.");
      await loadExpenses(selectedCategory);
      if (selectedItemId === item.id) resetForm();
      setSuccessMessage("Gasto eliminado correctamente.");
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Error inesperado");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const run = async () => {
      try {
        await loadExpenses(selectedCategory);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Error inesperado");
      }
    };
    void run();
  }, [loadExpenses, selectedCategory]);

  return (
    <Stack spacing={3} sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ fontWeight: 800 }}>
        Control de Expenses
      </Typography>
      <Typography color="text.secondary">
        Visualiza la evolucion anual por categoria, crea nuevos registros y gestiona
        los existentes desde una sola vista.
      </Typography>

      <Card sx={{ borderRadius: 4 }}>
        <CardContent>
          <Stack spacing={2}>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              sx={{
                justifyContent: "space-between",
              }}
            >
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                <FormControl size="small" sx={{ minWidth: 240 }}>
                  <InputLabel id="category-select-label">Categoria</InputLabel>
                  <Select
                    labelId="category-select-label"
                    value={selectedCategory}
                    label="Categoria"
                    onChange={(event) =>
                      void handleCategoryChange(event.target.value as Category)
                    }
                  >
                    {CATEGORIES.map((category) => (
                      <MenuItem key={category} value={category}>
                        {category}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl size="small" sx={{ minWidth: 280 }}>
                  <InputLabel id="description-select-label">Descripcion</InputLabel>
                  <Select
                    labelId="description-select-label"
                    value={selectedDescription}
                    label="Descripcion"
                    onChange={(event) => setSelectedDescription(event.target.value)}
                  >
                    <MenuItem value={SELECT_DESCRIPTION}>Seleccione una descripcion</MenuItem>
                    {Array.from(descriptionAmountMap.entries()).map(([descriptionKey, data]) => (
                      <MenuItem key={descriptionKey} value={descriptionKey}>
                        {data.label} - {formatCurrency(data.amount)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <TextField
                  label="Desde (grafica)"
                  type="date"
                  size="small"
                  value={chartStartDate}
                  onChange={(event) => setChartStartDate(event.target.value)}
                  sx={{ minWidth: 190 }}
                />
                <TextField
                  label="Hasta (grafica)"
                  type="date"
                  size="small"
                  value={chartEndDate}
                  onChange={(event) => setChartEndDate(event.target.value)}
                  sx={{ minWidth: 190 }}
                />
              </Stack>
              <Chip
                color="primary"
                variant="outlined"
                label={`Total anual: ${formatCurrency(totalAmount)}`}
              />
            </Stack>
            {rangeError && <Alert severity="warning">{rangeError}</Alert>}
            <EvolutionChart items={[...chartItems].reverse()} />
          </Stack>
        </CardContent>
      </Card>

      {error && <Alert severity="error">{error}</Alert>}
      {successMessage && <Alert severity="success">{successMessage}</Alert>}

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ borderRadius: 4, height: "100%" }}>
            <CardContent>
              <Stack spacing={2}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {selectedItem ? "Editar gasto" : "Nuevo gasto"}
                </Typography>
                <TextField
                  label="Monto"
                  value={form.amount}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, amount: event.target.value }))
                  }
                  size="small"
                  type="number"
                />
                <TextField
                  label="Descripcion"
                  value={form.description}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, description: event.target.value }))
                  }
                  size="small"
                />
                <TextField
                  label="Fecha"
                  value={form.date}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, date: event.target.value }))
                  }
                  type="date"
                  size="small"
                  // InputLabelProps={{ shrink: true }}
                />
                <FormControl size="small">
                  <InputLabel id="category-form-label">Categoria</InputLabel>
                  <Select
                    labelId="category-form-label"
                    label="Categoria"
                    value={form.category}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        category: event.target.value as Category,
                      }))
                    }
                  >
                    {CATEGORIES.map((category) => (
                      <MenuItem key={category} value={category}>
                        {category}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Stack direction="row" spacing={1}>
                  <Button
                    onClick={() => void saveExpense()}
                    disabled={isSubmitting}
                    variant="contained"
                    startIcon={selectedItem ? <SaveRoundedIcon /> : <AddRoundedIcon />}
                  >
                    {selectedItem ? "Guardar cambios" : "Crear registro"}
                  </Button>
                  <Button onClick={resetForm} disabled={isSubmitting} variant="text">
                    Limpiar
                  </Button>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 8 }}>
          <Card sx={{ borderRadius: 4 }}>
            <CardContent>
              <Stack spacing={2}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Busqueda y gestion
                </Typography>
                <TextField
                  size="small"
                  placeholder="Buscar por descripcion, fecha o ID"
                  value={searchValue}
                  onChange={(event) => setSearchValue(event.target.value)}
                />
                <Box sx={{ maxHeight: 380, overflow: "auto" }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Fecha</TableCell>
                        <TableCell>Descripcion</TableCell>
                        <TableCell>Valor</TableCell>
                        <TableCell>Acciones</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredItems.map((item) => (
                        <TableRow
                          key={item.id}
                          selected={item.id === selectedItemId}
                          hover
                        >
                          <TableCell>
                            {new Intl.DateTimeFormat("es-CO", {
                              dateStyle: "medium",
                            }).format(new Date(item.date))}
                          </TableCell>
                          <TableCell>{item.description}</TableCell>
                          <TableCell>{formatCurrency(item.amount)}</TableCell>
                          <TableCell>
                            <Stack direction="row" spacing={1}>
                              <Button
                                size="small"
                                variant="outlined"
                                startIcon={<EditRoundedIcon />}
                                onClick={() => handleSelectItem(item)}
                              >
                                Editar
                              </Button>
                              <Button
                                size="small"
                                color="error"
                                variant="outlined"
                                startIcon={<DeleteOutlineRoundedIcon />}
                                onClick={() => void deleteExpense(item)}
                              >
                                Eliminar
                              </Button>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      ))}
                      {!filteredItems.length && (
                        <TableRow>
                          <TableCell colSpan={4}>
                            <Typography variant="body2" color="text.secondary">
                              No hay resultados para esta categoria en el anio actual.
                            </Typography>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Stack>
  );
}
