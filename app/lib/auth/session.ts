import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  isCustomerRole,
  isEmployeeRole,
  roleHasPermission,
  type Permission,
  type UserRole,
} from "./roles";

export type AuthSession = {
  email: string;
  role: UserRole;
};

export async function getSession(): Promise<AuthSession | null> {
  const cookieStore = await cookies();
  const role = cookieStore.get("uns_session_role")?.value as UserRole | undefined;
  const email = cookieStore.get("uns_session_email")?.value;

  if (!role || !email) {
    return null;
  }

  return { email, role };
}

export async function requireCustomer() {
  const session = await getSession();

  if (!session || !isCustomerRole(session.role)) {
    redirect("/auth/login");
  }

  return session;
}

export async function requireEmployee() {
  const session = await getSession();

  if (!session || !isEmployeeRole(session.role)) {
    redirect("/employee/login");
  }

  return session;
}

export async function requirePermission(permission: Permission) {
  const session = await requireEmployee();

  if (!roleHasPermission(session.role, permission)) {
    redirect("/employee/dashboard");
  }

  return session;
}
