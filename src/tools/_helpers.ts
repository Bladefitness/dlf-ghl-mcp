import type { Env } from "../types";
import { GHLClient } from "../client";
import { initDb, getDefaultAccount, getAccountById } from "../db/accounts";

// MCP response formatters
export function ok(text: string) {
  return { content: [{ type: "text" as const, text }] };
}

export function err(e: any) {
  return {
    content: [{ type: "text" as const, text: `Error: ${e.message || e}` }],
    isError: true,
  };
}

// Resolve a GHLClient from environment + optional locationId
export async function resolveClient(env: Env, locationId?: string): Promise<GHLClient> {
  await initDb(env.GHL_DB);
  if (locationId) {
    const account = await getAccountById(env.GHL_DB, locationId);
    if (account) {
      return new GHLClient({ apiKey: account.api_key, locationId: account.id });
    }
    return new GHLClient({ apiKey: env.GHL_API_KEY, locationId });
  }
  const defaultAccount = await getDefaultAccount(env.GHL_DB);
  if (defaultAccount) {
    return new GHLClient({
      apiKey: defaultAccount.api_key,
      locationId: defaultAccount.id,
    });
  }
  return new GHLClient({
    apiKey: env.GHL_API_KEY,
    locationId: env.GHL_LOCATION_ID,
  });
}
