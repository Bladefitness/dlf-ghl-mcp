/**
 * GHL OAuth Callback Handler
 *
 * Handles the Agency OAuth install flow:
 *   GET /callback?code=xxx
 *   1. Exchange code for agency token
 *   2. Store agency token in D1 oauth_tokens
 *   3. List all installed locations
 *   4. Derive a location-scoped token for each location
 *   5. Upsert each location into sub_accounts
 *   6. Return success HTML
 */

import type { Env } from "../types";
import { CONFIG } from "../config";
import {
  initOAuthTable,
  storeAgencyToken,
  upsertSubAccountFromOAuth,
} from "../db/accounts";

interface AgencyTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  userType: string;
  companyId: string;
  userId?: string;
  scope?: string;
}

interface InstalledLocationsResponse {
  locations?: Array<{ locationId: string; name: string }>;
  installedLocations?: Array<{ locationId: string; name: string }>;
}

interface LocationTokenResponse {
  access_token: string;
  refresh_token?: string;
  userType?: string;
  locationId?: string;
}

function jsonError(message: string, details?: string, status = 400): Response {
  return new Response(
    JSON.stringify({ error: message, ...(details ? { details } : {}) }),
    {
      status,
      headers: { "Content-Type": "application/json" },
    }
  );
}

function successHtml(locationCount: number): Response {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>GHL MCP — Installation Complete</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 600px; margin: 80px auto; padding: 0 24px; color: #111; }
    h1 { font-size: 1.5rem; margin-bottom: 0.5rem; }
    p { color: #444; line-height: 1.6; }
    .badge { display: inline-block; background: #16a34a; color: #fff; border-radius: 6px; padding: 4px 12px; font-size: 0.875rem; font-weight: 600; margin-bottom: 1.5rem; }
  </style>
</head>
<body>
  <div class="badge">Installation complete</div>
  <h1>GHL MCP Server connected</h1>
  <p>
    Your agency OAuth app has been authorised successfully.
    <strong>${locationCount} location${locationCount !== 1 ? "s" : ""}</strong>
    ${locationCount !== 1 ? "have" : "has"} been provisioned and are ready to use via the MCP server.
  </p>
  <p>You can close this window.</p>
</body>
</html>`;

  return new Response(html, {
    status: 200,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

export async function handleOAuthCallback(
  request: Request,
  env: Env
): Promise<Response> {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");

  if (!code) {
    return jsonError("Missing code parameter");
  }

  // Ensure the oauth_tokens table exists
  await initOAuthTable(env.GHL_DB);

  // --- Step 1: Exchange code for agency token ---
  const tokenBody = new URLSearchParams({
    client_id: env.GHL_CLIENT_ID,
    client_secret: env.GHL_CLIENT_SECRET,
    grant_type: "authorization_code",
    code,
    user_type: "Company",
  });

  let agencyTokenData: AgencyTokenResponse;
  try {
    const tokenRes = await fetch(
      `${CONFIG.API.BASE_URL}/oauth/token`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json",
        },
        body: tokenBody.toString(),
      }
    );

    if (!tokenRes.ok) {
      const text = await tokenRes.text().catch(() => "(no body)");
      return jsonError(
        "Failed to exchange authorization code",
        `GHL returned ${tokenRes.status}: ${text}`,
        502
      );
    }

    agencyTokenData = (await tokenRes.json()) as AgencyTokenResponse;
  } catch (e) {
    return jsonError("Token exchange request failed", String(e), 502);
  }

  const { access_token, refresh_token, expires_in, companyId, userId } =
    agencyTokenData;

  if (!access_token || !refresh_token || !companyId) {
    return jsonError(
      "Incomplete token response from GHL",
      JSON.stringify(agencyTokenData),
      502
    );
  }

  // --- Step 2: Store agency token ---
  const expiresAt = Math.floor(Date.now() / 1000) + (expires_in ?? 86400);
  await storeAgencyToken(env.GHL_DB, {
    access_token,
    refresh_token,
    expires_at: expiresAt,
    company_id: companyId,
    user_id: userId,
  });

  // --- Step 3: List installed locations ---
  let locations: Array<{ locationId: string; name: string }> = [];
  try {
    const locRes = await fetch(
      `${CONFIG.API.BASE_URL}/oauth/installedLocations?appId=${encodeURIComponent(env.GHL_CLIENT_ID)}&isInstalled=true`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${access_token}`,
          Version: CONFIG.API.VERSION_STANDARD,
          Accept: "application/json",
        },
      }
    );

    if (locRes.ok) {
      const locData = (await locRes.json()) as InstalledLocationsResponse;
      locations = locData.locations ?? locData.installedLocations ?? [];
    }
    // Non-fatal — we'll still return success even if 0 locations found
  } catch {
    // Non-fatal
  }

  // --- Steps 4 & 5: Derive location token + upsert sub_account ---
  let provisioned = 0;
  for (const loc of locations) {
    try {
      const locTokenBody = new URLSearchParams({
        companyId,
        locationId: loc.locationId,
      });

      const locTokenRes = await fetch(CONFIG.API.LOCATION_TOKEN_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json",
          Authorization: `Bearer ${access_token}`,
          Version: CONFIG.API.VERSION_STANDARD,
        },
        body: locTokenBody.toString(),
      });

      if (!locTokenRes.ok) continue;

      const locTokenData = (await locTokenRes.json()) as LocationTokenResponse;
      if (!locTokenData.access_token) continue;

      await upsertSubAccountFromOAuth(
        env.GHL_DB,
        loc.locationId,
        loc.name,
        locTokenData.access_token,
        companyId
      );
      provisioned++;
    } catch {
      // Skip this location and continue with the rest
    }
  }

  return successHtml(provisioned);
}
