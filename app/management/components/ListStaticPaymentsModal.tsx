"use client";

import AddRoundedIcon from "@mui/icons-material/AddRounded";
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
    IconButton,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import type { ManagementRecord, StaticPayment } from "../types";
import { useI18n } from "../../i18n/I18nProvider";
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
    const [deletingIndex, setDeletingIndex] = useState<number | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const dateTimeFormatter = useMemo(
        () =>
            new Intl.DateTimeFormat(dateLocale, {
                dateStyle: "medium",
                timeStyle: "short",
            }),
        [dateLocale]
    );

    const isBusy = persisting || payingIndex !== null;

    useEffect(() => {
        if (!openStaticPaymentsModal || !managementRecord) {
            return;
        }
        setCollection(normalizeStaticPayments(managementRecord.staticPayments));
        setErrorMessage(null);
        setPayingIndex(null);
        setPersisting(false);
        setEditingIndex(null);
        setDeletingIndex(null);
    }, [openStaticPaymentsModal, managementRecord]);

    const persistCollection = async (next: StaticPayment[]) => {
        if (!managementRecord) {
            setErrorMessage(t.management.updateRecordNotFoundError);
            return;
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
        } catch {
            setErrorMessage(t.management.updateStaticPaymentsError);
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
        setCollection((previous) => {
            const next = [...previous, newItem];
            setEditingIndex(next.length - 1);
            setErrorMessage(null);
            return next;
        });
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
            await persistCollection(collection);
            setEditingIndex(null);
            return;
        }

        setEditingIndex(index);
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
        let nextEditing = editingIndex;
        if (editingIndex === removed) {
            nextEditing = null;
        } else if (editingIndex !== null && editingIndex > removed) {
            nextEditing = editingIndex - 1;
        }

        const next = collection.filter((_, i) => i !== removed);
        setDeletingIndex(null);
        setEditingIndex(nextEditing);
        await persistCollection(next);
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
                        {collection.length === 0 ? (
                            <Alert severity="info">{t.management.noStaticPayments}</Alert>
                        ) : null}
                        {collection.map((payment, index) => (
                                <Box
                                    key={`static-payment-${index}`}
                                    sx={Sx.deductionItemCardSx(payment.isCredit, payment.isPayed)}
                                >
                                    <Stack sx={Sx.staticPaymentRowStackSx}>
                                        <Stack sx={Sx.staticPaymentFieldsStackSx}>
                                            {payment.isPayed ? (
                                                <>
                                                    <Typography sx={Sx.staticPaymentDescriptionSx}>
                                                        {payment.description}
                                                    </Typography>
                                                    <Typography sx={Sx.staticPaymentAmountLabelSx}>
                                                        {t.management.amount}:{" "}
                                                        <Box
                                                            component="span"
                                                            sx={Sx.staticPaymentAmountValueSx}
                                                        >
                                                            {currencyFormatter.format(payment.amount)}
                                                        </Box>
                                                    </Typography>
                                                </>
                                            ) : editingIndex === index ? (
                                                <>
                                                    <TextField
                                                        label={t.management.deductionDescription}
                                                        value={payment.description}
                                                        onChange={(event) =>
                                                            handleDraftChange(index, {
                                                                description: event.target.value,
                                                            })
                                                        }
                                                        fullWidth
                                                        sx={Sx.textFieldSx}
                                                    />
                                                    <TextField
                                                        label={t.management.deductionAmount}
                                                        type="number"
                                                        value={payment.amount}
                                                        onChange={(event) => {
                                                            const raw = event.target.value;
                                                            handleDraftChange(index, {
                                                                amount: raw === "" ? 0 : Number(raw),
                                                            });
                                                        }}
                                                        fullWidth
                                                        sx={Sx.textFieldSx}
                                                    />
                                                    <FormControlLabel
                                                        control={
                                                            <Checkbox
                                                                checked={payment.isCredit}
                                                                onChange={(event) =>
                                                                    handleDraftChange(index, {
                                                                        isCredit: event.target.checked,
                                                                    })
                                                                }
                                                                sx={Sx.deductionCreditCheckboxSx}
                                                            />
                                                        }
                                                        label={t.management.credit}
                                                        sx={Sx.deductionCreditLabelSx}
                                                    />
                                                </>
                                            ) : (
                                                <>
                                                    <Typography sx={Sx.staticPaymentDescriptionSx}>
                                                        {payment.description}
                                                    </Typography>
                                                    <Typography sx={Sx.staticPaymentAmountLabelSx}>
                                                        {t.management.amount}:{" "}
                                                        <Box
                                                            component="span"
                                                            sx={Sx.staticPaymentAmountValueSx}
                                                        >
                                                            {currencyFormatter.format(payment.amount)}
                                                        </Box>
                                                    </Typography>
                                                </>
                                            )}
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
                                                    label={
                                                        payment.isPayed
                                                            ? t.management.staticPaymentPaidStatus
                                                            : t.management.staticPaymentUnpaidStatus
                                                    }
                                                    sx={Sx.staticPaymentStatusChipSx(payment.isPayed)}
                                                />
                                            </Box>
                                            {payment.paymentDay ? (
                                                <Typography sx={Sx.staticPaymentPaymentDaySx}>
                                                    {t.management.staticPaymentPaymentDay}:{" "}
                                                    {dateTimeFormatter.format(
                                                        new Date(payment.paymentDay)
                                                    )}
                                                </Typography>
                                            ) : null}
                                        </Stack>
                                        {!payment.isPayed ? (
                                            <Stack sx={Sx.staticPaymentUnpaidActionsStackSx}>
                                                <Box sx={Sx.deductionItemButtonsSx}>
                                                    <Button
                                                        variant="outlined"
                                                        disabled={isBusy}
                                                        onClick={() => void handleToggleEditSave(index)}
                                                        sx={Sx.outlinedButtonSx}
                                                    >
                                                        {editingIndex === index
                                                            ? t.management.save
                                                            : t.management.edit}
                                                    </Button>
                                                    <IconButton
                                                        aria-label={t.management.staticPaymentDeleteAria}
                                                        onClick={() => handleRequestDelete(index)}
                                                        disabled={isBusy}
                                                        sx={Sx.deleteDeductionButtonSx}
                                                    >
                                                        <Typography
                                                            component="span"
                                                            sx={Sx.deleteDeductionIconSx}
                                                        >
                                                            🗑
                                                        </Typography>
                                                    </IconButton>
                                                </Box>
                                                <Button
                                                    variant="contained"
                                                    disabled={
                                                        isBusy ||
                                                        editingIndex === index ||
                                                        !validateStaticPayment(payment)
                                                    }
                                                    onClick={() => void handlePayOne(index)}
                                                    sx={Sx.staticPaymentPayButtonSx}
                                                >
                                                    {payingIndex === index
                                                        ? t.management.payingStaticPayment
                                                        : t.management.payStaticPaymentButton}
                                                </Button>
                                            </Stack>
                                        ) : null}
                                    </Stack>
                                </Box>
                            ))}
                        {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}
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
