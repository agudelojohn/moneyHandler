"use client";

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Stack,
  Switch,
  Typography,
} from "@mui/material";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { useCategories } from "@/app/common/categoriesSession";
import { useCategoryConfig } from "@/app/common/categoryConfigSession";
import { useUserSession } from "@/app/common/userSession";
import { useI18n } from "@/app/i18n/I18nProvider";
import { getCategoryLabel } from "@/app/i18n/translations";
import {
  CATEGORY_SWITCH_KEYS,
  type CategorySwitchKey,
  type CategorySwitches,
} from "../categorySwitches";
import * as Sx from "../styles";

function CategorySettingsContent() {
  const { t } = useI18n();
  const searchParams = useSearchParams();
  const { activeUser } = useUserSession();
  const { categories, isLoading: categoriesLoading } = useCategories();
  const { getSwitches, saveSwitches, isLoading, error } = useCategoryConfig();
  const [pending, setPending] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const categoryId = searchParams.get("categoryId");
  const category = categories.find((item) => item.id === categoryId) ?? null;
  const switches = category ? getSwitches(category.id) : null;

  async function handleToggle(key: CategorySwitchKey, checked: boolean) {
    if (!category || !switches) {
      return;
    }

    const next: CategorySwitches = { ...switches, [key]: checked };
    setPending(true);
    setSaveError(null);
    try {
      await saveSwitches(category.id, next);
    } catch {
      setSaveError(t.categorySettings.saveError);
    } finally {
      setPending(false);
    }
  }

  if (categoriesLoading || isLoading) {
    return (
      <Stack sx={Sx.categorySettingsPageSx}>
        <CircularProgress />
      </Stack>
    );
  }

  if (!category || !switches) {
    return (
      <Stack sx={Sx.categorySettingsPageSx}>
        <Alert severity="info">{t.categorySettings.missingCategory}</Alert>
        <Link href="/management" style={{ textDecoration: "none" }}>
          <Button variant="contained" sx={Sx.primaryContainedButtonSx}>
            {t.categorySettings.backToCategory}
          </Button>
        </Link>
      </Stack>
    );
  }

  const categoryLabel = getCategoryLabel(category, t);
  const switchLabels: Record<CategorySwitchKey, { label: string; description: string }> = {
    dailyConfiguration: {
      label: t.categorySettings.dailyConfiguration,
      description: t.categorySettings.dailyConfigurationDescription,
    },
  };

  return (
    <Stack sx={Sx.categorySettingsPageSx}>
      <Stack sx={Sx.categorySettingsCardSx}>
        <Typography variant="h4" sx={Sx.titleSx}>
          {t.categorySettings.title}
        </Typography>
        <Typography sx={Sx.dateTypographyLabelSx}>
          {categoryLabel}. {t.categorySettings.subtitle}
        </Typography>

        {error && <Alert severity="error">{t.categorySettings.loadError}</Alert>}
        {saveError && <Alert severity="error">{saveError}</Alert>}

        {CATEGORY_SWITCH_KEYS.map((key) => {
          const copy = switchLabels[key];
          return (
            <Box key={key} sx={Sx.categorySettingsSwitchRowSx}>
              <Box>
                <Typography>{copy.label}</Typography>
                <Typography variant="body2" sx={Sx.dateTypographyLabelSx}>
                  {copy.description}
                </Typography>
              </Box>
              <Switch
                checked={switches[key]}
                disabled={pending || !activeUser}
                onChange={(_, checked) => {
                  void handleToggle(key, checked);
                }}
                slotProps={{ input: { "aria-label": copy.label } }}
              />
            </Box>
          );
        })}

        <Link href={`/management?category=${encodeURIComponent(category.id)}`} style={{ textDecoration: "none" }}>
          <Button variant="outlined" sx={Sx.outlinedButtonSx}>
            {t.categorySettings.backToCategory}
          </Button>
        </Link>
      </Stack>
    </Stack>
  );
}

export default function CategorySettingsPage() {
  return (
    <Suspense fallback={<Stack sx={Sx.categorySettingsPageSx}><CircularProgress /></Stack>}>
      <CategorySettingsContent />
    </Suspense>
  );
}
