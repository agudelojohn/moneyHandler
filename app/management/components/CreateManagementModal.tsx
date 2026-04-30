"use client";

import {
    Alert,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Stack,
    TextField
} from "@mui/material";
import { useState } from "react";
import { formatDateAsYyyyMmDd, getDateFromDateString, isValidDateString } from "../../common/utils/dateHelpers";
import { useI18n } from "../../i18n/I18nProvider";
import { createManagementRecord } from "../services/managementApi";
import * as Sx from "../styles";
import { ManagementRecordCreate } from "../types";

interface CreateManagementModalProps {
    openCreateModal: boolean;
    setOpenCreateModal: (open: boolean) => void;
    fetchRecordsByDate: (dateString: string) => Promise<void>;
    baseRequestDate: string;
}

export const CreateManagementModal = ({ openCreateModal, setOpenCreateModal, fetchRecordsByDate, baseRequestDate }: CreateManagementModalProps) => {
    const { t } = useI18n();

    const [initialAmount, setInitialAmount] = useState("");
    const [rangeStartDate, setRangeStartDate] = useState(() => formatDateAsYyyyMmDd(new Date()));
    const [rangeEndDate, setRangeEndDate] = useState(() => formatDateAsYyyyMmDd(new Date()));
    const [createError, setCreateError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

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
                initialAmount: amount,
                creationDate: new Date().toISOString(),
                startDate: rangeStartDate,
                endDate: rangeEndDate,
                deductions: [],
            };
            await createManagementRecord(managementRecord);

            setOpenCreateModal(false);
            await fetchRecordsByDate(baseRequestDate);
        } catch (error) {
            setCreateError(error instanceof Error ? error.message : t.management.createRecordError);
        } finally {
            setIsSubmitting(false);
        }
    };


    return (
        <>
            <Dialog
                open={openCreateModal}
                onClose={() => setOpenCreateModal(false)}
                fullWidth
                maxWidth="sm"
                sx={Sx.dialogSx}
            >
                <DialogTitle>{t.management.createManagementTitle}</DialogTitle>
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
