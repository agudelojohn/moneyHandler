import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#5B5BD6",
    },
    secondary: {
      main: "#0F766E",
    },
    background: {
      default: "#F4F6FB",
      paper: "#FFFFFF",
    },
    text: {
      primary: "#1E293B",
      secondary: "#475569",
    },
  },
  shape: {
    borderRadius: 14,
  },
});


const DARK_BG = "#020617";
const DARK_SURFACE = "#0f172a";
const DARK_BORDER = "#1e293b";
const BLUE_DEEP = "#1d4ed8";
const BLUE_ACCENT = "#60a5fa";
const TEXT_PRIMARY = "#e2e8f0";
const TEXT_SECONDARY = "#94a3b8";
const SURFACE_BG = "#0f172a";
const BORDER_COLOR = "#1e293b";
const DEDUCTION_CREDIT_BG = "#052e16";


export const COLORS = {
  DARK_BG,
  DARK_SURFACE,
  DARK_BORDER,
  BLUE_DEEP,
  BLUE_ACCENT,
  TEXT_PRIMARY,
  TEXT_SECONDARY,
  SURFACE_BG,
  BORDER_COLOR,
  DEDUCTION_CREDIT_BG,
}

export default theme;
