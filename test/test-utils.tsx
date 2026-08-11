import { CssBaseline, ThemeProvider } from "@mui/material";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v16-appRouter";
import { render, type RenderOptions } from "@testing-library/react";
import type { ReactElement, ReactNode } from "react";
import { UserSessionProvider } from "@/app/common/userSession";
import { CategoriesProvider } from "@/app/common/categoriesSession";
import { I18nProvider } from "@/app/i18n/I18nProvider";
import theme from "@/app/theme";

function AllProviders({ children }: { children: ReactNode }) {
  return (
    <AppRouterCacheProvider options={{ key: "css" }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <UserSessionProvider>
          <CategoriesProvider>
            <I18nProvider>{children}</I18nProvider>
          </CategoriesProvider>
        </UserSessionProvider>
      </ThemeProvider>
    </AppRouterCacheProvider>
  );
}

export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">,
) {
  return render(ui, { wrapper: AllProviders, ...options });
}

export { AllProviders };
