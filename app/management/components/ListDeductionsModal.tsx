"use client";

import {
    Alert,
    Box,
    Button,
    Checkbox,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControlLabel,
    IconButton,
    Stack,
    TextField,
    Typography
} from "@mui/material";
import * as Sx from "../styles";
import { useMemo, useState } from "react";
import type { ExpenseCategory } from "@/lib/aws/schemas/common";
import type { Deduction, ManagementRecord } from "../types";
import { useI18n } from "../../i18n/I18nProvider";
import { updateDeductionsInManagementRecord } from "../services/managementApi";

interface ListDeductionsModalProps {
    managementRecord: ManagementRecord | null;
    openViewDeductionsModal: boolean;
    setOpenViewDeductionsModal: (open: boolean) => void;
    deductionsCollection: Deduction[];
    handleDraftDeductionChange: (index: number, key: keyof Deduction, value: string | boolean) => void;
    currencyFormatter: Intl.NumberFormat;
    setSelectedRecord: (record: ManagementRecord | null) => void;
    fetchRecordsByDate: (dateString: string) => Promise<void>;
    baseRequestDate: string;
    setDeletingDeductionIndex: (index: number | null) => void;
    deletingDeductionIndex: number | null;
    setDeductionsCollection: (deductions: (previous: Deduction[]) => Deduction[]) => void;
    activeUserId: string;
    category: ExpenseCategory;
}

export const ListDeductionsModal = ({
    managementRecord,
    openViewDeductionsModal,
    setOpenViewDeductionsModal,
    deductionsCollection,
    handleDraftDeductionChange,
    currencyFormatter,
    setSelectedRecord,
    fetchRecordsByDate,
    baseRequestDate,
    setDeletingDeductionIndex,
    deletingDeductionIndex,
    setDeductionsCollection,
    activeUserId,
    category,
}: ListDeductionsModalProps) => {
    const { t } = useI18n();

    const [editingDeductionIndex, setEditingDeductionIndex] = useState<number | null>(null);
    const [viewDeductionsError, setViewDeductionsError] = useState<string | null>(null);
    const [isUpdatingDeductions, setIsUpdatingDeductions] = useState(false);


    const creditDeductionsTotal = useMemo(
        () => deductionsCollection.reduce((sum, item) => (item.isCredit ? sum + item.amount : sum), 0),
        [deductionsCollection]
    );


    const validateDeduction = (deduction: Deduction): boolean => {
        const description = deduction.description.trim();
        if (description.length < 3 || description.length > 50) {
            return false;
        }

        if (!Number.isInteger(deduction.amount)) {
            return false;
        }

        return true;
    };



    const handleUpdateDeductions = async () => {
        if (!managementRecord) {
            setViewDeductionsError(t.management.updateRecordNotFoundError);
            return;
        }

        if (!deductionsCollection.every((item) => validateDeduction(item))) {
            setViewDeductionsError(t.management.invalidDeductionCollectionError);
            return;
        }

        setIsUpdatingDeductions(true);
        setViewDeductionsError(null);

        try {
            await updateDeductionsInManagementRecord(
                managementRecord,
                deductionsCollection,
                activeUserId,
                category
            );
            setOpenViewDeductionsModal(false);
            setSelectedRecord(null);
            await fetchRecordsByDate(baseRequestDate);
        } catch(error) {
            setViewDeductionsError(t.management.updateDeductionsError);
            // TODO: handle error internally
        } finally {
            setIsUpdatingDeductions(false);
        }
    };

    const handleRequestDeleteDeduction = (index: number) => {
        setDeletingDeductionIndex(index);
    };

    const handleConfirmDeleteDeduction = () => {
        if (deletingDeductionIndex === null) {
            return;
        }

        setDeductionsCollection((previous) =>
            previous.filter((_, currentIndex) => currentIndex !== deletingDeductionIndex)
        );
        setViewDeductionsError(null);
        setEditingDeductionIndex((currentEditingIndex) => {
            if (currentEditingIndex === null) {
                return null;
            }

            if (currentEditingIndex === deletingDeductionIndex) {
                return null;
            }

            if (currentEditingIndex > deletingDeductionIndex) {
                return currentEditingIndex - 1;
            }

            return currentEditingIndex;
        });
        setDeletingDeductionIndex(null);
    };

    return (
        <>
            <Dialog
                open={openViewDeductionsModal}
                onClose={() => setOpenViewDeductionsModal(false)}
                fullWidth
                maxWidth="md"
                sx={Sx.dialogSx}
            >
                <DialogTitle>{t.management.listDeductionsTitle}</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={Sx.listDeductionsStackSx}>
                        {deductionsCollection.length === 0 ? (
                            <Alert severity="info">{t.management.noDeductions}</Alert>
                        ) : (
                            deductionsCollection.map((deduction, index) => {
                                const isEditing = editingDeductionIndex === index;

                                return (
                                    <Box
                                        key={`${deduction.description}-${index}`}
                                        sx={Sx.deductionItemCardSx(deduction.isCredit)}
                                    >
                                        <Box sx={Sx.deductionItemGridSx}>
                                            <TextField
                                                label={t.management.deductionDescription}
                                                value={deduction.description}
                                                onChange={(event) =>
                                                    handleDraftDeductionChange(index, "description", event.target.value)
                                                }
                                                fullWidth
                                                disabled={!isEditing}
                                                sx={Sx.textFieldSx}
                                            />
                                            <TextField
                                                label={t.management.amount}
                                                type="number"
                                                value={deduction.amount}
                                                onChange={(event) =>
                                                    handleDraftDeductionChange(index, "amount", event.target.value)
                                                }
                                                fullWidth
                                                disabled={!isEditing}
                                                sx={Sx.textFieldSx}
                                            />
                                            {isEditing && <FormControlLabel
                                                control={
                                                    <Checkbox
                                                        checked={deduction.isCredit}
                                                        onChange={(event) =>
                                                            handleDraftDeductionChange(index, "isCredit", event.target.checked)
                                                        }
                                                        disabled={!isEditing}
                                                        sx={Sx.deductionCreditCheckboxSx}
                                                    />
                                                }
                                                label={t.management.credit}
                                                sx={Sx.deductionCreditLabelSx}
                                            />}
                                            <Button
                                                variant="outlined"
                                                sx={Sx.outlinedButtonSx}
                                                onClick={() => {
                                                    if (isEditing && !validateDeduction(deduction)) {
                                                        setViewDeductionsError(
                                                            t.management.invalidEditedDeductionError
                                                        );
                                                        return;
                                                    }

                                                    setViewDeductionsError(null);
                                                    setEditingDeductionIndex(isEditing ? null : index);
                                                }}
                                            >
                                                {isEditing ? t.management.save : t.management.edit}
                                            </Button>
                                            <IconButton
                                                aria-label={t.management.deleteDeductionAria}
                                                onClick={() => handleRequestDeleteDeduction(index)}
                                                disabled={isUpdatingDeductions}
                                                sx={Sx.deleteDeductionButtonSx}
                                            >
                                                <Typography component="span" sx={Sx.deleteDeductionIconSx}>
                                                    🗑
                                                </Typography>
                                            </IconButton>
                                        </Box>
                                    </Box>
                                );
                            })
                        )}
                        <Box sx={Sx.valuePillSx}>
                            <Typography variant="caption" sx={Sx.totalCreditsLabelSx}>
                                {t.management.totalCredits}
                            </Typography>
                            <Typography sx={Sx.totalCreditsValueSx}>
                                {currencyFormatter.format(creditDeductionsTotal)}
                            </Typography>
                        </Box>
                        {viewDeductionsError ? <Alert severity="error">{viewDeductionsError}</Alert> : null}
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenViewDeductionsModal(false)} sx={Sx.outlinedButtonSx}>
                        {t.management.close}
                    </Button>
                    <Button
                        onClick={handleUpdateDeductions}
                        variant="contained"
                        disabled={isUpdatingDeductions || editingDeductionIndex !== null}
                        sx={Sx.updateDeductionsButtonSx}
                    >
                        {isUpdatingDeductions ? t.management.updatingRecord : t.management.updateRecord}
                    </Button>
                </DialogActions>
            </Dialog>
            <Dialog
                open={deletingDeductionIndex !== null}
                onClose={() => setDeletingDeductionIndex(null)}
                fullWidth
                maxWidth="xs"
                sx={Sx.dialogSx}
            >
                <DialogTitle>{t.management.deleteConfirmTitle}</DialogTitle>
                <DialogContent>
                    <Typography sx={Sx.confirmDeleteTextSx}>
                        {t.management.deleteConfirmMessage}
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeletingDeductionIndex(null)} sx={Sx.outlinedButtonSx}>
                        {t.management.cancel}
                    </Button>
                    <Button
                        onClick={handleConfirmDeleteDeduction}
                        variant="contained"
                        sx={Sx.confirmDeleteButtonSx}
                    >
                        {t.management.delete}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    )
}