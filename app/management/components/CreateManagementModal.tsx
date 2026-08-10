"use client";

import AddRoundedIcon from "@mui/icons-material/AddRounded";
import {
    Alert,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Stack,
    TextField,
    Typography,
    Checkbox,
    FormControlLabel,
} from "@mui/material";
import { useState } from "react";
import {
    formatDateAsYyyyMmDd,
    formatDateWithMonthName,
    isValidDateRangeOrder,
    isValidDateString,
    parseStoredDateValue,
    utcIsoToLocalCalendarDay,
} from "../../common/utils/dateHelpers";
import { useI18n } from "../../i18n/I18nProvider";
import { createManagementRecord } from "../services/managementApi";
import * as Sx from "../styles";
import { ManagementRecordCreate, StaticPayment } from "../types";
import { getCategoryLabel } from "@/app/i18n/translations";
import { useCategories } from "@/app/common/categoriesSession";
import StaticPaymentField from "@/app/components/StaticPaymentField";

interface CreateManagementModalProps {
    openCreateModal: boolean;
    setOpenCreateModal: (open: boolean) => void;
    fetchRecordsByDate: (dateString: string) => Promise<void>;
    baseRequestDate: string;
    activeUserId: string;
    categoryId: string;
    suggestedRangeDate: { startDate: string; endDate: string } | null;
}

export const CreateManagementModal = ({
    openCreateModal,
    setOpenCreateModal,
    fetchRecordsByDate,
    baseRequestDate,
    activeUserId,
    categoryId,
    suggestedRangeDate,
}: CreateManagementModalProps) => {
    const { t } = useI18n();
    const { categories } = useCategories();
    const category = categories.find((item) => item.id === categoryId) ?? null;

    const [initialAmount, setInitialAmount] = useState("");
    const [rangeStartDate, setRangeStartDate] = useState(() => formatDateAsYyyyMmDd(new Date()));
    const [rangeEndDate, setRangeEndDate] = useState(() => formatDateAsYyyyMmDd(new Date()));
    const [createError, setCreateError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [useSuggestedRange, setUseSuggestedRange] = useState(false);
    const [staticPayments, setStaticPayments] = useState<StaticPayment[]>([]);

    function updateStaticPaymentAt(index: number, patch: Partial<StaticPayment>) {
        setStaticPayments((prev) =>
            prev.map((item, i) => (i === index ? { ...item, ...patch } : item)),
        );
    }

    function handleDeleteStaticPaymentAt(index: number) {
        setStaticPayments((prev) => prev.filter((_, i) => i !== index));
    }

    const hasValidRangeDates = isValidDateString(rangeStartDate) && isValidDateString(rangeEndDate);
    const hasInvalidRangeOrder = hasValidRangeDates && !isValidDateRangeOrder(rangeStartDate, rangeEndDate);

    const handleCreateRecord = async () => {
        const amount = Number(initialAmount);
        if (!Number.isInteger(amount) || amount <= 0) {
            setCreateError(t.management.initialAmountValidationError);
            return;
        }
        if (!hasValidRangeDates) {
            setCreateError(t.management.invalidRangeDatesError);
            return;
        }
        if (hasInvalidRangeOrder) {
            setCreateError(t.management.invalidRangeOrderError);
            return;
        }

        setIsSubmitting(true);
        setCreateError(null);

        try {
            const managementRecord: ManagementRecordCreate = {
                categoryId,
                initialAmount: amount,
                creationDate: new Date().toISOString(),
                startDate: rangeStartDate,
                endDate: rangeEndDate,
                deductions: [],
                staticPayments,
            };
            await createManagementRecord(managementRecord, activeUserId);

            setOpenCreateModal(false);
            await fetchRecordsByDate(baseRequestDate);
        } catch (error) {
            setCreateError(error instanceof Error ? error.message : t.management.createRecordError);
        } finally {
            setIsSubmitting(false);
        }
    };

    function handleUseSuggestedRange() {
        setUseSuggestedRange(prev => {
            const newUseSuggestedRange = !prev;
            if (newUseSuggestedRange) {
                setRangeStartDate(utcIsoToLocalCalendarDay(suggestedRangeDate?.startDate || ""));
                setRangeEndDate(utcIsoToLocalCalendarDay(suggestedRangeDate?.endDate || ""));
            } else {
                setRangeStartDate(formatDateAsYyyyMmDd(new Date()));
                setRangeEndDate(formatDateAsYyyyMmDd(new Date()));
            }
            return newUseSuggestedRange;
        });
    }

    return (
        <>
            <Dialog
                open={openCreateModal}
                onClose={() => setOpenCreateModal(false)}
                fullWidth
                maxWidth="sm"
                sx={Sx.dialogSx}
            >
                <DialogTitle>{t.management.createManagementTitle}: {category ? getCategoryLabel(category, t) : ""}</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={Sx.createDeductionStackSx}>
                        <TextField
                            label={t.management.initialAmount}
                            type="number"
                            value={initialAmount}
                            onChange={(event) => setInitialAmount(event.target.value)}
                            fullWidth
                            sx={Sx.textFieldSx}
                        />
                        {suggestedRangeDate ? (
                            <div style={{ display: "flex", justifyContent: "space-between", paddingLeft: 16 }}>
                                <div style={{ display: "flex", alignItems: "start", flexDirection: "column", gap: 6 }}>
                                    <Typography variant="h6" color="text.secondary">
                                        {t.management.suggestedRangeDate}:{" "}
                                    </Typography>
                                    <Typography variant="subtitle1" color="text.secondary">
                                        {`${formatDateWithMonthName(parseStoredDateValue(suggestedRangeDate.startDate))} - ${formatDateWithMonthName(parseStoredDateValue(suggestedRangeDate.endDate))}`}
                                    </Typography>
                                </div>
                                <FormControlLabel
                                    control={<Checkbox checked={useSuggestedRange} onChange={handleUseSuggestedRange} />}
                                    label={t.management.useSuggestedRange}
                                    sx={{ m: 0, ml: -5 }}
                                />
                            </div>
                        ) : null}
                        <TextField
                            label={t.management.rangeStartDate}
                            type="date"
                            value={rangeStartDate}
                            onChange={(event) => setRangeStartDate(event.target.value)}
                            fullWidth
                            sx={Sx.textFieldSx}
                            error={hasInvalidRangeOrder}
                            helperText={hasInvalidRangeOrder ? t.management.invalidRangeOrderError : undefined}
                            slotProps={{
                                inputLabel: { shrink: true },
                                htmlInput: { max: hasValidRangeDates ? rangeEndDate : undefined },
                            }}
                        />
                        <TextField
                            label={t.management.rangeEndDate}
                            type="date"
                            value={rangeEndDate}
                            onChange={(event) => setRangeEndDate(event.target.value)}
                            fullWidth
                            sx={Sx.textFieldSx}
                            error={hasInvalidRangeOrder}
                            helperText={hasInvalidRangeOrder ? t.management.invalidRangeOrderError : undefined}
                            slotProps={{
                                inputLabel: { shrink: true },
                                htmlInput: { min: hasValidRangeDates ? rangeStartDate : undefined },
                            }}
                        />
                        <Stack sx={Sx.StaticPaymentsStackSx}>
                            <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                                {t.management.staticPayments}
                            </Typography>
                            <hr style={{ width: '100%', borderColor: 'rgb(120 116 116)', borderWidth: 1 }} />
                            {staticPayments.map((payment, index) => (
                                <StaticPaymentField
                                    key={index}
                                    payment={payment}
                                    onChange={(patch) => updateStaticPaymentAt(index, patch)}
                                    onDelete={() => handleDeleteStaticPaymentAt(index)}
                                />
                            ))}
                            <Button
                                type="button"
                                variant="outlined"
                                startIcon={<AddRoundedIcon />}
                                onClick={() =>
                                    setStaticPayments((prev) => [
                                        ...prev,
                                        {
                                            paymentDay: null,
                                            description: "",
                                            amount: 0,
                                            isCredit: false,
                                            isPayed: false,
                                        },
                                    ])
                                }
                                sx={Sx.managementAddDeductionButtonSx}
                            >
                                {t.management.addStaticPayment}
                            </Button>
                        </Stack>
                        {createError ? <Alert severity="error">{createError}</Alert> : null}
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenCreateModal(false)} sx={Sx.outlinedButtonSx}>
                        {t.management.close}
                    </Button>
                    <Button
                        onClick={handleCreateRecord}
                        variant="contained"
                        disabled={isSubmitting || hasInvalidRangeOrder}
                        sx={Sx.createManagementRecordButtonSx}
                    >
                        {isSubmitting ? t.management.creatingRecord : t.expenses.createRecord}
                    </Button>
                </DialogActions>
            </Dialog>
        </>)
}
