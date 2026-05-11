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
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 2,
    px: 3,
};

export const staticPaymentAmountTextFieldSx = [textFieldSx, { minWidth: 120 }] as const;
