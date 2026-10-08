"use client";

import CheckIcon from "@mui/icons-material/Check";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import EditIcon from "@mui/icons-material/Edit";
import {
    Alert,
    Box,
    Button,
    Checkbox,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography,
} from "@mui/material";
import * as Sx from "../styles";
import { useMemo, useState } from "react";
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
    categoryId: string;
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
    categoryId,
}: ListDeductionsModalProps) => {
    const { t } = useI18n();

    const [editingDeductionIndex, setEditingDeductionIndex] = useState<number | null>(null);
    const [viewDeductionsError, setViewDeductionsError] = useState<string | null>(null);
    const [isUpdatingDeductions, setIsUpdatingDeductions] = useState(false);
    const [registerCreditPayments, setRegisterCreditPayments] = useState(false);
    const dataCollection = useMemo(
        () =>
            deductionsCollection
                .map((item, originalIndex) => ({ item, originalIndex }))
                .filter(({ item }) =>
                    registerCreditPayments ? item.isCredit && !item.isPayed : true
                ),
        [deductionsCollection, registerCreditPayments]
    );


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

    const handleToggleEditDeduction = (index: number, deduction: Deduction, isEditing: boolean) => {
        if (isEditing && !validateDeduction(deduction)) {
            setViewDeductionsError(t.management.invalidEditedDeductionError);
            return;
        }

        setViewDeductionsError(null);
        setEditingDeductionIndex(isEditing ? null : index);
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
                categoryId
            );
            setOpenViewDeductionsModal(false);
            setSelectedRecord(null);
            await fetchRecordsByDate(baseRequestDate);
        } catch {
            setViewDeductionsError(t.management.updateDeductionsError);
            // TODO: handle error internally
        } finally {
            setIsUpdatingDeductions(false);
        }
    };

    const handleUpdateCreditPayments = async () => {
        if (!managementRecord) {
            setViewDeductionsError(t.management.updateRecordNotFoundError);
            return;
        }

        const creditPaymentsCollection = deductionsCollection.map(item => {
            if(!item.isCredit || item.isPayed) {
                return item;
            }

            return { ...item, isPayed: true };
        });

        try {
            await updateDeductionsInManagementRecord(
                managementRecord,
                creditPaymentsCollection,
                activeUserId,
                categoryId
            );
            setOpenViewDeductionsModal(false);
            setSelectedRecord(null);
            await fetchRecordsByDate(baseRequestDate);
        } catch {
            setViewDeductionsError(t.management.updateDeductionsError);
            // TODO: handle error internally
        } finally {
            setIsUpdatingDeductions(false);
            setRegisterCreditPayments(false);
        }
    }

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

                    <Stack sx={Sx.actionButtonsStackSx}>
                        {registerCreditPayments && <p>
                            Total de créditos: {deductionsCollection.reduce((sum, item) => (item.isCredit && !item.isPayed ? sum + item.amount : sum), 0)}
                        </p>}
                        {/* {dataCollection.some(item => item.isCredit && !item.isPayed) && ( */}
                            <Button
                                variant="outlined"
                                sx={Sx.outlinedButtonSx}
                                onClick={() => setRegisterCreditPayments(prev => !prev)}
                            >
                                {t.management.registerCreditPayments}
                                <Checkbox
                                    checked={registerCreditPayments}
                                />
                            </Button>
                        {/* // )} */}
                    </Stack>
                    <Stack spacing={2} sx={Sx.listDeductionsStackSx}>
                        {dataCollection.length === 0 ? (
                            <Alert severity="info">{t.management.noDeductions}</Alert>
                        ) : (
                            <TableContainer sx={Sx.deductionsTableContainerSx}>
                                <Table size="small" sx={Sx.deductionsTableSx}>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell sx={Sx.deductionsTableHeadCellSx}>
                                                {t.management.deductionDescription}
                                            </TableCell>
                                            <TableCell sx={Sx.deductionsTableHeadCellSx}>
                                                {t.management.amount}
                                            </TableCell>
                                            <TableCell sx={Sx.deductionsTableHeadCellSx}>
                                                {t.management.credit}
                                            </TableCell>
                                            {!registerCreditPayments ? (
                                                <TableCell sx={Sx.deductionsTableHeadCellSx} align="right">
                                                    {t.management.actions}
                                                </TableCell>
                                            ) : null}
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {dataCollection.map(({ item: deduction, originalIndex }) => {
                                            const isEditing = editingDeductionIndex === originalIndex;

                                            return (
                                                <TableRow
                                                    key={`${deduction.description}-${originalIndex}`}
                                                    sx={Sx.deductionsTableRowSx(deduction.isCredit, deduction.isPayed)}
                                                >
                                                    <TableCell sx={Sx.deductionsTableCellSx}>
                                                        {isEditing ? (
                                                            <TextField
                                                                size="small"
                                                                value={deduction.description}
                                                                onChange={(event) =>
                                                                    handleDraftDeductionChange(
                                                                        originalIndex,
                                                                        "description",
                                                                        event.target.value
                                                                    )
                                                                }
                                                                slotProps={{
                                                                    htmlInput: {
                                                                        "aria-label": t.management.deductionDescription,
                                                                    },
                                                                }}
                                                                fullWidth
                                                                sx={Sx.textFieldSx}
                                                            />
                                                        ) : (
                                                            <Typography sx={Sx.deductionsTableDescriptionSx}>
                                                                {deduction.description}
                                                            </Typography>
                                                        )}
                                                    </TableCell>
                                                    <TableCell sx={Sx.deductionsTableAmountCellSx}>
                                                        {isEditing ? (
                                                            <TextField
                                                                size="small"
                                                                type="number"
                                                                value={deduction.amount}
                                                                onChange={(event) =>
                                                                    handleDraftDeductionChange(
                                                                        originalIndex,
                                                                        "amount",
                                                                        event.target.value
                                                                    )
                                                                }
                                                                slotProps={{
                                                                    htmlInput: {
                                                                        "aria-label": t.management.amount,
                                                                    },
                                                                }}
                                                                sx={Sx.textFieldSx}
                                                            />
                                                        ) : (
                                                            currencyFormatter.format(deduction.amount)
                                                        )}
                                                    </TableCell>
                                                    <TableCell sx={Sx.deductionsTableCellSx}>
                                                        {isEditing ? (
                                                            <Checkbox
                                                                checked={deduction.isCredit}
                                                                onChange={(event) =>
                                                                    handleDraftDeductionChange(
                                                                        originalIndex,
                                                                        "isCredit",
                                                                        event.target.checked
                                                                    )
                                                                }
                                                                slotProps={{
                                                                    input: {
                                                                        "aria-label": t.management.credit,
                                                                    },
                                                                }}
                                                                sx={Sx.deductionCreditCheckboxSx}
                                                            />
                                                        ) : deduction.isCredit ? (
                                                            <Chip
                                                                size="small"
                                                                label={t.management.credit}
                                                                sx={Sx.staticPaymentCreditChipSx}
                                                            />
                                                        ) : null}
                                                    </TableCell>
                                                    {!registerCreditPayments ? (
                                                        <TableCell sx={Sx.deductionsTableActionsCellSx} align="right">
                                                            <Box sx={Sx.deductionsTableActionsSx}>
                                                                <IconButton
                                                                    size="small"
                                                                    aria-label={
                                                                        isEditing
                                                                            ? t.management.saveDeductionAria
                                                                            : t.management.editDeductionAria
                                                                    }
                                                                    onClick={() =>
                                                                        handleToggleEditDeduction(
                                                                            originalIndex,
                                                                            deduction,
                                                                            isEditing
                                                                        )
                                                                    }
                                                                    disabled={isUpdatingDeductions}
                                                                    sx={
                                                                        isEditing
                                                                            ? Sx.deductionsTableSaveButtonSx
                                                                            : Sx.deductionsTableEditButtonSx
                                                                    }
                                                                >
                                                                    {isEditing ? (
                                                                        <CheckIcon fontSize="small" />
                                                                    ) : (
                                                                        <EditIcon fontSize="small" />
                                                                    )}
                                                                </IconButton>
                                                                <IconButton
                                                                    size="small"
                                                                    aria-label={t.management.deleteDeductionAria}
                                                                    onClick={() =>
                                                                        handleRequestDeleteDeduction(originalIndex)
                                                                    }
                                                                    disabled={isUpdatingDeductions}
                                                                    sx={Sx.deductionsTableDeleteButtonSx}
                                                                >
                                                                    <DeleteOutlinedIcon fontSize="small" />
                                                                </IconButton>
                                                            </Box>
                                                        </TableCell>
                                                    ) : null}
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </TableContainer>
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
                        onClick={() => registerCreditPayments ? handleUpdateCreditPayments() : handleUpdateDeductions()}
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
