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

export default theme;
