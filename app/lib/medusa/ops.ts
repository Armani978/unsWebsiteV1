export function getMedusaBackendUrl() {
  return process.env.MEDUSA_BACKEND_URL?.replace(/\/$/, "") ?? null;
}

export async function medusaOpsFetch(path: string, init?: RequestInit) {
  const backendUrl = getMedusaBackendUrl();

  if (!backendUrl) return null;

  try {
    return await fetch(`${backendUrl}${path}`, {
      ...init,
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        ...(init?.headers ?? {}),
      },
      signal: init?.signal ?? AbortSignal.timeout(5000),
    });
  } catch {
    return null;
  }
}
