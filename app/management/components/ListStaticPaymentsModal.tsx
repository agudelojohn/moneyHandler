"use client";

import AddRoundedIcon from "@mui/icons-material/AddRounded";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
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
    FormControlLabel,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import { useMemo, useState } from "react";
import type { ManagementRecord, StaticPayment } from "../types";
import { useI18n } from "../../i18n/I18nProvider";
import { MoneyTextField } from "@/app/components/MoneyTextField";
import { updateStaticPaymentsInManagementRecord } from "../services/managementApi";
import * as Sx from "../styles";

interface ListStaticPaymentsModalProps {
    managementRecord: ManagementRecord | null;
    openStaticPaymentsModal: boolean;
    setOpenStaticPaymentsModal: (open: boolean) => void;
    currencyFormatter: Intl.NumberFormat;
    fetchRecordsByDate: (dateString: string) => Promise<void>;
    baseRequestDate: string;
    activeUserId: string;
    categoryId: string;
}

function normalizeStaticPayments(items: StaticPayment[]): StaticPayment[] {
    return items.map((item) => ({
        ...item,
        isCredit: Boolean(item.isCredit),
        isPayed: Boolean(item.isPayed),
        paymentDay: item.paymentDay ?? null,
    }));
}

function validateStaticPayment(payment: StaticPayment): boolean {
    const description = payment.description.trim();
    if (description.length < 3 || description.length > 50) {
        return false;
    }
    if (!Number.isInteger(payment.amount)) {
        return false;
    }
    return true;
}

function StaticPaymentPendingActions({
    editDisabled,
    deleteDisabled,
    payDisabled,
    paying,
    onEdit,
    onDelete,
    onPay,
}: {
    editDisabled: boolean;
    deleteDisabled: boolean;
    payDisabled: boolean;
    paying: boolean;
    onEdit: () => void;
    onDelete: () => void;
    onPay: () => void;
}) {
    const { t } = useI18n();

    return (
        <Stack sx={Sx.staticPaymentPendingActionsSx}>
            <Button
                variant="outlined"
                disabled={editDisabled}
                onClick={onEdit}
                sx={[Sx.outlinedButtonSx, Sx.staticPaymentPendingActionButtonSx]}
            >
                {t.management.edit}
            </Button>
            <Button
                variant="contained"
                disabled={payDisabled}
                onClick={onPay}
                sx={[Sx.staticPaymentPayButtonSx, Sx.staticPaymentPendingActionButtonSx]}
            >
                {paying ? t.management.payingStaticPayment : t.management.payStaticPaymentButton}
            </Button>
            <Button
                variant="outlined"
                aria-label={t.management.staticPaymentDeleteAria}
                onClick={onDelete}
                disabled={deleteDisabled}
                startIcon={<DeleteOutlinedIcon fontSize="small" />}
                sx={[Sx.deleteDeductionButtonSx, Sx.staticPaymentPendingActionButtonSx]}
            >
                {t.management.delete}
            </Button>
        </Stack>
    );
}

function createEmptyStaticPayment(): StaticPayment {
    return {
        description: "",
        amount: 0,
        isCredit: false,
        isPayed: false,
        paymentDay: null,
    };
}

export const ListStaticPaymentsModal = ({
    managementRecord,
    openStaticPaymentsModal,
    setOpenStaticPaymentsModal,
    currencyFormatter,
    fetchRecordsByDate,
    baseRequestDate,
    activeUserId,
    categoryId,
}: ListStaticPaymentsModalProps) => {
    const { t, dateLocale } = useI18n();
    const [collection, setCollection] = useState<StaticPayment[]>([]);
    const [payingIndex, setPayingIndex] = useState<number | null>(null);
    const [persisting, setPersisting] = useState(false);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [editSnapshot, setEditSnapshot] = useState<StaticPayment | null>(null);
    const [isNewDraft, setIsNewDraft] = useState(false);
    const [deletingIndex, setDeletingIndex] = useState<number | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [collectionSource, setCollectionSource] = useState<{
        open: boolean;
        record: ManagementRecord | null;
    }>({ open: openStaticPaymentsModal, record: managementRecord });

    const dateTimeFormatter = useMemo(
        () =>
            new Intl.DateTimeFormat(dateLocale, {
                dateStyle: "medium",
                timeStyle: "short",
            }),
        [dateLocale]
    );

    const isBusy = persisting || payingIndex !== null;

    // Al abrir el modal, sincroniza la colección del registro durante el render.
    if (
        openStaticPaymentsModal !== collectionSource.open ||
        managementRecord !== collectionSource.record
    ) {
        setCollectionSource({ open: openStaticPaymentsModal, record: managementRecord });
        if (openStaticPaymentsModal && managementRecord) {
            setCollection(normalizeStaticPayments(managementRecord.staticPayments));
            setErrorMessage(null);
            setPayingIndex(null);
            setPersisting(false);
            setEditingIndex(null);
            setEditSnapshot(null);
            setIsNewDraft(false);
            setDeletingIndex(null);
        }
    }

    const persistCollection = async (next: StaticPayment[]) => {
        if (!managementRecord) {
            setErrorMessage(t.management.updateRecordNotFoundError);
            return false;
        }

        setPersisting(true);
        setErrorMessage(null);
        try {
            await updateStaticPaymentsInManagementRecord(
                managementRecord,
                next,
                activeUserId,
                categoryId
            );
            setCollection(normalizeStaticPayments(next));
            await fetchRecordsByDate(baseRequestDate);
            return true;
        } catch {
            setErrorMessage(t.management.updateStaticPaymentsError);
            return false;
        } finally {
            setPersisting(false);
        }
    };

    const handleDraftChange = (index: number, patch: Partial<StaticPayment>) => {
        setCollection((previous) =>
            previous.map((item, i) => {
                if (i !== index) {
                    return item;
                }
                if (patch.amount !== undefined) {
                    const raw = patch.amount;
                    return {
                        ...item,
                        ...patch,
                        amount: typeof raw === "number" ? raw : item.amount,
                    };
                }
                return { ...item, ...patch };
            })
        );
    };

    const handleAddStaticPayment = () => {
        if (isBusy || editingIndex !== null) {
            return;
        }
        const newItem = createEmptyStaticPayment();
        setIsNewDraft(true);
        setEditSnapshot(null);
        setEditingIndex(0);
        setErrorMessage(null);
        setCollection((previous) => [newItem, ...previous]);
    };

    const handleToggleEditSave = async (index: number) => {
        if (isBusy || collection[index]?.isPayed) {
            return;
        }

        if (editingIndex === index) {
            const row = collection[index];
            if (!validateStaticPayment(row)) {
                setErrorMessage(t.management.invalidEditedDeductionError);
                return;
            }
            const saved = await persistCollection(collection);
            if (!saved) {
                return;
            }
            setEditingIndex(null);
            setEditSnapshot(null);
            setIsNewDraft(false);
            return;
        }

        setIsNewDraft(false);
        setEditSnapshot(collection[index]);
        setEditingIndex(index);
        setErrorMessage(null);
    };

    const handleCancelEdit = () => {
        if (editingIndex === null) {
            return;
        }

        if (isNewDraft) {
            setCollection((previous) => previous.filter((_, index) => index !== editingIndex));
        } else if (editSnapshot) {
            const snapshot = editSnapshot;
            const index = editingIndex;
            setCollection((previous) =>
                previous.map((item, i) => (i === index ? snapshot : item))
            );
        }

        setEditingIndex(null);
        setEditSnapshot(null);
        setIsNewDraft(false);
        setErrorMessage(null);
    };

    const handleRequestDelete = (index: number) => {
        if (isBusy || collection[index]?.isPayed) {
            return;
        }
        setDeletingIndex(index);
    };

    const handleConfirmDelete = async () => {
        if (deletingIndex === null) {
            return;
        }

        const removed = deletingIndex;
        const next = collection.filter((_, i) => i !== removed);
        const saved = await persistCollection(next);
        setDeletingIndex(null);
        if (!saved) {
            return;
        }

        if (editingIndex === removed) {
            setEditingIndex(null);
            setEditSnapshot(null);
            setIsNewDraft(false);
        } else if (editingIndex !== null && editingIndex > removed) {
            setEditingIndex(editingIndex - 1);
        }
    };

    const handlePayOne = async (index: number) => {
        if (!managementRecord) {
            setErrorMessage(t.management.updateRecordNotFoundError);
            return;
        }

        const current = collection[index];
        if (
            !current ||
            current.isPayed ||
            isBusy ||
            editingIndex === index ||
            !validateStaticPayment(current)
        ) {
            return;
        }

        setPayingIndex(index);
        setErrorMessage(null);

        const paymentTimestamp = new Date().toISOString();
        const nextCollection = collection.map((item, i) =>
            i === index ? { ...item, isPayed: true, paymentDay: paymentTimestamp } : item
        );

        try {
            await updateStaticPaymentsInManagementRecord(
                managementRecord,
                nextCollection,
                activeUserId,
                categoryId
            );
            setCollection(normalizeStaticPayments(nextCollection));
            await fetchRecordsByDate(baseRequestDate);
        } catch {
            setErrorMessage(t.management.updateStaticPaymentsError);
        } finally {
            setPayingIndex(null);
        }
    };

    const handleClose = () => {
        setOpenStaticPaymentsModal(false);
    };

    const editingPayment = editingIndex === null ? null : collection[editingIndex] ?? null;
    const pendingRows = collection
        .map((payment, index) => ({ payment, index }))
        .filter(({ payment, index }) => !payment.isPayed && index !== editingIndex);
    const paidRows = collection
        .map((payment, index) => ({ payment, index }))
        .filter(({ payment }) => payment.isPayed);

    const renderSummary = (payment: StaticPayment) => (
        <>
            <Typography sx={Sx.staticPaymentDescriptionSx}>{payment.description}</Typography>
            <Typography sx={Sx.staticPaymentAmountLabelSx}>
                {t.management.amount}:{" "}
                <Box component="span" sx={Sx.staticPaymentAmountValueSx}>
                    {currencyFormatter.format(payment.amount)}
                </Box>
            </Typography>
        </>
    );

    return (
        <>
            <Dialog
                open={openStaticPaymentsModal}
                onClose={handleClose}
                fullWidth
                maxWidth="md"
                sx={Sx.dialogSx}
            >
                <DialogTitle>{t.management.listStaticPaymentsTitle}</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={Sx.listStaticPaymentsStackSx}>
                        <Button
                            type="button"
                            variant="outlined"
                            startIcon={<AddRoundedIcon />}
                            onClick={handleAddStaticPayment}
                            disabled={isBusy || editingIndex !== null}
                            sx={Sx.staticPaymentsModalAddButtonSx}
                        >
                            {t.management.addStaticPayment}
                        </Button>
                        {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}
                        {editingPayment && editingIndex !== null ? (
                            <Stack sx={Sx.staticPaymentFormCardSx}>
                                <Stack sx={Sx.staticPaymentFormFieldsSx}>
                                    <TextField
                                        label={t.management.deductionDescription}
                                        value={editingPayment.description}
                                        onChange={(event) =>
                                            handleDraftChange(editingIndex, {
                                                description: event.target.value,
                                            })
                                        }
                                        sx={[Sx.textFieldSx, Sx.staticPaymentFormDescriptionSx]}
                                    />
                                    <MoneyTextField
                                        label={t.management.deductionAmount}
                                        value={editingPayment.amount}
                                        onAmountChange={(digits) => {
                                            handleDraftChange(editingIndex, {
                                                amount: digits === "" ? 0 : Number(digits),
                                            });
                                        }}
                                        sx={[Sx.moneyAmountTextFieldSx, Sx.staticPaymentFormAmountSx]}
                                    />
                                </Stack>
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={editingPayment.isCredit}
                                            onChange={(event) =>
                                                handleDraftChange(editingIndex, {
                                                    isCredit: event.target.checked,
                                                })
                                            }
                                            sx={Sx.deductionCreditCheckboxSx}
                                        />
                                    }
                                    label={t.management.credit}
                                    sx={Sx.deductionCreditLabelSx}
                                />
                                <Stack sx={Sx.staticPaymentFormActionsSx}>
                                    <Button
                                        variant="outlined"
                                        disabled={isBusy}
                                        onClick={handleCancelEdit}
                                        sx={[Sx.outlinedButtonSx, Sx.staticPaymentFormActionButtonSx]}
                                    >
                                        {t.management.cancel}
                                    </Button>
                                    <Button
                                        variant="contained"
                                        disabled={isBusy}
                                        onClick={() => void handleToggleEditSave(editingIndex)}
                                        sx={[Sx.primaryContainedButtonSx, Sx.staticPaymentFormActionButtonSx]}
                                    >
                                        {t.management.save}
                                    </Button>
                                </Stack>
                            </Stack>
                        ) : null}
                        {collection.length === 0 && editingIndex === null ? (
                            <Alert severity="info">{t.management.noStaticPayments}</Alert>
                        ) : null}
                        {pendingRows.length > 0 ? (
                            <Stack spacing={1.5}>
                                <Typography sx={Sx.staticPaymentSectionTitleSx}>
                                    {t.management.pendingStaticPayments}
                                </Typography>
                                {pendingRows.map(({ payment, index }) => (
                                    <Box
                                        key={`static-payment-${index}`}
                                        sx={Sx.deductionItemCardSx(payment.isCredit, payment.isPayed)}
                                    >
                                        <Stack sx={Sx.staticPaymentRowStackSx}>
                                            <Stack sx={Sx.staticPaymentFieldsStackSx}>
                                                {renderSummary(payment)}
                                                <Box sx={Sx.staticPaymentChipsRowSx}>
                                                    {payment.isCredit ? (
                                                        <Chip
                                                            size="small"
                                                            label={t.management.credit}
                                                            sx={Sx.staticPaymentCreditChipSx}
                                                        />
                                                    ) : null}
                                                    <Chip
                                                        size="small"
                                                        label={t.management.staticPaymentUnpaidStatus}
                                                        sx={Sx.staticPaymentStatusChipSx(false)}
                                                    />
                                                </Box>
                                            </Stack>
                                            <StaticPaymentPendingActions
                                                editDisabled={isBusy || editingIndex !== null}
                                                deleteDisabled={isBusy}
                                                payDisabled={isBusy || !validateStaticPayment(payment)}
                                                paying={payingIndex === index}
                                                onEdit={() => void handleToggleEditSave(index)}
                                                onDelete={() => handleRequestDelete(index)}
                                                onPay={() => void handlePayOne(index)}
                                            />
                                        </Stack>
                                    </Box>
                                ))}
                            </Stack>
                        ) : null}
                        {paidRows.length > 0 ? (
                            <Stack spacing={1.5}>
                                <Typography sx={Sx.staticPaymentSectionTitleSx}>
                                    {t.management.paidStaticPayments}
                                </Typography>
                                {paidRows.map(({ payment, index }) => (
                                    <Box
                                        key={`static-payment-paid-${index}`}
                                        sx={Sx.deductionItemCardSx(payment.isCredit, true)}
                                    >
                                        <Stack sx={Sx.staticPaymentFieldsStackSx}>
                                            {renderSummary(payment)}
                                            <Box sx={Sx.staticPaymentChipsRowSx}>
                                                {payment.isCredit ? (
                                                    <Chip
                                                        size="small"
                                                        label={t.management.credit}
                                                        sx={Sx.staticPaymentCreditChipSx}
                                                    />
                                                ) : null}
                                                <Chip
                                                    size="small"
                                                    label={t.management.staticPaymentPaidStatus}
                                                    sx={Sx.staticPaymentStatusChipSx(true)}
                                                />
                                            </Box>
                                            {payment.paymentDay ? (
                                                <Typography sx={Sx.staticPaymentPaymentDaySx}>
                                                    {t.management.staticPaymentPaymentDay}:{" "}
                                                    {dateTimeFormatter.format(new Date(payment.paymentDay))}
                                                </Typography>
                                            ) : null}
                                        </Stack>
                                    </Box>
                                ))}
                            </Stack>
                        ) : null}
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} sx={Sx.outlinedButtonSx}>
                        {t.management.close}
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog
                open={deletingIndex !== null}
                onClose={() => setDeletingIndex(null)}
                fullWidth
                maxWidth="xs"
                sx={Sx.dialogSx}
            >
                <DialogTitle>{t.management.deleteConfirmTitle}</DialogTitle>
                <DialogContent>
                    <Typography sx={Sx.confirmDeleteTextSx}>
                        {t.management.staticPaymentDeleteConfirmMessage}
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeletingIndex(null)} sx={Sx.outlinedButtonSx}>
                        {t.management.cancel}
                    </Button>
                    <Button
                        onClick={() => void handleConfirmDelete()}
                        variant="contained"
                        disabled={persisting}
                        sx={Sx.confirmDeleteButtonSx}
                    >
                        {t.management.delete}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};
