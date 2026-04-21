import { Box, Button, Stack, Typography } from "@mui/material";

export default function Home() {
  return (
    <Box
      component="main"
      sx={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        px: 2,
      }}
    >
      <Stack spacing={2} alignItems="center" textAlign="center">
        <Typography variant="h2" component="h1" fontWeight={700}>
          Hello World
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Next.js + TypeScript + Material UI
        </Typography>
        <Button variant="contained" size="large">
          Empezar
        </Button>
      </Stack>
    </Box>
  );
}
