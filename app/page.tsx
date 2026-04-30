"use client";
import Link from "next/link";
import { Alert, Button, Stack, Typography } from "@mui/material";
import { useI18n } from "./i18n/I18nProvider";
import { useUserSession } from "./common/userSession";
import { APP_USER_PROFILES } from "./common/userProfiles";
import { COLORS } from "./theme";

export default function Home() {
  const { t } = useI18n();
  const { activeUser, setActiveUserByKey } = useUserSession();
  const { DARK_BG, TEXT_PRIMARY, TEXT_SECONDARY, BLUE_DEEP, BLUE_ACCENT, DARK_SURFACE, DARK_BORDER } = COLORS;

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
      {!activeUser ? (
        <Stack spacing={1.5} sx={{ width: "100%", maxWidth: 320 }}>
          <Alert severity="info" sx={{ width: "100%" }}>
            Selecciona el usuario con el que quieres trabajar.
          </Alert>
          {APP_USER_PROFILES.map((profile) => (
            <Button
              key={profile.key}
              variant="contained"
              size="large"
              fullWidth
              onClick={() => setActiveUserByKey(profile.key)}
              sx={{
                backgroundColor: BLUE_DEEP,
                color: TEXT_PRIMARY,
                border: "1px solid",
                borderColor: BLUE_DEEP,
                "&:hover": { backgroundColor: "#1e40af" },
              }}
            >
              {profile.label}
            </Button>
          ))}
        </Stack>
      ) : (
        <Alert severity="success" sx={{ width: "100%", maxWidth: 320 }}>
          Usuario activo: {activeUser.label}
        </Alert>
      )}
      <Stack spacing={2} sx={{ width: "100%", maxWidth: 320 }}>
        <Link href="/management" style={{ textDecoration: "none" }}>
          <Button
            variant="contained"
            size="large"
            fullWidth
            disabled={!activeUser}
            sx={{
              display: activeUser ? "block" : "none",
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
            disabled={!activeUser}
            sx={{
              display: activeUser ? "block" : "none",
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
