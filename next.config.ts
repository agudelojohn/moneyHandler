import type { NextConfig } from "next";
import os from "node:os";

function getLanIpv4Addresses(): string[] {
  const addresses = new Set<string>();
  for (const iface of Object.values(os.networkInterfaces())) {
    for (const addr of iface ?? []) {
      if (addr.family === "IPv4" && !addr.internal) {
        addresses.add(addr.address);
      }
    }
  }
  return [...addresses];
}

function getAllowedDevOriginsFromEnv(): string[] {
  const raw = process.env.ALLOWED_DEV_ORIGINS;
  if (!raw) {
    return [];
  }
  return raw
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

const nextConfig: NextConfig = {
  // Next.js 16 bloquea recursos dev cross-origin (p. ej. acceso por IP LAN desde el móvil).
  // Sin esto, los onClick de Client Components pueden no responder en Safari iOS/Android.
  allowedDevOrigins: [...getLanIpv4Addresses(), ...getAllowedDevOriginsFromEnv()],
};

export default nextConfig;
