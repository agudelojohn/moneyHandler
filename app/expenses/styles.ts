import { COLORS } from "../theme";

const { BLUE_DEEP, TEXT_PRIMARY } = COLORS;

export const pageStackSx = {
  minHeight: "100vh",
};

export const topBarContainerSx = {
  width: "100%",
  position: "fixed",
  top: 0,
  left: 0,
  zIndex: 10,
  p: 2,
  pr: { xs: 12, sm: 18 },
};

export const backButtonSx = {
  backgroundColor: BLUE_DEEP,
  color: TEXT_PRIMARY,
  "&:hover": { backgroundColor: "#1e40af" },
};
