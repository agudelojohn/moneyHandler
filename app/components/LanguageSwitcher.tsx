"use client";

import { Button, Stack, Typography } from "@mui/material";
import { useI18n } from "../i18n/I18nProvider";
import * as Sx from "./styles";

export default function LanguageSwitcher() {
  const { locale, setLocale, t } = useI18n();

  return (
    <Stack direction="row" spacing={1} sx={Sx.languageSwitcherStackSx}>
      <Typography variant="caption" sx={Sx.languageSwitcherCaptionSx}>
        {t.common.language}
      </Typography>
      <Button
        size="small"
        variant={locale === "es" ? "contained" : "outlined"}
        onClick={() => setLocale("es")}
        sx={locale === "es" ? Sx.languageSwitcherButtonActiveSx : Sx.languageSwitcherButtonInactiveSx}
      >
        ES
      </Button>
      <Button
        size="small"
        variant={locale === "en" ? "contained" : "outlined"}
        onClick={() => setLocale("en")}
        sx={locale === "en" ? Sx.languageSwitcherButtonActiveSx : Sx.languageSwitcherButtonInactiveSx}
      >
        EN
      </Button>
    </Stack>
  );
}
