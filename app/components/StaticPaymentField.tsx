"use client";

import { IconButton, Stack, TextField, Typography } from "@mui/material";
import { useI18n } from "@/app/i18n/I18nProvider";
import type { StaticPayment } from "@/app/management/types";
import * as Sx from "./styles";

interface StaticPaymentFieldProps {
    payment: StaticPayment;
    onChange: (patch: Partial<StaticPayment>) => void;
    onDelete: () => void;
}

const StaticPaymentField = ({ payment, onChange, onDelete }: StaticPaymentFieldProps) => {
    const { t } = useI18n();

    return (
        <Stack sx={Sx.staticPaymentFieldRowSx}>
            <TextField
                type="text"
                label={t.management.deductionDescription}
                value={payment.description}
                onChange={(e) => {
                    onChange({ description: e.target.value });
                }}
                fullWidth
                sx={Sx.textFieldSx}
            />
            <TextField
                type="number"
                label={t.management.deductionAmount}
                value={payment.amount}
                onChange={(e) => {
                    const raw = e.target.value;
                    onChange({ amount: raw === "" ? 0 : Number(raw) });
                }}
                sx={Sx.staticPaymentAmountTextFieldSx}
            />
            <IconButton
                aria-label={t.management.deleteDeductionAria}
                onClick={() => onDelete()}
                sx={{ color: "#f87171" }}
            >
                <Typography component="span" >
                    🗑
                </Typography>
            </IconButton>
        </Stack>
    );
};

export default StaticPaymentField;
