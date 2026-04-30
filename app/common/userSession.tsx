"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  type AppUserKey,
  type AppUserProfile,
  getAppUserByKey,
  isValidAppUserId,
} from "./userProfiles";

const ACTIVE_USER_STORAGE_KEY = "money-handler-active-user";

type UserSessionContextValue = {
  activeUser: AppUserProfile | null;
  setActiveUserByKey: (key: AppUserKey) => void;
  clearActiveUser: () => void;
};

const UserSessionContext = createContext<UserSessionContextValue | null>(null);

export function UserSessionProvider({ children }: { children: ReactNode }) {
  const [activeUser, setActiveUser] = useState<AppUserProfile | null>(null);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const storedKey = window.sessionStorage.getItem(ACTIVE_USER_STORAGE_KEY) as AppUserKey | null;
      if (!storedKey) {
        return;
      }
      const storedUser = getAppUserByKey(storedKey);
      if (!storedUser) {
        window.sessionStorage.removeItem(ACTIVE_USER_STORAGE_KEY);
        return;
      }
      setActiveUser(storedUser);
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, []);

  const value = useMemo<UserSessionContextValue>(
    () => ({
      activeUser,
      setActiveUserByKey: (key) => {
        const user = getAppUserByKey(key);
        if (!user) {
          return;
        }
        setActiveUser(user);
        window.sessionStorage.setItem(ACTIVE_USER_STORAGE_KEY, key);
      },
      clearActiveUser: () => {
        setActiveUser(null);
        window.sessionStorage.removeItem(ACTIVE_USER_STORAGE_KEY);
      },
    }),
    [activeUser]
  );

  return <UserSessionContext.Provider value={value}>{children}</UserSessionContext.Provider>;
}

export function useUserSession() {
  const context = useContext(UserSessionContext);
  if (!context) {
    throw new Error("useUserSession must be used inside UserSessionProvider");
  }
  return context;
}

export function withUserIdHeader(userId: string | null | undefined, headers?: HeadersInit): HeadersInit {
  const normalizedHeaders = new Headers(headers);
  if (isValidAppUserId(userId)) {
    normalizedHeaders.set("x-user-id", userId);
  }
  return normalizedHeaders;
}
