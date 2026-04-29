"use client";

import Link from "next/link";
import { Button, Stack, Typography } from "@mui/material";
import { useI18n } from "../i18n/I18nProvider";

const DARK_BG = "#020617";
const BLUE_DEEP = "#1d4ed8";
const TEXT_PRIMARY = "#e2e8f0";
const TEXT_SECONDARY = "#94a3b8";

export default function ManagementPage() {
  const { t } = useI18n();

  return (
    <Stack
      spacing={4}
      sx={{
        minHeight: "100vh",
        justifyContent: "center",
        alignItems: "center",
        px: 2,
        backgroundColor: DARK_BG,
        color: TEXT_PRIMARY,
      }}
    >
      <Typography variant="h2" sx={{ fontWeight: 700, textAlign: "center", color: TEXT_PRIMARY }}>
        {t.management.title}
      </Typography>
      <Typography sx={{ color: TEXT_SECONDARY, textAlign: "center" }}>
        {t.management.subtitle}
      </Typography>
      <Link href="/" style={{ textDecoration: "none" }}>
        <Button
          variant="contained"
          size="large"
          sx={{
            backgroundColor: BLUE_DEEP,
            color: TEXT_PRIMARY,
            "&:hover": { backgroundColor: "#1e40af" },
          }}
        >
          {t.common.backToHome}
        </Button>
      </Link>
    </Stack >
  );
}
