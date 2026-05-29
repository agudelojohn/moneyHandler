import { COLORS } from "../theme";

const { TEXT_PRIMARY, TEXT_SECONDARY, BORDER_COLOR, BLUE_DEEP } = COLORS;

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

export const staticPaymentAmountTextFieldSx = {
    ...textFieldSx,
    flex: { xs: 1, sm: "0 0 auto" },
    minWidth: { sm: 120 },
};

export const staticPaymentDeleteButtonSx = {
    color: "#f87171",
    flexShrink: 0,
};
