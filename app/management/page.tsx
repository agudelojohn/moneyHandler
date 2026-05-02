"use client";

import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Stack,
  Typography,
} from "@mui/material";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import {
  formatDateAsYyyyMmDd,
  formatDateWithMonthName,
  getDateFromDateString,
  getElapsedDaysInRange,
  getInclusiveDaysBetween,
  isValidDateString,
} from "../common/utils/dateHelpers";
import { useI18n } from "../i18n/I18nProvider";
import type { CategoryKey } from "../i18n/translations";
import { DeductionModal } from "./components/DeductionModal";
import { ListDeductionsModal } from "./components/ListDeductionsModal";
import * as Sx from "./styles";
import type { Deduction, ManagementRecord } from "./types";
import { CreateManagementModal } from "./components/CreateManagementModal";
import { useUserSession, withUserIdHeader } from "../common/userSession";
import { CATEGORIES, type ExpenseCategory, isExpenseCategory } from "@/lib/aws/schemas/common";

// Cambia este valor para emular la fecha de las peticiones en desarrollo.
// Usa formato YYYY-MM-DD. Ejemplo: "2026-01-15"
const DEV_INITIAL_REQUEST_DATE = "";

const DateTypography = ({ labelText, date }: { labelText: string; date: string }) => {
  return (
    <Typography sx={Sx.dateTypographyLabelSx}>
      {labelText}: {date}
    </Typography>
  );
};

const ItemValueTypography = ({ labelText, value }: { labelText: string; value: string }) => {
  return (
    <Box sx={Sx.valuePillSx}>
      <Typography variant="caption" sx={Sx.itemLabelSx}>
        {labelText}
      </Typography>
      <Typography sx={Sx.itemValueSx}>{value}</Typography>
    </Box>
  );
};

function ManagementLoading() {
  return (
    <Stack sx={Sx.managementLoadingStackSx}>
      <CircularProgress sx={Sx.managementLoadingProgressSx} />
    </Stack>
  );
}

function CategoryGate() {
  const { t } = useI18n();
  const router = useRouter();

  return (
    <Stack sx={Sx.categoryGateRootSx}>
      <Stack spacing={2} sx={Sx.categoryGateContentSx}>
        <Typography variant="h4" sx={Sx.categoryGateTitleSx}>
          {t.management.selectCategoryTitle}
        </Typography>
        <Typography sx={Sx.categoryGateSubtitleSx}>{t.management.selectCategorySubtitle}</Typography>
        <Stack sx={Sx.categoryGatePillsRowSx}>
          {CATEGORIES.map((category) => (
            <Button
              key={category}
              onClick={() =>
                router.push(`/management?category=${encodeURIComponent(category)}`)
              }
              variant="outlined"
              size="large"
              sx={Sx.categoryGatePillButtonSx}
            >
              {t.categories[category as CategoryKey]}
            </Button>
          ))}
        </Stack>
        <Stack sx={Sx.categoryGateHomeRowSx}>
          <Link href="/" style={{ textDecoration: "none" }}>
            <Button variant="contained" size="large" sx={Sx.primaryContainedButtonSx}>
              {t.common.backToHome}
            </Button>
          </Link>
        </Stack>
      </Stack>
    </Stack>
  );
}

function ManagementTopBar({ category }: { category: ExpenseCategory }) {
  const { t } = useI18n();
  const router = useRouter();

  return (
    <Container maxWidth={false} disableGutters sx={Sx.managementTopBarContainerSx}>
      <Stack sx={Sx.managementTopBarStackSx}>
        <Link href="/" style={{ textDecoration: "none" }}>
          <Button variant="contained" size="large" sx={Sx.primaryContainedButtonSx}>
            {t.common.backToHome}
          </Button>
        </Link>
        <Button
          variant="outlined"
          size="large"
          onClick={() => router.push("/management")}
          sx={Sx.managementTopBarOutlinedButtonSx}
        >
          {t.expenses.changeCategory}
        </Button>
        <Chip label={t.categories[category as CategoryKey]} sx={Sx.managementTopBarCategoryChipSx} />
      </Stack>
    </Container>
  );
}

function ManagementWorkspace({ category: initialCategory }: { category: ExpenseCategory }) {
  const { t } = useI18n();
  const { activeUser } = useUserSession();
  const [selectedCategory, setSelectedCategory] = useState<ExpenseCategory>(initialCategory);

  useEffect(() => {
    setSelectedCategory(initialCategory);
  }, [initialCategory]);

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
  const [suggestedRangeDate, setSuggestedRangeDate] = useState<{ startDate: string; endDate: string } | null>(null);
  const [isExpensesCategory, setIsExpensesCategory] = useState(false);

  const baseRequestDate = useMemo(() => {
    if (isDevelopment && isValidDateString(DEV_INITIAL_REQUEST_DATE)) {
      return DEV_INITIAL_REQUEST_DATE;
    }
    return formatDateAsYyyyMmDd(new Date());
  }, [isDevelopment]);

  const fetchRecordsByDate = useCallback(
    async (dateString: string) => {
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
        const response = await fetch(
          `/api/management?date=${encodeURIComponent(dateString)}&category=${encodeURIComponent(selectedCategory)}`,
          {
            headers: withUserIdHeader(activeUser.userId),
          }
        );
        const allCategoriesData = await Promise.all(CATEGORIES.map(async (category) => {
          const response = await fetch(
            `/api/management?date=${encodeURIComponent(dateString)}&category=${encodeURIComponent(category)}`,
            {
              headers: withUserIdHeader(activeUser.userId),
            }
          );
          return response.json();
        }));

        const firstValidRecord = allCategoriesData.find((record) => record.length > 0)?.[0];

        if (firstValidRecord) {
          const suggestedRangeDate = {
            startDate: firstValidRecord.startDate,
            endDate: firstValidRecord.endDate,
          }
          setSuggestedRangeDate(suggestedRangeDate);
        }
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
    },
    [activeUser, selectedCategory]
  );

  useEffect(() => {
    setIsExpensesCategory(selectedCategory === CATEGORIES[0]);
  }, [selectedCategory]);

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
      <>
        <ManagementTopBar category={selectedCategory} />
        <Stack spacing={3} sx={Sx.managementWorkspaceContentStackSx}>
          <Typography variant="h2" sx={Sx.titleSx}>
            {t.management.title}
          </Typography>
          <Alert severity="info">Debes seleccionar un usuario en la pantalla principal.</Alert>
          <Link href="/" style={{ textDecoration: "none" }}>
            <Button variant="contained" size="large" sx={Sx.backButtonSx}>
              {t.common.backToHome}
            </Button>
          </Link>
        </Stack>
      </>
    );
  }

  return (
    <>
      <ManagementTopBar category={selectedCategory} />
      <Stack spacing={4} sx={Sx.managementWorkspaceContentStackSx}>
        <Typography variant="h2" sx={Sx.titleSx}>
          {t.management.title}
        </Typography>

        {isDevelopment && isValidDateString(DEV_INITIAL_REQUEST_DATE) ? (
          <Alert severity="info" sx={Sx.managementDevAlertSx}>
            Fecha de emulación activa para desarrollo: {DEV_INITIAL_REQUEST_DATE}
          </Alert>
        ) : null}

        {isLoading ? (
          <CircularProgress sx={Sx.managementMainLoadingProgressSx} />
        ) : (
          <Stack spacing={2} sx={Sx.managementRecordsColumnSx}>
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
                  <Box key={record.id} sx={Sx.containerSx}>
                    <DateTypography
                      labelText="Fecha de creación"
                      date={formatDateWithMonthName(new Date(record.creationDate))}
                    />
                    <DateTypography
                      labelText="Rango"
                      date={`${formatDateWithMonthName(startDate)} - ${formatDateWithMonthName(endDate)}`}
                    />

                    <Stack spacing={3} sx={Sx.managementRecordBodyStackSx}>
                      <hr />
                      <Box sx={Sx.mainValuePillSx(availableAmount)}>
                        <Typography variant="caption" sx={Sx.valueTypographySx}>
                          {t.management.available}
                        </Typography>
                        <Typography sx={Sx.mainValueTypographySx(availableAmount)}>
                          {isExpensesCategory ? currencyFormatter.format(availableAmount) : currencyFormatter.format(record.initialAmount - deductionTotal)}
                        </Typography>
                      </Box>
                      <hr />

                      <ItemValueTypography
                        labelText={t.management.initialAmount}
                        value={currencyFormatter.format(record.initialAmount)}
                      />
                      <ItemValueTypography
                        labelText={t.management.deductions}
                        value={currencyFormatter.format(deductionTotal)}
                      />
                      {isExpensesCategory && <>
                        <ItemValueTypography
                          labelText={t.management.rangeDays}
                          value={totalDaysInRange.toString()}
                        />
                        <ItemValueTypography
                          labelText={t.management.elapsedDays}
                          value={elapsedDays.toString()}
                        />
                        <ItemValueTypography
                          labelText={t.management.dailyAvailable}
                          value={currencyFormatter.format(dailyAvailableAmount)}
                        />
                      </>}

                      <ItemValueTypography
                        labelText={t.management.expectedPocket}
                        value={currencyFormatter.format(record.initialAmount - deductionTotal)}
                      />
                    </Stack>

                    <Button
                      variant="outlined"
                      onClick={() => handleOpenAddDeductionModal(record)}
                      sx={Sx.managementAddDeductionButtonSx}
                    >
                      {t.management.addDeduction}
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={() => handleOpenViewDeductionsModal(record)}
                      sx={Sx.managementViewDeductionsButtonSx}
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

        <DeductionModal
          openDeductionModal={openDeductionModal}
          setOpenDeductionModal={setOpenDeductionModal}
          managementRecord={managementRecord}
          setSelectedRecord={setSelectedRecord}
          fetchRecordsByDate={fetchRecordsByDate}
          baseRequestDate={baseRequestDate}
          activeUserId={activeUser?.userId ?? ""}
          category={selectedCategory}
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
          category={selectedCategory}
        />

        <CreateManagementModal
          openCreateModal={openCreateModal}
          setOpenCreateModal={setOpenCreateModal}
          fetchRecordsByDate={fetchRecordsByDate}
          baseRequestDate={baseRequestDate}
          activeUserId={activeUser?.userId ?? ""}
          category={selectedCategory}
          suggestedRangeDate={suggestedRangeDate}
        />
      </Stack>
    </>
  );
}

function ManagementPageContent() {
  const searchParams = useSearchParams();
  const raw = searchParams.get("category");
  const categoryParam = raw && isExpenseCategory(raw) ? raw : null;

  if (!categoryParam) {
    return <CategoryGate />;
  }

  return <ManagementWorkspace category={categoryParam} />;
}

export default function ManagementPage() {
  return (
    <Suspense fallback={<ManagementLoading />}>
      <ManagementPageContent />
    </Suspense>
  );
}
