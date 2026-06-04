import {
  type CloverConfig,
  getCloverApiBaseUrl,
  getCloverConfig,
} from "./clover";
import {
  getStoredCloverConnection,
  getStoredCloverConnectionMetadata,
} from "./clover-token-store";

export async function getActiveCloverConfig() {
  const environmentConfig = getCloverConfig();

  if (environmentConfig.configured) {
    return {
      configured: true as const,
      config: environmentConfig.config,
      source: "environment" as const,
    };
  }

  const metadata = await getStoredCloverConnectionMetadata();

  if (!metadata) return environmentConfig;

  const connection = await getStoredCloverConnection(
    metadata.merchantId,
    metadata.environment,
  );

  if (!connection) return environmentConfig;

  return {
    configured: true as const,
    config: {
      accessToken: connection.access_token,
      apiBaseUrl: getCloverApiBaseUrl(connection.environment),
      environment: connection.environment,
      merchantId: connection.merchantId,
    } satisfies CloverConfig,
    source: "oauth" as const,
  };
}
