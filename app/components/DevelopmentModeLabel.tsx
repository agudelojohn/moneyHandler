"use client";

import { Stack, Typography } from "@mui/material";
import { useI18n } from "../i18n/I18nProvider";
import * as Sx from "./styles";

export default function DevelopmentModeLabel() {
  const { t } = useI18n();

  return (
    <Stack sx={Sx.developmentModeLabelSx}>
      <Typography variant="caption" sx={Sx.developmentModeLabelTextSx}>
        {t.common.developmentMode}
      </Typography>
    </Stack>
  );
}
