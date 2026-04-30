"use client";

import {
    Alert,
    Button,
    Checkbox,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControlLabel,
    Stack,
    TextField
} from "@mui/material";
import { useState } from "react";
import { useI18n } from "../../i18n/I18nProvider";
import { COLORS } from "../../theme";
import * as Sx from "../styles";
import { ManagementRecord } from "../types";
import { appendDeductionToManagementRecord } from "../services/managementApi";

type DeductionModalProps = {
    openDeductionModal: boolean;
    setOpenDeductionModal: (open: boolean) => void;
    managementRecord: ManagementRecord | null;
    setSelectedRecord: (record: ManagementRecord | null) => void;
    fetchRecordsByDate: (dateString: string) => Promise<void>;
    baseRequestDate: string;
    activeUserId: string;
}

export const DeductionModal = ({
    openDeductionModal,
    setOpenDeductionModal,
    managementRecord,
    setSelectedRecord,
    fetchRecordsByDate,
    baseRequestDate,
    activeUserId
}: DeductionModalProps) => {
    const { t } = useI18n();

    const [deductionDescription, setDeductionDescription] = useState("");
    const [deductionAmount, setDeductionAmount] = useState("");
    const [deductionIsCredit, setDeductionIsCredit] = useState(false);
    const [deductionError, setDeductionError] = useState<string | null>(null);
    const [isSubmittingDeduction, setIsSubmittingDeduction] = useState(false);

    function handleClose() {
        setDeductionDescription("");
        setDeductionAmount("");
        setDeductionIsCredit(false);
        setOpenDeductionModal(false);
    }

    async function handleCreation() {
        const isOk = handleCreateDeduction({ deductionDescription, deductionAmount, deductionIsCredit });
        if (await isOk) {
            handleClose();
        }
    }

    const handleCreateDeduction = async ({ deductionDescription, deductionAmount, deductionIsCredit }: { deductionDescription: string, deductionAmount: string, deductionIsCredit: boolean }) => {
        let isOK = false;
        if (!managementRecord) {
            setDeductionError("No se encontro el registro para agregar la deduccion.");
            return isOK;
        }

        const amount = Number(deductionAmount);
        if (deductionDescription.trim().length < 3 || deductionDescription.trim().length > 50) {
            setDeductionError("La descripcion debe tener entre 3 y 50 caracteres.");
            return isOK;
        }

        if (!Number.isInteger(amount)) {
            setDeductionError("El monto de la deduccion debe ser un numero entero.");
            return isOK;
        }

        setIsSubmittingDeduction(true);
        setDeductionError(null);

        try {
            const deductionObject = { description: deductionDescription, amount, isCredit: deductionIsCredit };
            const managementObject = {
                id: managementRecord.id,
                creationDate: managementRecord.creationDate,
                deductions: managementRecord.deductions,
            };
            await appendDeductionToManagementRecord(managementObject, deductionObject, activeUserId);
            setOpenDeductionModal(false);
            setSelectedRecord(null);
            await fetchRecordsByDate(baseRequestDate);
            isOK = true;
        } catch (error) {
            setDeductionError("No se pudo crear la deduccion.");
            // TODO: Log error internally
        } finally {
            setIsSubmittingDeduction(false);
            return isOK;
        }
    };

    return (
        <Dialog
            open={openDeductionModal}
            onClose={handleClose}
            fullWidth
            maxWidth="sm"
            sx={Sx.dialogSx}
        >
            <DialogTitle>{t.management.deductionModalTitle}</DialogTitle>
            <DialogContent>
                <Stack spacing={2} sx={{ mt: 1 }}>
                    <TextField
                        label={t.management.deductionDescription}
                        value={deductionDescription}
                        onChange={(event) => setDeductionDescription(event.target.value)}
                        fullWidth
                        sx={Sx.textFieldSx}
                    />
                    <TextField
                        label={t.management.deductionAmount}
                        type="number"
                        value={deductionAmount}
                        onChange={(event) => setDeductionAmount(event.target.value)}
                        fullWidth
                        sx={Sx.textFieldSx}
                    />
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={deductionIsCredit}
                                onChange={(event) => setDeductionIsCredit(event.target.checked)}
                                sx={{
                                    color: COLORS.TEXT_SECONDARY,
                                    "&.Mui-checked": { color: COLORS.BLUE_DEEP },
                                }}
                            />
                        }
                        label={t.management.deductionIsCredit}
                        sx={{ color: COLORS.TEXT_PRIMARY }}
                    />
                    {deductionError ? <Alert severity="error">{deductionError}</Alert> : null}
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} sx={Sx.outlinedButtonSx}>
                    {t.management.close}
                </Button>
                <Button
                    onClick={handleCreation}
                    variant="contained"
                    disabled={isSubmittingDeduction}
                    sx={{
                        backgroundColor: COLORS.BLUE_DEEP,
                        color: COLORS.TEXT_PRIMARY,
                        "&:hover": { backgroundColor: "#1e40af" },
                    }}
                >
                    {isSubmittingDeduction ? t.management.saving : t.management.addDeduction}
                </Button>
            </DialogActions>
        </Dialog>
    )
}