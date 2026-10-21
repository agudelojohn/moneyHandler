import { COLORS } from "./theme";

const {
  DARK_BG,
  TEXT_PRIMARY,
  TEXT_SECONDARY,
  BLUE_DEEP,
  BLUE_ACCENT,
  DARK_SURFACE,
  DARK_BORDER,
} = COLORS;

export const pageStackSx = {
  minHeight: "100vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  px: 2,
  pt: { xs: 8, sm: 2 },
  pb: { xs: 8, sm: 2 },
  backgroundColor: DARK_BG,
  color: TEXT_PRIMARY,
};

export const titleSx = {
  fontWeight: 700,
  textAlign: "center",
  color: TEXT_PRIMARY,
};

export const subtitleSx = {
  color: TEXT_SECONDARY,
  textAlign: "center",
};

export const userStackSx = {
  width: "100%",
  maxWidth: 320,
};

export const fullWidthAlertSx = {
  width: "100%",
};

export const activeUserAlertSx = {
  width: "100%",
  maxWidth: 320,
};

export const containedButtonSx = {
  backgroundColor: BLUE_DEEP,
  color: TEXT_PRIMARY,
  border: "1px solid",
  borderColor: BLUE_DEEP,
  "&:hover": { backgroundColor: "#1e40af" },
};

export const moduleButtonsStackSx = {
  width: "100%",
  maxWidth: 320,
};

export const expensesButtonSx = {
  backgroundColor: DARK_SURFACE,
  color: BLUE_ACCENT,
  borderColor: DARK_BORDER,
  "&:hover": {
    borderColor: BLUE_ACCENT,
    backgroundColor: "#0b1220",
  },
};

export const moduleButtonVisibleSx = {
  display: "block",
};

export const moduleButtonHiddenSx = {
  display: "none",
};

export const emptyStateSx = {
  width: "100%",
  maxWidth: 320,
  textAlign: "center",
};

export const emptyStateTitleSx = {
  fontWeight: 600,
  color: TEXT_PRIMARY,
};

export const emptyStateDescriptionSx = {
  color: TEXT_SECONDARY,
};

export const loadingStackSx = {
  minHeight: "100vh",
  backgroundColor: DARK_BG,
  alignItems: "center",
  justifyContent: "center",
};

export const loadingProgressSx = {
  color: BLUE_ACCENT,
};
