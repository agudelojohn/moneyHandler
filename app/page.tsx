"use client";
import Link from "next/link";
import { Button, Stack, Typography } from "@mui/material";
import { useI18n } from "./i18n/I18nProvider";

const DARK_BG = "#020617";
const DARK_SURFACE = "#0f172a";
const DARK_BORDER = "#1e293b";
const BLUE_DEEP = "#1d4ed8";
const BLUE_ACCENT = "#60a5fa";
const TEXT_PRIMARY = "#e2e8f0";
const TEXT_SECONDARY = "#94a3b8";

export default function Home() {
  const { t } = useI18n();

  return (
    <Stack
      spacing={3}
      sx={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        px: 2,
        backgroundColor: DARK_BG,
        color: TEXT_PRIMARY,
      }}
    >
      <Typography variant="h3" sx={{ fontWeight: 700, textAlign: "center", color: TEXT_PRIMARY }}>
        {t.home.title}
      </Typography>
      <Typography sx={{ color: TEXT_SECONDARY, textAlign: "center" }}>
        {t.home.subtitle}
      </Typography>
      <Stack spacing={2} sx={{ width: "100%", maxWidth: 320 }}>
        <Link href="/management" style={{ textDecoration: "none" }}>
          <Button
            variant="contained"
            size="large"
            fullWidth
            sx={{
              backgroundColor: BLUE_DEEP,
              color: TEXT_PRIMARY,
              border: "1px solid",
              borderColor: BLUE_DEEP,
              "&:hover": { backgroundColor: "#1e40af" },
            }}
          >
            {t.home.managementButton}
          </Button>
        </Link>
        <Link href="/expenses" style={{ textDecoration: "none" }}>
          <Button
            variant="outlined"
            size="large"
            fullWidth
            sx={{
              backgroundColor: DARK_SURFACE,
              color: BLUE_ACCENT,
              borderColor: DARK_BORDER,
              "&:hover": {
                borderColor: BLUE_ACCENT,
                backgroundColor: "#0b1220",
              },
            }}
          >
            {t.home.expensesButton}
          </Button>
        </Link>
      </Stack>
    </Stack>
  );
}
