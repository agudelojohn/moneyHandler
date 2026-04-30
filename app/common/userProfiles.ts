export type AppUserKey = "alejo" | "clau";

export type AppUserProfile = {
  key: AppUserKey;
  label: string;
  userId: string;
};

export const APP_USER_PROFILES: AppUserProfile[] = [
  {
    key: "alejo",
    label: "Alejo",
    userId: "6b7b7b40",
  },
  {
    key: "clau",
    label: "Clau",
    userId: "8cfdbf65",
  },
];

const USER_ID_SET = new Set(APP_USER_PROFILES.map((profile) => profile.userId));

export const getAppUserByKey = (key: AppUserKey) =>
  APP_USER_PROFILES.find((profile) => profile.key === key) ?? null;

export const isValidAppUserId = (userId: string | null | undefined): userId is string =>
  typeof userId === "string" && USER_ID_SET.has(userId);
