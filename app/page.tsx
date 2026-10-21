"use client";
import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Alert, Button, CircularProgress, Stack, Typography } from "@mui/material";
import { getSoloHomeFeatureRoute, isHomeFeatureEnabled } from "@/lib/config/featureFlags";
import { useI18n } from "./i18n/I18nProvider";
import { useUserSession } from "./common/userSession";
import { APP_USER_PROFILES } from "./common/userProfiles";
import * as Sx from "./styles";

export default function Home() {
  const { t } = useI18n();
  const router = useRouter();
  const { activeUser, setActiveUserByKey } = useUserSession();
  const showManagement = isHomeFeatureEnabled("management");
  const showExpenses = isHomeFeatureEnabled("expenses");
  const showHousehold = isHomeFeatureEnabled("household");
  const hasActiveModules = showManagement || showExpenses || showHousehold;
  const soloRoute = getSoloHomeFeatureRoute();
  const shouldRedirectToSoloModule = Boolean(activeUser && soloRoute);
  const moduleButtonVisibilitySx = activeUser ? Sx.moduleButtonVisibleSx : Sx.moduleButtonHiddenSx;

  useEffect(() => {
    if (!activeUser || !soloRoute) {
      return;
    }
    router.replace(soloRoute);
  }, [activeUser, router, soloRoute]);

  if (shouldRedirectToSoloModule) {
    return (
      <Stack sx={Sx.loadingStackSx}>
        <CircularProgress sx={Sx.loadingProgressSx} />
      </Stack>
    );
  }

  return (
    <Stack spacing={3} sx={Sx.pageStackSx}>
      <Typography variant="h3" sx={Sx.titleSx}>
        {t.home.title}
      </Typography>
      <Typography sx={Sx.subtitleSx}>
        {t.home.subtitle}
      </Typography>
      {!activeUser ? (
        <Stack spacing={1.5} sx={Sx.userStackSx}>
          <Alert severity="info" sx={Sx.fullWidthAlertSx}>
            Selecciona el usuario con el que quieres trabajar.
          </Alert>
          {APP_USER_PROFILES.map((profile) => (
            <Button
              key={profile.key}
              variant="contained"
              size="large"
              fullWidth
              onClick={() => setActiveUserByKey(profile.key)}
              sx={Sx.containedButtonSx}
            >
              {profile.label}
            </Button>
          ))}
        </Stack>
      ) : (
        <Alert severity="success" sx={Sx.activeUserAlertSx}>
          Usuario activo: {activeUser.label}
        </Alert>
      )}
      {hasActiveModules && !soloRoute ? (
        <Stack spacing={2} sx={Sx.moduleButtonsStackSx}>
          {showManagement && (
            <Link href="/management" style={{ textDecoration: "none" }}>
              <Button
                variant="contained"
                size="large"
                fullWidth
                disabled={!activeUser}
                sx={[Sx.containedButtonSx, moduleButtonVisibilitySx]}
              >
                {t.home.managementButton}
              </Button>
            </Link>
          )}
          {showExpenses && (
            <Link href="/expenses" style={{ textDecoration: "none" }}>
              <Button
                variant="outlined"
                size="large"
                fullWidth
                disabled={!activeUser}
                sx={[Sx.expensesButtonSx, moduleButtonVisibilitySx]}
              >
                {t.home.expensesButton}
              </Button>
            </Link>
          )}
          {showHousehold && (
            <Link href="/household" style={{ textDecoration: "none" }}>
              <Button
                variant="contained"
                size="large"
                fullWidth
                disabled={!activeUser}
                sx={[Sx.containedButtonSx, moduleButtonVisibilitySx]}
              >
                {t.home.householdButton}
              </Button>
            </Link>
          )}
        </Stack>
      ) : null}
      {!hasActiveModules ? (
        <Stack spacing={1} sx={Sx.emptyStateSx}>
          <Typography variant="h6" sx={Sx.emptyStateTitleSx}>
            {t.home.noActiveModules}
          </Typography>
          <Typography sx={Sx.emptyStateDescriptionSx}>
            {t.home.noActiveModulesDescription}
          </Typography>
        </Stack>
      ) : null}
    </Stack>
  );
}
