"use client";

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
    getDateFromDateString,
    isValidDateString,
    parseStoredDateValue,
} from "../../common/utils/dateHelpers";
import { useI18n } from "../../i18n/I18nProvider";
import { createManagementRecord } from "../services/managementApi";
import * as Sx from "../styles";
import { ManagementRecordCreate } from "../types";
import { CategoryKey } from "@/app/i18n/translations";

interface CreateManagementModalProps {
    openCreateModal: boolean;
    setOpenCreateModal: (open: boolean) => void;
    fetchRecordsByDate: (dateString: string) => Promise<void>;
    baseRequestDate: string;
    activeUserId: string;
    category: string;
    suggestedRangeDate: { startDate: string; endDate: string } | null;
}

export const CreateManagementModal = ({
    openCreateModal,
    setOpenCreateModal,
    fetchRecordsByDate,
    baseRequestDate,
    activeUserId,
    category,
    suggestedRangeDate,
}: CreateManagementModalProps) => {
    const { t } = useI18n();

    const [initialAmount, setInitialAmount] = useState("");
    const [rangeStartDate, setRangeStartDate] = useState(() => formatDateAsYyyyMmDd(new Date()));
    const [rangeEndDate, setRangeEndDate] = useState(() => formatDateAsYyyyMmDd(new Date()));
    const [createError, setCreateError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [useSuggestedRange, setUseSuggestedRange] = useState(false);
    const handleCreateRecord = async () => {
        const amount = Number(initialAmount);
        if (!Number.isInteger(amount) || amount <= 0) {
            setCreateError(t.management.initialAmountValidationError);
            return;
        }
        if (!isValidDateString(rangeStartDate) || !isValidDateString(rangeEndDate)) {
            setCreateError(t.management.invalidRangeDatesError);
            return;
        }
        if (getDateFromDateString(rangeStartDate).getTime() > getDateFromDateString(rangeEndDate).getTime()) {
            setCreateError(t.management.invalidRangeOrderError);
            return;
        }

        setIsSubmitting(true);
        setCreateError(null);

        try {
            const managementRecord: ManagementRecordCreate = {
                category,
                initialAmount: amount,
                creationDate: new Date().toISOString(),
                startDate: rangeStartDate,
                endDate: rangeEndDate,
                deductions: [],
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
                setRangeStartDate(formatDateAsYyyyMmDd(new Date(suggestedRangeDate?.startDate || "")));
                setRangeEndDate(formatDateAsYyyyMmDd(new Date(suggestedRangeDate?.endDate || "")));
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
                <DialogTitle>{t.management.createManagementTitle}: {t.categories[category as CategoryKey]}</DialogTitle>
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
                            slotProps={{ inputLabel: { shrink: true } }}
                        />
                        <TextField
                            label={t.management.rangeEndDate}
                            type="date"
                            value={rangeEndDate}
                            onChange={(event) => setRangeEndDate(event.target.value)}
                            fullWidth
                            sx={Sx.textFieldSx}
                            slotProps={{ inputLabel: { shrink: true } }}
                        />
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
                        disabled={isSubmitting}
                        sx={Sx.createManagementRecordButtonSx}
                    >
                        {isSubmitting ? t.management.creatingRecord : t.expenses.createRecord}
                    </Button>
                </DialogActions>
            </Dialog>
        </>)
}
