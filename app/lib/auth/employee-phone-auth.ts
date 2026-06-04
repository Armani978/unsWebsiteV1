import { createHash } from "crypto";
import type { UserRole } from "./roles";

export type EmployeeProfile = {
  phone: string;
  role: Exclude<UserRole, "customer">;
  codeHash: string;
  createdAt: string;
};

export type EmployeeProfiles = Record<string, EmployeeProfile>;

export type SetupCode = {
  code: string;
  role: Exclude<UserRole, "customer">;
  phone?: string;
  label: string;
};

export const ownerPhone = "9783946591";

export const setupCodes: SetupCode[] = [
  { code: "OWNER-6591", role: "owner", phone: ownerPhone, label: "Owner bootstrap" },
  { code: "MGR-2048", role: "manager", label: "Manager setup" },
  { code: "MGR-7712", role: "manager", label: "Manager setup" },
  { code: "INV-6142", role: "inventory", label: "Inventory setup" },
  { code: "INV-8830", role: "inventory", label: "Inventory setup" },
  { code: "STAFF-3817", role: "employee", label: "Employee setup" },
  { code: "STAFF-4926", role: "employee", label: "Employee setup" },
  { code: "STAFF-7350", role: "employee", label: "Employee setup" },
  { code: "STAFF-8064", role: "employee", label: "Employee setup" },
  { code: "STAFF-1298", role: "employee", label: "Employee setup" },
  { code: "STAFF-5731", role: "employee", label: "Employee setup" },
  { code: "STAFF-2406", role: "employee", label: "Employee setup" },
  { code: "STAFF-9175", role: "employee", label: "Employee setup" },
];

export function normalizePhone(value: string) {
  return value.replace(/\D/g, "");
}

export function normalizeCode(value: string) {
  return value.trim().toUpperCase();
}

export function hashEmployeeCode(phone: string, code: string) {
  const secret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET ?? "upnsmoke-local-auth";
  return createHash("sha256")
    .update(`${secret}:${normalizePhone(phone)}:${code}`)
    .digest("hex");
}

export function findSetupCode(phone: string, code: string) {
  const normalizedPhone = normalizePhone(phone);
  const normalizedCode = normalizeCode(code);

  return setupCodes.find((setupCode) => {
    if (setupCode.code !== normalizedCode) {
      return false;
    }

    return !setupCode.phone || setupCode.phone === normalizedPhone;
  });
}

export function parseProfilesCookie(value: string | undefined): EmployeeProfiles {
  if (!value) {
    return {};
  }

  try {
    const parsed = JSON.parse(Buffer.from(value, "base64url").toString("utf8"));
    if (!parsed || typeof parsed !== "object") {
      return {};
    }

    return parsed as EmployeeProfiles;
  } catch {
    return {};
  }
}

export function serializeProfilesCookie(profiles: EmployeeProfiles) {
  return Buffer.from(JSON.stringify(profiles), "utf8").toString("base64url");
}

export function createEmployeeProfile({
  phone,
  role,
  code,
}: {
  phone: string;
  role: Exclude<UserRole, "customer">;
  code: string;
}): EmployeeProfile {
  const normalizedPhone = normalizePhone(phone);

  return {
    phone: normalizedPhone,
    role,
    codeHash: hashEmployeeCode(normalizedPhone, code),
    createdAt: new Date().toISOString(),
  };
}

export function isValidPersonalCode(profile: EmployeeProfile, code: string) {
  return profile.codeHash === hashEmployeeCode(profile.phone, code);
}
