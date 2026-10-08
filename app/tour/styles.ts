import { COLORS } from "../theme";

const { DARK_BG, DARK_SURFACE, DARK_BORDER, TEXT_PRIMARY, TEXT_SECONDARY, BLUE_DEEP, BLUE_ACCENT } = COLORS;

export const tourDialogSx = {
    "& .MuiPaper-root": {
        backgroundColor: DARK_SURFACE,
        color: TEXT_PRIMARY,
        border: `1px solid ${DARK_BORDER}`,
    },
};

export const tourBodySx = {
    color: TEXT_SECONDARY,
    lineHeight: 1.6,
};

export const tourProgressSx = {
    color: BLUE_ACCENT,
    fontWeight: 700,
    letterSpacing: 0.4,
};

export const tourActionsSx = {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 1,
    justifyContent: "space-between",
    width: "100%",
};

export const tourNavButtonsSx = {
    flexDirection: "row",
    gap: 1,
};

export const tourSkipButtonSx = {
    color: TEXT_SECONDARY,
};

export const tourNextButtonSx = {
    backgroundColor: BLUE_DEEP,
    color: TEXT_PRIMARY,
    "&:hover": { backgroundColor: "#1e40af" },
};

export const tourShadeSx = {
    position: "fixed" as const,
    backgroundColor: "rgba(2, 6, 23, 0.72)",
    zIndex: 1600,
};

export const tourRingSx = {
    position: "fixed" as const,
    border: "2px solid #60a5fa",
    borderRadius: 2,
    boxShadow: "0 0 0 4px rgba(96, 165, 250, 0.35)",
    zIndex: 1601,
    pointerEvents: "none" as const,
};

export const tourCardSx = {
    position: "fixed" as const,
    zIndex: 1602,
    width: "min(360px, calc(100vw - 24px))",
    p: 2,
    borderRadius: 2,
    backgroundColor: DARK_SURFACE,
    color: TEXT_PRIMARY,
    border: `1px solid ${DARK_BORDER}`,
    display: "flex",
    flexDirection: "column",
    gap: 1.5,
};

export const tourReplayButtonSx = {
    color: BLUE_ACCENT,
    borderColor: DARK_BORDER,
    backgroundColor: DARK_BG,
    "&:hover": {
        borderColor: BLUE_ACCENT,
        backgroundColor: "#0b1220",
    },
};
