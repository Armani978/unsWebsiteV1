import { type Permission, roleHasPermission } from "./roles";
import { getSession } from "./session";

export async function requireApiPermission(permission: Permission) {
  const session = await getSession();

  if (!session) {
    return {
      ok: false as const,
      response: Response.json(
        { error: "Authentication required." },
        { status: 401 },
      ),
    };
  }

  if (!roleHasPermission(session.role, permission)) {
    return {
      ok: false as const,
      response: Response.json({ error: "Permission denied." }, { status: 403 }),
    };
  }

  return {
    ok: true as const,
    session,
  };
}
