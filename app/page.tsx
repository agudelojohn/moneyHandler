

import { Container } from "@mui/material";
import ExpensesDashboard from "./components/ExpensesDashboard";

export default function Home() {
  return (
    <Container maxWidth={false} disableGutters sx={{ width: "100%", minHeight: "100vh" }}>
      <ExpensesDashboard />
    </Container>
  );
}
