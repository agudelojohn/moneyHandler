import { COLORS } from "../theme";

const {
    SURFACE_BG,
    TEXT_PRIMARY,
    TEXT_SECONDARY,
    BORDER_COLOR,
    BLUE_DEEP,
    DARK_BG,
    DARK_SURFACE,
    DARK_BORDER,
    BLUE_ACCENT,
} = COLORS;

export const actionButtonsStackSx = {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    mb: 2,
    gap: 3,
    textAlign: 'center',
    alignContent: 'center',
}

export const dialogSx = {
    "& .MuiPaper-root": {
        backgroundColor: SURFACE_BG,
        color: TEXT_PRIMARY,
        border: `1px solid ${BORDER_COLOR}`,
    },
};

export { textFieldSx } from "../components/styles";

export const StaticPaymentsStackSx = {
    border: "2px solid rgb(120 116 116)",
    borderRadius: 1,
    minHeight: 100,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: { xs: "stretch", sm: "center" },
    gap: 2,
    py: 2,
    px: { xs: 1, sm: 2 },
    width: "100%",
    boxSizing: "border-box",
};

export const outlinedButtonSx = {
    width: { xs: "100%", md: "auto" },
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

/** Botón primario sin margen (top bar, category gate, etc.) */
export const primaryContainedButtonSx = {
    backgroundColor: BLUE_DEEP,
    color: TEXT_PRIMARY,
    "&:hover": { backgroundColor: "#1e40af" },
};

export const backButtonSx = {
    ...primaryContainedButtonSx,
    mb: 5,
};

export const listDeductionsStackSx = { mt: 1 };

export const deductionItemCardSx = (isCredit: boolean, isPayed: boolean) => ({
    border: `1px solid ${BORDER_COLOR}`,
    borderRadius: 2,
    p: 2,
    backgroundColor: isCredit ? isPayed ? COLORS.DEDUCTION_CREDIT_BG : COLORS.DEDUCTION_CREDIT_BG_PAYED : SURFACE_BG,
    display: "flex",
    flexDirection: { xs: "column", md: "row" },
});

export const deductionItemGridSx = {
    width: "100%",
    display: "flex",
    flexDirection: { xs: "column", md: "row" },
    gap: 1.5,
    alignItems: "center",
    justifyContent: { xs: "center", md: "space-between" },
};

export const deductionItemButtonsSx = {
    display: "flex",
    flexDirection: "row",
    gap: { xs: 4, md: 1.5 },
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
    ...primaryContainedButtonSx,
};

export const managementLoadingStackSx = {
    minHeight: "100vh",
    backgroundColor: DARK_BG,
    alignItems: "center",
    justifyContent: "center",
};

export const managementLoadingProgressSx = {
    color: BLUE_ACCENT,
};

export const categoryGateRootSx = {
    minHeight: "100vh",
    px: 2,
    py: 4,
    backgroundColor: DARK_BG,
    color: TEXT_PRIMARY,
    alignItems: "center",
    justifyContent: "center",
};

export const categoryGateContentSx = {
    width: "100%",
    maxWidth: 420,
    textAlign: "center",
};

export const categoryGateTitleSx = {
    fontWeight: 700,
    color: TEXT_PRIMARY,
};

export const categoryGateSubtitleSx = {
    color: TEXT_SECONDARY,
};

export const categoryGatePillsRowSx = {
    pt: 1,
    flexDirection: "column",
    flexWrap: "nowrap",
    gap: 1.5,
    justifyContent: "flex-start",
    alignItems: "flex-start"
};

export const categoryGatePillButtonSx = {
    width: "100%",
    borderRadius: 999,
    px: 2.5,
    textTransform: "none",
    fontWeight: 600,
    borderColor: DARK_BORDER,
    color: TEXT_PRIMARY,
    backgroundColor: DARK_SURFACE,
    "&:hover": {
        borderColor: BLUE_ACCENT,
        backgroundColor: "#0b1220",
    },
};

export const categoryGateHomeRowSx = {
    pt: 2,
    alignItems: "center",
};

export const managementTopBarContainerSx = {
    width: "100%",
    position: "fixed",
    top: 0,
    left: 0,
    zIndex: 10,
    p: 2,
    backgroundColor: DARK_BG,
};

export const managementTopBarStackSx = {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 1,
    alignItems: "center",
};

export const managementTopBarOutlinedButtonSx = {
    borderColor: DARK_BORDER,
    color: BLUE_ACCENT,
    backgroundColor: DARK_SURFACE,
    "&:hover": {
        borderColor: BLUE_ACCENT,
        backgroundColor: "#0b1220",
    },
};

export const managementTopBarCategoryChipSx = {
    backgroundColor: BLUE_DEEP,
    color: TEXT_PRIMARY,
    fontWeight: 700,
};

export const dateTypographyLabelSx = {
    color: TEXT_SECONDARY,
    mt: 2,
    mb: 1,
};

export const rangeDateRowSx = {
    display: "flex",
    alignItems: "center",
    gap: 1,
    mt: 2,
    mb: 1,
};

export const rangeDateLabelSx = {
    color: TEXT_SECONDARY,
    flex: 1,
};

export const editRangeButtonSx = {
    color: TEXT_SECONDARY,
    borderColor: DARK_BORDER,
    "&:hover": {
        color: BLUE_ACCENT,
        borderColor: BLUE_ACCENT,
        backgroundColor: "#0b1220",
    },
};

export const managementWorkspaceContentStackSx = {
    ...mainStackSx,
    pt: { xs: 14, sm: 12 },
};

export const managementDevAlertSx = {
    width: "100%",
    maxWidth: 760,
};

export const managementRecordsColumnSx = {
    width: "100%",
    maxWidth: 760,
};

export const managementMainLoadingProgressSx = {
    color: BLUE_DEEP,
};

export const managementRecordBodyStackSx = {
    mt: 2,
    width: "100%",
    mb: 3,
};

export const managementAddDeductionButtonSx = {
    ...outlinedButtonSx,
    mt: 1,
    backgroundColor: "#0b1b42",
    width: { xs: "100%" },
    "&:hover": { backgroundColor: "#1e40af" },
};

export const managementViewDeductionsButtonSx = {
    ...outlinedButtonSx,
    mt: 2,
    mb: 1,
    width: { xs: "100%" },
};

export const staticPaymentsSummaryGridSx = {
    display: "grid",
    gridTemplateColumns: "5fr 1fr",
    alignItems: "center",
    justifyItems: "center",
    gap: 2,
};

export const staticPaymentsViewButtonSx = {
    ...outlinedButtonSx,
    width: "100%",
};

export const listStaticPaymentsStackSx = { mt: 1 };

export const staticPaymentsModalAddButtonSx = {
    ...outlinedButtonSx,
    width: { xs: "100%", sm: "auto" },
    alignSelf: "flex-start",
};

export const staticPaymentRowStackSx = {
    width: "100%",
    flexDirection: { xs: "column", sm: "row" },
    gap: 2,
    alignItems: { xs: "stretch", sm: "flex-start" },
    justifyContent: "space-between",
};

export const staticPaymentFieldsStackSx = {
    flex: 1,
    gap: 1,
    minWidth: 0,
};

export const staticPaymentDescriptionSx = {
    color: TEXT_PRIMARY,
    fontWeight: 600,
    wordBreak: "break-word",
};

export const staticPaymentAmountLabelSx = {
    color: TEXT_SECONDARY,
    fontSize: 14,
};

export const staticPaymentAmountValueSx = {
    color: TEXT_PRIMARY,
    fontWeight: 700,
};

export const staticPaymentChipsRowSx = {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 1,
    alignItems: "center",
};

export const staticPaymentCreditChipSx = {
    backgroundColor: "#14532d",
    color: "#bbf7d0",
};

export const staticPaymentStatusChipSx = (isPayed: boolean) => ({
    backgroundColor: isPayed ? "#14532d" : "#713f12",
    color: isPayed ? "#bbf7d0" : "#fde68a",
});

export const staticPaymentPaymentDaySx = {
    color: TEXT_SECONDARY,
    fontSize: 13,
};

export const staticPaymentUnpaidActionsStackSx = {
    flexShrink: 0,
    alignSelf: { xs: "stretch", sm: "flex-start" },
    gap: 1.5,
    alignItems: { xs: "stretch", sm: "flex-end" },
};

export const staticPaymentPayButtonSx = {
    ...primaryContainedButtonSx,
    minWidth: { xs: "100%", sm: 120 },
};