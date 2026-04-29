"use client";

import { Button, Stack, Typography } from "@mui/material";
import { useI18n } from "../i18n/I18nProvider";

const DARK_SURFACE = "#0f172a";
const DARK_BORDER = "#1e293b";
const BLUE_ACCENT = "#60a5fa";
const TEXT_PRIMARY = "#e2e8f0";
const TEXT_SECONDARY = "#94a3b8";

export default function LanguageSwitcher() {
  const { locale, setLocale, t } = useI18n();

  return (
    <Stack
      direction="row"
      spacing={1}
      sx={{
        position: "fixed",
        top: 12,
        right: 12,
        zIndex: 2000,
        alignItems: "center",
        px: 1.5,
        py: 1,
        borderRadius: 2,
        border: "1px solid",
        borderColor: DARK_BORDER,
        backgroundColor: DARK_SURFACE,
      }}
    >
      <Typography variant="caption" sx={{ color: TEXT_SECONDARY, fontWeight: 700 }}>
        {t.common.language}
      </Typography>
      <Button
        size="small"
        variant={locale === "es" ? "contained" : "outlined"}
        onClick={() => setLocale("es")}
        sx={{
          minWidth: 44,
          color: TEXT_PRIMARY,
          borderColor: BLUE_ACCENT,
          backgroundColor: locale === "es" ? BLUE_ACCENT : "transparent",
          "&:hover": { backgroundColor: locale === "es" ? "#3b82f6" : "#0b1220" },
        }}
      >
        ES
      </Button>
      <Button
        size="small"
        variant={locale === "en" ? "contained" : "outlined"}
        onClick={() => setLocale("en")}
        sx={{
          minWidth: 44,
          color: TEXT_PRIMARY,
          borderColor: BLUE_ACCENT,
          backgroundColor: locale === "en" ? BLUE_ACCENT : "transparent",
          "&:hover": { backgroundColor: locale === "en" ? "#3b82f6" : "#0b1220" },
        }}
      >
        EN
      </Button>
    </Stack>
  );
}
