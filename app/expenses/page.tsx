"use client";

import Link from "next/link";
import { Button, Container, Stack } from "@mui/material";
import ExpensesDashboard from "../components/ExpensesDashboard";
import { useI18n } from "../i18n/I18nProvider";

const BLUE_DEEP = "#1d4ed8";
const TEXT_PRIMARY = "#e2e8f0";

export default function ExpensesPage() {
  const { t } = useI18n();

  return (
    <Stack sx={{ minHeight: "100vh" }}>
      <Container
        maxWidth={false}
        disableGutters
        sx={{ width: "100%", position: "fixed", top: 0, left: 0, zIndex: 10, p: 2 }}
      >
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
      </Container>
      <ExpensesDashboard />
    </Stack>
  );
}
