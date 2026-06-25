import { randomUUID } from "node:crypto";
import { type NextRequest, NextResponse } from "next/server";
import { employeeRoles, type UserRole } from "./roles";

export type EmployeeAuthProvider = "apple" | "google";

type EmployeeOAuthConfig = {
  authorizationUrl: string;
  clientId: string;
  clientSecret: string;
  issuer: string;
  jwksUrl: string;
  scopes: string[];
  tokenUrl: string;
};

type JwtHeader = {
  alg?: string;
  kid?: string;
};

type JwtPayload = {
  aud?: string | string[];
  email?: string;
  email_verified?: boolean | string;
  exp?: number;
  hd?: string;
  iss?: string;
  sub?: string;
};

type ProviderJsonWebKey = JsonWebKey & {
  kid?: string;
};

export type EmployeeOAuthState = {
  next: string;
  nonce: string;
  provider: EmployeeAuthProvider;
};

const providerNames: Record<EmployeeAuthProvider, string> = {
  apple: "Apple",
  google: "Google",
};

const oauthStateCookie = "uns_employee_oauth_state";

function base64UrlDecode(value: string) {
  const padded = value.padEnd(
    value.length + ((4 - (value.length % 4)) % 4),
    "=",
  );
  return Buffer.from(padded.replace(/-/g, "+").replace(/_/g, "/"), "base64");
}

function parseJson<T>(value: string) {
  return JSON.parse(value) as T;
}

export function getProviderName(provider: EmployeeAuthProvider) {
  return providerNames[provider];
}

export function getEmployeeOAuthConfig(provider: EmployeeAuthProvider) {
  if (provider === "google") {
    const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();

    if (!clientId || !clientSecret) {
      return {
        configured: false as const,
        missing: [
          !clientId ? "GOOGLE_CLIENT_ID" : null,
          !clientSecret ? "GOOGLE_CLIENT_SECRET" : null,
        ].filter(Boolean),
      };
    }

    return {
      configured: true as const,
      config: {
        authorizationUrl: "https://accounts.google.com/o/oauth2/v2/auth",
        clientId,
        clientSecret,
        issuer: "https://accounts.google.com",
        jwksUrl: "https://www.googleapis.com/oauth2/v3/certs",
        scopes: ["openid", "email", "profile"],
        tokenUrl: "https://oauth2.googleapis.com/token",
      } satisfies EmployeeOAuthConfig,
    };
  }

  const clientId = process.env.APPLE_CLIENT_ID?.trim();
  const clientSecret = process.env.APPLE_CLIENT_SECRET?.trim();

  if (!clientId || !clientSecret) {
    return {
      configured: false as const,
      missing: [
        !clientId ? "APPLE_CLIENT_ID" : null,
        !clientSecret ? "APPLE_CLIENT_SECRET" : null,
      ].filter(Boolean),
    };
  }

  return {
    configured: true as const,
    config: {
      authorizationUrl: "https://appleid.apple.com/auth/authorize",
      clientId,
      clientSecret,
      issuer: "https://appleid.apple.com",
      jwksUrl: "https://appleid.apple.com/auth/keys",
      scopes: ["openid", "email", "name"],
      tokenUrl: "https://appleid.apple.com/auth/token",
    } satisfies EmployeeOAuthConfig,
  };
}

export function sanitizeEmployeeNextPath(value: string | null | undefined) {
  if (value?.startsWith("/employee") && !value.startsWith("//")) {
    return value;
  }

  return "/employee/dashboard";
}

export function createOAuthState(provider: EmployeeAuthProvider, next: string) {
  return {
    next: sanitizeEmployeeNextPath(next),
    nonce: randomUUID(),
    provider,
  } satisfies EmployeeOAuthState;
}

export function encodeOAuthState(state: EmployeeOAuthState) {
  return Buffer.from(JSON.stringify(state), "utf8").toString("base64url");
}

export function decodeOAuthState(value: string | undefined) {
  if (!value) return null;

  try {
    const state = parseJson<EmployeeOAuthState>(
      Buffer.from(value, "base64url").toString("utf8"),
    );

    if (!state.nonce || !state.provider) return null;
    return state;
  } catch {
    return null;
  }
}

export function buildEmployeeOAuthUrl(
  request: NextRequest,
  provider: EmployeeAuthProvider,
  state: EmployeeOAuthState,
) {
  const oauth = getEmployeeOAuthConfig(provider);
  if (!oauth.configured) return oauth;

  const redirectUri = new URL(
    `/api/auth/employee/${provider}/callback`,
    request.url,
  );
  const authorizationUrl = new URL(oauth.config.authorizationUrl);
  authorizationUrl.searchParams.set("client_id", oauth.config.clientId);
  authorizationUrl.searchParams.set("redirect_uri", redirectUri.toString());
  authorizationUrl.searchParams.set("response_type", "code");
  authorizationUrl.searchParams.set("scope", oauth.config.scopes.join(" "));
  authorizationUrl.searchParams.set("state", encodeOAuthState(state));
  authorizationUrl.searchParams.set("nonce", state.nonce);

  if (provider === "apple") {
    authorizationUrl.searchParams.set("response_mode", "form_post");
  }

  return {
    configured: true as const,
    url: authorizationUrl,
  };
}

export function setOAuthStateCookie(
  response: NextResponse,
  state: EmployeeOAuthState,
) {
  response.cookies.set(oauthStateCookie, encodeOAuthState(state), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 10,
  });
}

export function readOAuthStateCookie(request: NextRequest) {
  return decodeOAuthState(request.cookies.get(oauthStateCookie)?.value);
}

export function clearOAuthStateCookie(response: NextResponse) {
  response.cookies.delete(oauthStateCookie);
}

async function exchangeCodeForToken(input: {
  code: string;
  config: EmployeeOAuthConfig;
  provider: EmployeeAuthProvider;
  redirectUri: string;
}) {
  const body = new URLSearchParams({
    client_id: input.config.clientId,
    client_secret: input.config.clientSecret,
    code: input.code,
    grant_type: "authorization_code",
    redirect_uri: input.redirectUri,
  });
  const response = await fetch(input.config.tokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
    cache: "no-store",
  });
  const data = (await response.json()) as { id_token?: string; error?: string };

  if (!response.ok || !data.id_token) {
    throw new Error(
      data.error ??
        `${getProviderName(input.provider)} did not return an ID token.`,
    );
  }

  return data.id_token;
}

async function verifyJwtSignature(jwt: string, jwksUrl: string) {
  const [encodedHeader, encodedPayload, encodedSignature] = jwt.split(".");
  const header = parseJson<JwtHeader>(
    base64UrlDecode(encodedHeader).toString("utf8"),
  );

  if (header.alg !== "RS256" || !header.kid) {
    throw new Error("Unsupported identity token signature.");
  }

  const jwksResponse = await fetch(jwksUrl, { cache: "no-store" });
  const jwks = (await jwksResponse.json()) as { keys?: ProviderJsonWebKey[] };
  const jwk = jwks.keys?.find((key) => key.kid === header.kid);

  if (!jwk) {
    throw new Error("Unable to verify identity token key.");
  }

  const key = await crypto.subtle.importKey(
    "jwk",
    jwk,
    { hash: "SHA-256", name: "RSASSA-PKCS1-v1_5" },
    false,
    ["verify"],
  );
  const signature = base64UrlDecode(encodedSignature);
  const data = new TextEncoder().encode(`${encodedHeader}.${encodedPayload}`);
  const verified = await crypto.subtle.verify(
    "RSASSA-PKCS1-v1_5",
    key,
    signature,
    data,
  );

  if (!verified) {
    throw new Error("Identity token signature could not be verified.");
  }

  return parseJson<JwtPayload>(
    base64UrlDecode(encodedPayload).toString("utf8"),
  );
}

function assertJwtClaims(
  payload: JwtPayload,
  config: EmployeeOAuthConfig,
  nonce: string,
) {
  const aud = Array.isArray(payload.aud) ? payload.aud : [payload.aud];
  const now = Math.floor(Date.now() / 1000);

  if (payload.iss !== config.issuer) {
    throw new Error("Identity token issuer did not match.");
  }

  if (!aud.includes(config.clientId)) {
    throw new Error("Identity token audience did not match.");
  }

  if (!payload.exp || payload.exp < now) {
    throw new Error("Identity token is expired.");
  }

  if (!payload.sub) {
    throw new Error("Identity token is missing a subject.");
  }

  if ((payload as JwtPayload & { nonce?: string }).nonce !== nonce) {
    throw new Error("Identity token nonce did not match.");
  }
}

export function getAllowedEmployeeEmails() {
  return new Set(
    (process.env.EMPLOYEE_ALLOWED_EMAILS ?? "")
      .split(",")
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean),
  );
}

export function getAllowedEmployeeDomains() {
  return new Set(
    (process.env.EMPLOYEE_ALLOWED_DOMAINS ?? "")
      .split(",")
      .map((domain) => domain.trim().replace(/^@/, "").toLowerCase())
      .filter(Boolean),
  );
}

export function getEmployeeRoleForEmail(
  email: string,
): Exclude<UserRole, "customer"> {
  const ownerEmails = new Set(
    (process.env.EMPLOYEE_OWNER_EMAILS ?? "")
      .split(",")
      .map((value) => value.trim().toLowerCase())
      .filter(Boolean),
  );

  return ownerEmails.has(email.toLowerCase()) ? "owner" : "employee";
}

export function assertEmployeeAllowed(email: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const domain = normalizedEmail.split("@")[1] ?? "";
  const allowedEmails = getAllowedEmployeeEmails();
  const allowedDomains = getAllowedEmployeeDomains();

  if (allowedEmails.size === 0 && allowedDomains.size === 0) {
    throw new Error(
      "Employee email allowlist is not configured. Set EMPLOYEE_ALLOWED_EMAILS or EMPLOYEE_ALLOWED_DOMAINS.",
    );
  }

  if (!allowedEmails.has(normalizedEmail) && !allowedDomains.has(domain)) {
    throw new Error("This email is not allowed to access the employee portal.");
  }
}

export async function authenticateEmployeeOAuth(input: {
  code: string;
  provider: EmployeeAuthProvider;
  request: NextRequest;
  state: EmployeeOAuthState;
}) {
  const oauth = getEmployeeOAuthConfig(input.provider);

  if (!oauth.configured) {
    throw new Error(`Missing env vars: ${oauth.missing.join(", ")}`);
  }

  const redirectUri = new URL(
    `/api/auth/employee/${input.provider}/callback`,
    input.request.url,
  );
  const idToken = await exchangeCodeForToken({
    code: input.code,
    config: oauth.config,
    provider: input.provider,
    redirectUri: redirectUri.toString(),
  });
  const payload = await verifyJwtSignature(idToken, oauth.config.jwksUrl);
  assertJwtClaims(payload, oauth.config, input.state.nonce);

  if (!payload.email) {
    throw new Error(
      `${getProviderName(input.provider)} did not return an email.`,
    );
  }

  assertEmployeeAllowed(payload.email);

  return {
    email: payload.email.toLowerCase(),
    provider: input.provider,
    role: getEmployeeRoleForEmail(payload.email),
    subject: payload.sub ?? payload.email,
  };
}

export function createEmployeeSessionResponse(input: {
  email: string;
  provider: string;
  request: NextRequest;
  role: Exclude<UserRole, "customer">;
  redirectPath: string;
}) {
  const response = NextResponse.redirect(
    new URL(input.redirectPath, input.request.url),
    303,
  );

  response.cookies.set("uns_session_role", input.role, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
  response.cookies.set("uns_session_email", input.email, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
  response.cookies.set("uns_session_auth_provider", input.provider, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
  clearOAuthStateCookie(response);

  return response;
}

export function isEmployeeDevLoginEnabled() {
  return (
    process.env.NODE_ENV !== "production" ||
    process.env.EMPLOYEE_DEV_LOGIN_ENABLED === "true"
  );
}

export function getEmployeeDevLoginEmail() {
  return (
    process.env.EMPLOYEE_DEV_LOGIN_EMAIL?.trim().toLowerCase() ||
    "dev@upnsmoke.local"
  );
}

export function isEmployeeRoleValue(
  value: string,
): value is Exclude<UserRole, "customer"> {
  return employeeRoles.includes(value as UserRole) && value !== "customer";
}
