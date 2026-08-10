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
} from "@mui/material";
import { useEffect, useState } from "react";
import {
    formatDateAsYyyyMmDd,
    isValidDateRangeOrder,
    isValidDateString,
    utcIsoToLocalCalendarDay,
} from "../../common/utils/dateHelpers";
import { useI18n } from "../../i18n/I18nProvider";
import { updateRangeInManagementRecord } from "../services/managementApi";
import * as Sx from "../styles";
import type { ManagementRecord } from "../types";

type EditRangeModalProps = {
    openEditRangeModal: boolean;
    setOpenEditRangeModal: (open: boolean) => void;
    managementRecord: ManagementRecord | null;
    setSelectedRecord: (record: ManagementRecord | null) => void;
    fetchRecordsByDate: (dateString: string) => Promise<void>;
    baseRequestDate: string;
    activeUserId: string;
    categoryId: string;
};

export const EditRangeModal = ({
    openEditRangeModal,
    setOpenEditRangeModal,
    managementRecord,
    setSelectedRecord,
    fetchRecordsByDate,
    baseRequestDate,
    activeUserId,
    categoryId,
}: EditRangeModalProps) => {
    const { t } = useI18n();
    const [rangeStartDate, setRangeStartDate] = useState(() => formatDateAsYyyyMmDd(new Date()));
    const [rangeEndDate, setRangeEndDate] = useState(() => formatDateAsYyyyMmDd(new Date()));
    const [updateError, setUpdateError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!openEditRangeModal || !managementRecord) {
            return;
        }

        const startSource = managementRecord.startDate ?? managementRecord.creationDate;
        const endSource = managementRecord.endDate ?? managementRecord.creationDate;
        setRangeStartDate(utcIsoToLocalCalendarDay(startSource));
        setRangeEndDate(utcIsoToLocalCalendarDay(endSource));
        setUpdateError(null);
    }, [openEditRangeModal, managementRecord]);

    const handleClose = () => {
        setOpenEditRangeModal(false);
        setSelectedRecord(null);
        setUpdateError(null);
    };

    const hasValidRangeDates = isValidDateString(rangeStartDate) && isValidDateString(rangeEndDate);
    const hasInvalidRangeOrder = hasValidRangeDates && !isValidDateRangeOrder(rangeStartDate, rangeEndDate);

    const handleUpdateRange = async () => {
        if (!managementRecord) {
            return;
        }

        if (!hasValidRangeDates) {
            setUpdateError(t.management.invalidRangeDatesError);
            return;
        }

        if (hasInvalidRangeOrder) {
            setUpdateError(t.management.invalidRangeOrderError);
            return;
        }

        setIsSubmitting(true);
        setUpdateError(null);

        try {
            await updateRangeInManagementRecord(
                managementRecord,
                rangeStartDate,
                rangeEndDate,
                activeUserId,
                categoryId
            );

            handleClose();
            await fetchRecordsByDate(baseRequestDate);
        } catch (error) {
            setUpdateError(error instanceof Error ? error.message : t.management.updateRangeError);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog
            open={openEditRangeModal}
            onClose={handleClose}
            fullWidth
            maxWidth="sm"
            sx={Sx.dialogSx}
        >
            <DialogTitle>{t.management.editRangeTitle}</DialogTitle>
            <DialogContent>
                <Stack spacing={2} sx={Sx.createDeductionStackSx}>
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
                    {updateError ? <Alert severity="error">{updateError}</Alert> : null}
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} sx={Sx.outlinedButtonSx}>
                    {t.management.close}
                </Button>
                <Button
                    onClick={handleUpdateRange}
                    variant="contained"
                    disabled={isSubmitting || hasInvalidRangeOrder}
                    sx={Sx.createManagementRecordButtonSx}
                >
                    {isSubmitting ? t.management.updatingRecord : t.management.save}
                </Button>
            </DialogActions>
        </Dialog>
    );
};
