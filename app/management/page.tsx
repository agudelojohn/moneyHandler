"use client";


import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  IconButton,
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
  localCalendarDayToUtcIso,
  getElapsedDaysInRange,
  getInclusiveDaysBetween,
  isValidDateString,
} from "../common/utils/dateHelpers";
import { useI18n } from "../i18n/I18nProvider";
import { getCategoryLabel } from "../i18n/translations";
import { DeductionModal } from "./components/DeductionModal";
import { ListDeductionsModal } from "./components/ListDeductionsModal";
import { ListStaticPaymentsModal } from "./components/ListStaticPaymentsModal";
import * as Sx from "./styles";
import type { Deduction, ManagementRecord } from "./types";
import { CreateManagementModal } from "./components/CreateManagementModal";
import { EditRangeModal } from "./components/EditRangeModal";
import { useUserSession, withUserIdHeader } from "../common/userSession";
import { useCategories } from "../common/categoriesSession";
import { EXPENSES_CATEGORY_ID } from "@/lib/aws/schemas/common";
import ManageCategoriesModal from "./components/ManageCategoriesModal";

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
  const { categories, isLoading } = useCategories();
  const [openManageCategories, setOpenManageCategories] = useState(false);

  return (
    <Stack sx={Sx.categoryGateRootSx}>
      <Stack spacing={2} sx={Sx.categoryGateContentSx}>
        <Typography variant="h4" sx={Sx.categoryGateTitleSx}>
          {t.management.selectCategoryTitle}
        </Typography>
        <Typography sx={Sx.categoryGateSubtitleSx}>{t.management.selectCategorySubtitle}</Typography>
        <Stack sx={Sx.categoryGatePillsRowSx}>
          {isLoading ? (
            <CircularProgress />
          ) : (
            categories.map((category) => (
              <Button
                key={category.id}
                onClick={() =>
                  router.push(`/management?category=${encodeURIComponent(category.id)}`)
                }
                variant="outlined"
                size="large"
                sx={Sx.categoryGatePillButtonSx}
              >
                {getCategoryLabel(category, t)}
              </Button>
            ))
          )}
        </Stack>
        <Stack sx={Sx.categoryGateHomeRowSx}>
          <Button
            variant="outlined"
            size="large"
            onClick={() => setOpenManageCategories(true)}
            sx={{...Sx.managementTopBarOutlinedButtonSx, marginBottom: 2}}
          >
            {t.categoriesManager.manageButton}
          </Button>
          <Link href="/" style={{ textDecoration: "none" }}>
            <Button variant="contained" size="large" sx={Sx.primaryContainedButtonSx}>
              {t.common.backToHome}
            </Button>
          </Link>
        </Stack>
      </Stack>
      <ManageCategoriesModal
        open={openManageCategories}
        onClose={() => setOpenManageCategories(false)}
      />
    </Stack>
  );
}

function ManagementTopBar({ categoryId }: { categoryId: string }) {
  const { t } = useI18n();
  const router = useRouter();
  const { categories } = useCategories();
  const category = categories.find((item) => item.id === categoryId) ?? null;
  const categoryLabel = category ? getCategoryLabel(category, t) : categoryId;

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
        <Chip label={categoryLabel} sx={Sx.managementTopBarCategoryChipSx} />
      </Stack>
    </Container>
  );
}

function ManagementWorkspace({ categoryId: initialCategoryId }: { categoryId: string }) {
  const { t } = useI18n();
  const { activeUser } = useUserSession();
  const { categories } = useCategories();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(initialCategoryId);

  useEffect(() => {
    setSelectedCategoryId(initialCategoryId);
  }, [initialCategoryId]);

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
  const [openEditRangeModal, setOpenEditRangeModal] = useState(false);
  const [openDeductionModal, setOpenDeductionModal] = useState(false);
  const [managementRecord, setSelectedRecord] = useState<ManagementRecord | null>(null);
  const [openViewDeductionsModal, setOpenViewDeductionsModal] = useState(false);
  const [openStaticPaymentsModal, setOpenStaticPaymentsModal] = useState(false);
  const [staticPaymentsModalRecordId, setStaticPaymentsModalRecordId] = useState<string | null>(null);
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
        const requestDateIso = localCalendarDayToUtcIso(dateString);
        const response = await fetch(
          `/api/management?date=${encodeURIComponent(requestDateIso)}&categoryId=${encodeURIComponent(selectedCategoryId)}`,
          {
            headers: withUserIdHeader(activeUser.userId),
          }
        );
        const allCategoriesData = await Promise.all(categories.map(async (category) => {
          const response = await fetch(
            `/api/management?date=${encodeURIComponent(requestDateIso)}&categoryId=${encodeURIComponent(category.id)}`,
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
                isPayed: Boolean(deduction.isPayed),
              }))
              : [],
            staticPayments: Array.isArray(record.staticPayments)
              ? record.staticPayments.map((staticPayment) => ({
                ...staticPayment,
                isCredit: Boolean(staticPayment.isCredit),
                isPayed: Boolean(staticPayment.isPayed),
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
    [activeUser, selectedCategoryId, categories]
  );

  useEffect(() => {
    setIsExpensesCategory(selectedCategoryId === EXPENSES_CATEGORY_ID);
  }, [selectedCategoryId]);

  const staticPaymentsModalRecord = useMemo(() => {
    if (!staticPaymentsModalRecordId) {
      return null;
    }
    return records.find((r) => r.id === staticPaymentsModalRecordId) ?? null;
  }, [records, staticPaymentsModalRecordId]);

  useEffect(() => {
    if (!activeUser) return;

    const timeoutId = window.setTimeout(() => {
      void fetchRecordsByDate(baseRequestDate);
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [activeUser, baseRequestDate, fetchRecordsByDate]);

  const handleOpenEditRangeModal = (record: ManagementRecord) => {
    setSelectedRecord(record);
    setOpenEditRangeModal(true);
  };

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

  const handleOpenStaticPaymentsModal = (record: ManagementRecord) => {
    setStaticPaymentsModalRecordId(record.id);
    setOpenStaticPaymentsModal(true);
  };

  const handleStaticPaymentsModalOpenChange = useCallback((open: boolean) => {
    setOpenStaticPaymentsModal(open);
    if (!open) {
      setStaticPaymentsModalRecordId(null);
    }
  }, []);

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
        <ManagementTopBar categoryId={selectedCategoryId} />
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
      <ManagementTopBar categoryId={selectedCategoryId} />
      <Stack spacing={4} sx={Sx.managementWorkspaceContentStackSx}>
        <Typography variant="h2" sx={Sx.titleSx}>
          {t.management.title}
        </Typography>

        {isDevelopment && <>
          <Alert severity="info" sx={Sx.managementDevAlertSx}>DEVELOPMENT MODE</Alert>
          {isValidDateString(DEV_INITIAL_REQUEST_DATE) && (
            <Alert severity="info" sx={Sx.managementDevAlertSx}>
              Fecha de emulación activa para desarrollo: {DEV_INITIAL_REQUEST_DATE}
            </Alert>)}
        </>}

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
                const staticPaymentsTotal = record.staticPayments.length > 0 ? record.staticPayments.reduce((sum, item) => sum + item.amount, 0) : 0;
                const staticPaymentsPaidTotal = record.staticPayments.reduce(
                  (sum, item) => (item.isPayed ? sum + item.amount : sum),
                  0
                );
                const deductionTotal = record.deductions.reduce((sum, item) => sum + item.amount, 0);
                const referenceDate = getDateFromDateString(baseRequestDate);
                const startDate = new Date(record.startDate ?? record.creationDate);
                const endDate = new Date(record.endDate ?? record.creationDate);
                const totalDaysInRange = getInclusiveDaysBetween(startDate, endDate);
                const elapsedDays = getElapsedDaysInRange(referenceDate, startDate, endDate);
                const dailyAvailableAmount = (record.initialAmount - staticPaymentsTotal) / totalDaysInRange;
                const availableBeforeDeductions = dailyAvailableAmount * elapsedDays;

                const availableLessDeductions = (availableBeforeDeductions) - deductionTotal;
                const initialLessDeductions = (record.initialAmount - staticPaymentsTotal) - deductionTotal;
                const availableAmount = isExpensesCategory ? availableLessDeductions : initialLessDeductions;

                return (
                  <Box key={record.id} sx={Sx.containerSx}>
                    <DateTypography
                      labelText="Fecha de creación"
                      date={formatDateWithMonthName(new Date(record.creationDate))}
                    />
                    <Box sx={Sx.rangeDateRowSx}>
                      <Typography sx={Sx.rangeDateLabelSx}>
                        {t.management.rangeLabel}: {`${formatDateWithMonthName(startDate)} - ${formatDateWithMonthName(endDate)}`}
                      </Typography>
                      <IconButton
                        type="button"
                        size="small"
                        onClick={() => handleOpenEditRangeModal(record)}
                        aria-label={t.management.editRangeAria}
                        sx={Sx.editRangeButtonSx}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Box>

                    <Stack spacing={3} sx={Sx.managementRecordBodyStackSx}>
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
                      <Stack sx={Sx.staticPaymentsSummaryGridSx}>
                        <ItemValueTypography
                          labelText={t.management.staticPayments}
                          value={currencyFormatter.format(record.staticPayments.reduce((sum, item) => sum + item.amount, 0))}
                        />
                        <Button
                          type="button"
                          variant="outlined"
                          sx={Sx.staticPaymentsViewButtonSx}
                          onClick={() => handleOpenStaticPaymentsModal(record)}
                          aria-label={t.management.viewStaticPaymentsAria}
                        >
                          <VisibilityIcon />
                        </Button>
                      </Stack>
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
                        value={currencyFormatter.format(record.initialAmount - deductionTotal - staticPaymentsPaidTotal)}
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

        <EditRangeModal
          openEditRangeModal={openEditRangeModal}
          setOpenEditRangeModal={setOpenEditRangeModal}
          managementRecord={managementRecord}
          setSelectedRecord={setSelectedRecord}
          fetchRecordsByDate={fetchRecordsByDate}
          baseRequestDate={baseRequestDate}
          activeUserId={activeUser?.userId ?? ""}
          categoryId={selectedCategoryId}
        />

        <DeductionModal
          openDeductionModal={openDeductionModal}
          setOpenDeductionModal={setOpenDeductionModal}
          managementRecord={managementRecord}
          setSelectedRecord={setSelectedRecord}
          fetchRecordsByDate={fetchRecordsByDate}
          baseRequestDate={baseRequestDate}
          activeUserId={activeUser?.userId ?? ""}
          categoryId={selectedCategoryId}
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
          categoryId={selectedCategoryId}
        />

        <CreateManagementModal
          openCreateModal={openCreateModal}
          setOpenCreateModal={setOpenCreateModal}
          fetchRecordsByDate={fetchRecordsByDate}
          baseRequestDate={baseRequestDate}
          activeUserId={activeUser?.userId ?? ""}
          categoryId={selectedCategoryId}
          suggestedRangeDate={suggestedRangeDate}
        />

        <ListStaticPaymentsModal
          managementRecord={staticPaymentsModalRecord}
          openStaticPaymentsModal={openStaticPaymentsModal}
          setOpenStaticPaymentsModal={handleStaticPaymentsModalOpenChange}
          currencyFormatter={currencyFormatter}
          fetchRecordsByDate={fetchRecordsByDate}
          baseRequestDate={baseRequestDate}
          activeUserId={activeUser?.userId ?? ""}
          categoryId={selectedCategoryId}
        />
      </Stack>
    </>
  );
}

function ManagementPageContent() {
  const searchParams = useSearchParams();
  const { categories, isLoading } = useCategories();
  const raw = searchParams.get("category");
  const validCategoryId = raw && categories.some((category) => category.id === raw) ? raw : null;

  if (isLoading) {
    return <ManagementLoading />;
  }

  if (!validCategoryId) {
    return <CategoryGate />;
  }

  return <ManagementWorkspace categoryId={validCategoryId} />;
}

export default function ManagementPage() {
  return (
    <Suspense fallback={<ManagementLoading />}>
      <ManagementPageContent />
    </Suspense>
  );
}
