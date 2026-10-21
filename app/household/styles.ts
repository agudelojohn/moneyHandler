import { COLORS } from "../theme";

const {
  DARK_BG,
  DARK_SURFACE,
  DARK_BORDER,
  BLUE_DEEP,
  BLUE_ACCENT,
  TEXT_PRIMARY,
  TEXT_SECONDARY,
  SURFACE_BG,
  BORDER_COLOR,
} = COLORS;

export { textFieldSx } from "../components/styles";

export const pageStackSx = {
  minHeight: "100vh",
  backgroundColor: DARK_BG,
  color: TEXT_PRIMARY,
  px: { xs: 2, sm: 4 },
  py: 2,
  pt: { xs: 8, sm: 2 },
};

export const topBarContainerSx = {
  width: "100%",
  mb: 3,
  pr: { xs: 12, sm: 2 },
};

export const backButtonSx = {
  backgroundColor: BLUE_DEEP,
  color: TEXT_PRIMARY,
  "&:hover": { backgroundColor: "#1e40af" },
};

export const titleSx = {
  fontWeight: 700,
  color: TEXT_PRIMARY,
  mb: 2,
};

export const contentStackSx = {
  width: "100%",
  maxWidth: 720,
  mx: "auto",
  pb: { xs: 10, sm: 6 },
  minWidth: 0,
};

export const createRowSx = {
  flexDirection: { xs: "column", sm: "row" },
  alignItems: { xs: "stretch", sm: "center" },
  gap: 1.5,
  mb: 3,
};

export const addButtonSx = {
  backgroundColor: BLUE_DEEP,
  color: TEXT_PRIMARY,
  whiteSpace: { xs: "normal", sm: "nowrap" },
  height: 56,
  width: { xs: "100%", sm: "auto" },
  "&:hover": { backgroundColor: "#1e40af" },
};

export const sectionTitleSx = {
  fontWeight: 600,
  color: TEXT_PRIMARY,
  mb: 1,
};

export const doneSectionTitleSx = {
  fontWeight: 600,
  color: TEXT_PRIMARY,
  mb: 1,
  mt: 3,
};

export const sectionStackSx = {
  border: `1px solid ${DARK_BORDER}`,
  borderRadius: 2,
  backgroundColor: DARK_SURFACE,
  p: 1.5,
  minHeight: 72,
};

export const emptyStateSx = {
  color: TEXT_SECONDARY,
  py: 1,
};

export const pendingItemRowSx = {
  flexDirection: { xs: "column", sm: "row" },
  alignItems: { xs: "stretch", sm: "center" },
  justifyContent: "space-between",
  gap: 1,
  py: 1,
  minWidth: 0,
  borderBottom: `1px solid ${DARK_BORDER}`,
  "&:last-child": { borderBottom: "none" },
};

export const pendingActionsRowSx = {
  flexDirection: "row",
  flexShrink: 0,
  justifyContent: { xs: "flex-end", sm: "flex-start" },
};

export const doneItemRowSx = {
  py: 1.25,
  borderBottom: `1px solid ${DARK_BORDER}`,
  "&:last-child": { borderBottom: "none" },
};

export const descriptionSx = {
  color: TEXT_PRIMARY,
  flex: 1,
  minWidth: 0,
  wordBreak: "break-word",
};

export const doneMetaSx = {
  color: TEXT_SECONDARY,
  fontSize: 13,
};

export const iconButtonSx = {
  color: BLUE_ACCENT,
};

export const deleteIconButtonSx = {
  color: TEXT_SECONDARY,
};

export const dialogSx = {
  "& .MuiPaper-root": {
    backgroundColor: SURFACE_BG,
    color: TEXT_PRIMARY,
    border: `1px solid ${BORDER_COLOR}`,
  },
};

export const loadingStackSx = {
  minHeight: "40vh",
  alignItems: "center",
  justifyContent: "center",
};

export const loadingProgressSx = {
  color: BLUE_ACCENT,
};
