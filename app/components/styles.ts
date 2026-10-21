import { COLORS } from "../theme";

const { TEXT_PRIMARY, TEXT_SECONDARY, BORDER_COLOR, BLUE_DEEP, BLUE_ACCENT, DARK_SURFACE, DARK_BORDER } = COLORS;

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

export const staticPaymentFieldRowSx = {
    width: "100%",
    flexDirection: { xs: "column", sm: "row" },
    gap: { xs: 1.5, sm: 2 },
    alignItems: { xs: "stretch", sm: "center" },
    px: { xs: 1, sm: 2 },
};

export const staticPaymentFieldActionsSx = {
    flexDirection: "row",
    alignItems: "center",
    gap: 1,
    width: { xs: "100%", sm: "auto" },
    flexShrink: 0,
};

export const staticPaymentDescriptionTextFieldSx = {
    ...textFieldSx,
    flex: { sm: 1 },
    minWidth: { sm: 0 },
};

export const moneyAmountTextFieldSx = {
    ...textFieldSx,
    minWidth: { xs: 0, sm: 168 },
    width: { xs: "100%", sm: "auto" },
};

export const staticPaymentAmountTextFieldSx = {
    ...textFieldSx,
    flex: { xs: 1, sm: "0 0 auto" },
    minWidth: { sm: 168 },
};

export const staticPaymentDeleteButtonSx = {
    color: "#f87171",
    flexShrink: 0,
};

export const developmentModeLabelSx = {
    position: "fixed",
    bottom: 12,
    left: 12,
    zIndex: 2000,
    px: 1.5,
    py: 0.75,
    borderRadius: 2,
    border: "1px solid",
    borderColor: DARK_BORDER,
    backgroundColor: DARK_SURFACE,
};

export const developmentModeLabelTextSx = {
    color: TEXT_SECONDARY,
    fontWeight: 700,
    letterSpacing: 0.4,
    textTransform: "uppercase",
};

export const languageSwitcherStackSx = {
    position: "fixed",
    top: 12,
    right: 12,
    zIndex: 2000,
    alignItems: "center",
    px: { xs: 1, sm: 1.5 },
    py: 1,
    borderRadius: 2,
    border: "1px solid",
    borderColor: DARK_BORDER,
    backgroundColor: DARK_SURFACE,
    maxWidth: { xs: "calc(100vw - 24px)", sm: "none" },
};

export const languageSwitcherCaptionSx = {
    color: TEXT_SECONDARY,
    fontWeight: 700,
    display: { xs: "none", sm: "block" },
};

export const languageSwitcherButtonSx = {
    minWidth: 44,
    color: TEXT_PRIMARY,
    borderColor: BLUE_ACCENT,
};

export const languageSwitcherButtonActiveSx = {
    ...languageSwitcherButtonSx,
    backgroundColor: BLUE_ACCENT,
    "&:hover": { backgroundColor: "#3b82f6" },
};

export const languageSwitcherButtonInactiveSx = {
    ...languageSwitcherButtonSx,
    backgroundColor: "transparent",
    "&:hover": { backgroundColor: "#0b1220" },
};
