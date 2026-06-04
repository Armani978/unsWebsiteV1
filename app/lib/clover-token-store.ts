import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";
import { neon } from "@neondatabase/serverless";
import type { CloverEnvironment, CloverOAuthTokenResponse } from "./clover";

type EncryptedValue = {
  authTag: string;
  ciphertext: string;
  iv: string;
};

type StoredCloverConnection = CloverOAuthTokenResponse & {
  environment: CloverEnvironment;
  merchantId: string;
};

type StoredCloverConnectionMetadata = {
  accessTokenExpiration: number;
  environment: CloverEnvironment;
  merchantId: string;
  refreshTokenExpiration: number;
  updatedAt: string;
};

function getSql() {
  const databaseUrl = process.env.DATABASE_URL?.trim();

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not configured.");
  }

  return neon(databaseUrl);
}

function getEncryptionKey() {
  const encodedKey = process.env.CLOVER_TOKEN_ENCRYPTION_KEY?.trim();

  if (!encodedKey) {
    throw new Error("CLOVER_TOKEN_ENCRYPTION_KEY is not configured.");
  }

  const key = Buffer.from(encodedKey, "base64");

  if (key.length !== 32) {
    throw new Error("CLOVER_TOKEN_ENCRYPTION_KEY must contain 32 bytes.");
  }

  return key;
}

function encrypt(value: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", getEncryptionKey(), iv);
  const ciphertext = Buffer.concat([
    cipher.update(value, "utf8"),
    cipher.final(),
  ]);

  return {
    authTag: cipher.getAuthTag().toString("base64"),
    ciphertext: ciphertext.toString("base64"),
    iv: iv.toString("base64"),
  } satisfies EncryptedValue;
}

function decrypt(value: EncryptedValue) {
  const decipher = createDecipheriv(
    "aes-256-gcm",
    getEncryptionKey(),
    Buffer.from(value.iv, "base64"),
  );
  decipher.setAuthTag(Buffer.from(value.authTag, "base64"));

  return Buffer.concat([
    decipher.update(Buffer.from(value.ciphertext, "base64")),
    decipher.final(),
  ]).toString("utf8");
}

async function ensureTokenTable() {
  const sql = getSql();

  await sql`
    CREATE TABLE IF NOT EXISTS clover_connections (
      merchant_id TEXT NOT NULL,
      environment TEXT NOT NULL,
      access_token JSONB NOT NULL,
      refresh_token JSONB NOT NULL,
      access_token_expiration BIGINT NOT NULL,
      refresh_token_expiration BIGINT NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      PRIMARY KEY (merchant_id, environment)
    )
  `;

  return sql;
}

export async function saveCloverConnection(
  merchantId: string,
  environment: CloverEnvironment,
  token: CloverOAuthTokenResponse,
) {
  const sql = await ensureTokenTable();
  const encryptedAccessToken = encrypt(token.access_token);
  const encryptedRefreshToken = encrypt(token.refresh_token);

  await sql`
    INSERT INTO clover_connections (
      merchant_id,
      environment,
      access_token,
      refresh_token,
      access_token_expiration,
      refresh_token_expiration,
      updated_at
    )
    VALUES (
      ${merchantId},
      ${environment},
      ${JSON.stringify(encryptedAccessToken)}::jsonb,
      ${JSON.stringify(encryptedRefreshToken)}::jsonb,
      ${token.access_token_expiration},
      ${token.refresh_token_expiration},
      NOW()
    )
    ON CONFLICT (merchant_id, environment)
    DO UPDATE SET
      access_token = EXCLUDED.access_token,
      refresh_token = EXCLUDED.refresh_token,
      access_token_expiration = EXCLUDED.access_token_expiration,
      refresh_token_expiration = EXCLUDED.refresh_token_expiration,
      updated_at = NOW()
  `;
}

export async function getStoredCloverConnection(
  merchantId: string,
  environment: CloverEnvironment,
) {
  const sql = await ensureTokenTable();
  const rows = await sql`
    SELECT
      merchant_id,
      environment,
      access_token,
      refresh_token,
      access_token_expiration,
      refresh_token_expiration
    FROM clover_connections
    WHERE merchant_id = ${merchantId}
      AND environment = ${environment}
    LIMIT 1
  `;
  const row = rows[0];

  if (!row) return null;

  return {
    merchantId: row.merchant_id as string,
    environment: row.environment as CloverEnvironment,
    access_token: decrypt(row.access_token as EncryptedValue),
    refresh_token: decrypt(row.refresh_token as EncryptedValue),
    access_token_expiration: Number(row.access_token_expiration),
    refresh_token_expiration: Number(row.refresh_token_expiration),
  } satisfies StoredCloverConnection;
}

export async function getStoredCloverConnectionMetadata() {
  const sql = await ensureTokenTable();
  const rows = await sql`
    SELECT
      merchant_id,
      environment,
      access_token_expiration,
      refresh_token_expiration,
      updated_at
    FROM clover_connections
    ORDER BY updated_at DESC
    LIMIT 1
  `;
  const row = rows[0];

  if (!row) return null;

  return {
    merchantId: row.merchant_id as string,
    environment: row.environment as CloverEnvironment,
    accessTokenExpiration: Number(row.access_token_expiration),
    refreshTokenExpiration: Number(row.refresh_token_expiration),
    updatedAt: new Date(row.updated_at as string).toISOString(),
  } satisfies StoredCloverConnectionMetadata;
}
