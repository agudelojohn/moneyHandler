
import { COLORS } from "../theme";

const { SURFACE_BG, TEXT_PRIMARY, TEXT_SECONDARY, BORDER_COLOR, BLUE_DEEP, DARK_BG } = COLORS;

export const dialogSx = {
    "& .MuiPaper-root": {
        backgroundColor: SURFACE_BG,
        color: TEXT_PRIMARY,
        border: `1px solid ${BORDER_COLOR}`,
    },
};

export const textFieldSx = {
    "& .MuiInputBase-input": { color: TEXT_PRIMARY },
    "& .MuiInputBase-input.Mui-disabled": {
        color: TEXT_PRIMARY,
        WebkitTextFillColor: TEXT_PRIMARY,
        opacity: 1,
    },
    "& .MuiInputLabel-root": { color: TEXT_SECONDARY },
    "& .MuiInputLabel-root.Mui-disabled": { color: TEXT_SECONDARY },
    "& .MuiOutlinedInput-notchedOutline": { borderColor: BORDER_COLOR },
    "& .MuiOutlinedInput-root.Mui-disabled .MuiOutlinedInput-notchedOutline": {
        borderColor: BORDER_COLOR,
    },
    "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#334155" },
    "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
        borderColor: BLUE_DEEP,
    },
};

export const outlinedButtonSx = {
    color: TEXT_PRIMARY,
    borderColor: "#334155",
    "&:hover": {
        borderColor: "#475569",
        backgroundColor: "#1e293b",
    },
};

export const valuePillSx = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    px: 1.5,
    py: 0.75,
    borderRadius: 999,
    border: `1px solid ${BORDER_COLOR}`,
    backgroundColor: "#111827",
};

export const mainStackSx = {
    minHeight: "100vh",
    justifyContent: "center",
    alignItems: "center",
    px: 2,
    backgroundColor: DARK_BG,
    color: TEXT_PRIMARY,
}

export const titleSx = { fontWeight: 700, textAlign: "center", color: TEXT_PRIMARY, paddingTop: { xs: 10, sm: 2 } }

export const containerSx = {
    backgroundColor: SURFACE_BG,
    border: `1px solid ${BORDER_COLOR}`,
    borderRadius: 2,
    p: 2,
}

export const mainValuePillSx = (availableAmount: number) => {
    return {
        ...valuePillSx,
        borderColor: BLUE_DEEP,
        backgroundColor: availableAmount > 0 ? "#0b1b42" : "#ff0000",
        borderWidth: 2,
        boxShadow: availableAmount > 0 ? "0 0 0 1px rgba(29, 78, 216, 0.35), 0 10px 24px rgba(29, 78, 216, 0.25)" : "0 0 0 1px rgba(255, 0, 0, 0.35), 0 10px 24px rgba(255, 0, 0, 0.25)",
    }
}

export const valueTypographySx = { color: "#bfdbfe", fontWeight: 700, letterSpacing: 0.3, fontSize: 20 }

export const mainValueTypographySx = (availableAmount: number) => {
    return {
        color: availableAmount > 0 ? "#ffffff" : "#000",
        fontWeight: 800,
        textAlign: "right",
        fontSize: { xs: "1.8rem" },
        lineHeight: 1.2,
    }
}

export const itemLabelSx = { color: TEXT_SECONDARY, fontSize: 15 }

export const itemValueSx = { color: TEXT_PRIMARY, fontWeight: 600, textAlign: "right" }

export const backButtonSx = {
    backgroundColor: BLUE_DEEP,
    color: TEXT_PRIMARY,
    "&:hover": { backgroundColor: "#1e40af" },
    mb: 5
}

export const listDeductionsStackSx = { mt: 1 };

export const deductionItemCardSx = (isCredit: boolean) => ({
    border: `1px solid ${BORDER_COLOR}`,
    borderRadius: 2,
    p: 2,
    backgroundColor: isCredit ? COLORS.DEDUCTION_CREDIT_BG : SURFACE_BG,
});

export const deductionItemGridSx = {
    display: "grid",
    gridTemplateColumns: "minmax(220px, 1fr) minmax(160px, 220px) auto auto auto",
    gap: 1.5,
    alignItems: "center",
};

export const deductionCreditCheckboxSx = {
    color: TEXT_SECONDARY,
    "&.Mui-checked": { color: "#22c55e" },
};

export const deductionCreditLabelSx = { color: TEXT_PRIMARY, mr: 0 };

export const deleteDeductionButtonSx = {
    color: "#f87171",
    border: "1px solid #7f1d1d",
    borderRadius: 1,
    "&:hover": {
        backgroundColor: "#450a0a",
    },
};

export const deleteDeductionIconSx = { fontSize: "1rem", lineHeight: 1 };

export const totalCreditsLabelSx = { color: TEXT_SECONDARY, fontSize: 15 };

export const totalCreditsValueSx = { color: "#86efac", fontWeight: 700, textAlign: "right" };

export const updateDeductionsButtonSx = {
    backgroundColor: BLUE_DEEP,
    color: TEXT_PRIMARY,
    "&:hover": { backgroundColor: "#1e40af" },
};

export const confirmDeleteTextSx = { color: TEXT_PRIMARY };

export const confirmDeleteButtonSx = {
    backgroundColor: "#b91c1c",
    color: TEXT_PRIMARY,
    "&:hover": { backgroundColor: "#991b1b" },
};

export const createDeductionStackSx = { mt: 1 };

export const createManagementRecordButtonSx = {
    backgroundColor: BLUE_DEEP,
    color: TEXT_PRIMARY,
    "&:hover": { backgroundColor: "#1e40af" },
};