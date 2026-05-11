import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useUserSession, UserSessionProvider } from "@/app/common/userSession";
import { APP_USER_PROFILES } from "@/app/common/userProfiles";

function SessionEcho() {
  const { activeUser } = useUserSession();
  return <span>{activeUser?.label ?? "none"}</span>;
}

describe("UserSessionProvider", () => {
  it("lanza si useUserSession se usa fuera del proveedor", () => {
    expect(() => render(<SessionEcho />)).toThrow(/useUserSession must be used inside UserSessionProvider/);
  });

  it("restaura el usuario desde sessionStorage", async () => {
    sessionStorage.setItem("money-handler-active-user", "clau");

    render(
      <UserSessionProvider>
        <SessionEcho />
      </UserSessionProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText("Clau")).toBeInTheDocument();
    });

    sessionStorage.clear();
  });
});

describe("withUserIdHeader", () => {
  it("añade x-user-id cuando el id es válido", async () => {
    const { withUserIdHeader } = await import("@/app/common/userSession");
    const userId = APP_USER_PROFILES[0]?.userId;
    expect(userId).toBeDefined();
    const headers = withUserIdHeader(userId, { "Content-Type": "application/json" }) as Headers;
    expect(headers.get("x-user-id")).toBe(userId);
    expect(headers.get("Content-Type")).toBe("application/json");
  });

  it("no añade x-user-id cuando el id no es válido", async () => {
    const { withUserIdHeader } = await import("@/app/common/userSession");
    const headers = withUserIdHeader("invalido") as Headers;
    expect(headers.get("x-user-id")).toBeNull();
  });
});
