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

type DeductionModalProps = {
    openDeductionModal: boolean;
    setOpenDeductionModal: (open: boolean) => void;
    deductionError: string | null;
    isSubmittingDeduction: boolean;
    handleCreateDeduction: ({ deductionDescription, deductionAmount, deductionIsCredit }: { deductionDescription: string, deductionAmount: string, deductionIsCredit: boolean }) => void;
}

export const DeductionModal = ({ openDeductionModal, setOpenDeductionModal, deductionError, isSubmittingDeduction, handleCreateDeduction }: DeductionModalProps) => {
    const { t } = useI18n();

    const [deductionDescription, setDeductionDescription] = useState("");
    const [deductionAmount, setDeductionAmount] = useState("");
    const [deductionIsCredit, setDeductionIsCredit] = useState(false);

    return (
        <Dialog
            open={openDeductionModal}
            onClose={() => setOpenDeductionModal(false)}
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
                <Button onClick={() => setOpenDeductionModal(false)} sx={Sx.outlinedButtonSx}>
                    {t.management.close}
                </Button>
                <Button
                    onClick={() => handleCreateDeduction({ deductionDescription, deductionAmount, deductionIsCredit })}
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