

import { Container } from "@mui/material";
import ExpensesDashboard from "./components/ExpensesDashboard";

export default function Home() {
  return (
    <Container maxWidth="lg">
      <ExpensesDashboard />
    </Container>
  );
}
