"use client";

import Link from "next/link";
import { Button, Container, Stack } from "@mui/material";
import ExpensesDashboard from "../components/ExpensesDashboard";
import { useI18n } from "../i18n/I18nProvider";
import * as Sx from "./styles";

export default function ExpensesPage() {
  const { t } = useI18n();

  return (
    <Stack sx={Sx.pageStackSx}>
      <Container maxWidth={false} disableGutters sx={Sx.topBarContainerSx}>
        <Link href="/" style={{ textDecoration: "none" }}>
          <Button variant="contained" size="large" sx={Sx.backButtonSx}>
            {t.common.backToHome}
          </Button>
        </Link>
      </Container>
      <ExpensesDashboard />
    </Stack>
  );
}
