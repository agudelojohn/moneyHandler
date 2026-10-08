"use client";

import {
    Alert,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Stack,
} from "@mui/material";
import { useState } from "react";
import { MoneyTextField } from "@/app/components/MoneyTextField";
import { useI18n } from "../../i18n/I18nProvider";
import { updateInitialAmountInManagementRecord } from "../services/managementApi";
import * as Sx from "../styles";
import type { ManagementRecord } from "../types";

type EditInitialAmountModalProps = {
    openEditInitialAmountModal: boolean;
    setOpenEditInitialAmountModal: (open: boolean) => void;
    managementRecord: ManagementRecord | null;
    setSelectedRecord: (record: ManagementRecord | null) => void;
    fetchRecordsByDate: (dateString: string) => Promise<void>;
    baseRequestDate: string;
    activeUserId: string;
    categoryId: string;
};

export const EditInitialAmountModal = ({
    openEditInitialAmountModal,
    setOpenEditInitialAmountModal,
    managementRecord,
    setSelectedRecord,
    fetchRecordsByDate,
    baseRequestDate,
    activeUserId,
    categoryId,
}: EditInitialAmountModalProps) => {
    const { t } = useI18n();
    const [initialAmount, setInitialAmount] = useState("");
    const [updateError, setUpdateError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [amountFormSource, setAmountFormSource] = useState<{
        open: boolean;
        record: ManagementRecord | null;
    }>({ open: openEditInitialAmountModal, record: managementRecord });

    if (
        openEditInitialAmountModal !== amountFormSource.open ||
        managementRecord !== amountFormSource.record
    ) {
        setAmountFormSource({ open: openEditInitialAmountModal, record: managementRecord });
        if (openEditInitialAmountModal && managementRecord) {
            setInitialAmount(String(managementRecord.initialAmount));
            setUpdateError(null);
        }
    }

    const handleClose = () => {
        setOpenEditInitialAmountModal(false);
        setSelectedRecord(null);
        setUpdateError(null);
    };

    const handleUpdateInitialAmount = async () => {
        if (!managementRecord) {
            return;
        }

        const amount = Number(initialAmount);
        if (!Number.isInteger(amount) || amount <= 0) {
            setUpdateError(t.management.initialAmountValidationError);
            return;
        }

        setIsSubmitting(true);
        setUpdateError(null);

        try {
            await updateInitialAmountInManagementRecord(
                managementRecord,
                amount,
                activeUserId,
                categoryId
            );

            handleClose();
            await fetchRecordsByDate(baseRequestDate);
        } catch (error) {
            setUpdateError(error instanceof Error ? error.message : t.management.updateInitialAmountError);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog
            open={openEditInitialAmountModal}
            onClose={handleClose}
            fullWidth
            maxWidth="sm"
            sx={Sx.dialogSx}
        >
            <DialogTitle>{t.management.editInitialAmountTitle}</DialogTitle>
            <DialogContent>
                <Stack spacing={2} sx={Sx.createDeductionStackSx}>
                    <MoneyTextField
                        label={t.management.initialAmount}
                        value={initialAmount}
                        onAmountChange={setInitialAmount}
                        fullWidth
                        sx={Sx.moneyAmountTextFieldSx}
                    />
                    {updateError ? <Alert severity="error">{updateError}</Alert> : null}
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} sx={Sx.outlinedButtonSx}>
                    {t.management.close}
                </Button>
                <Button
                    onClick={handleUpdateInitialAmount}
                    variant="contained"
                    disabled={isSubmitting}
                    sx={Sx.createManagementRecordButtonSx}
                >
                    {isSubmitting ? t.management.updatingRecord : t.management.save}
                </Button>
            </DialogActions>
        </Dialog>
    );
};
