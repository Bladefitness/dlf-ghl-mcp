/**
 * GHL MCP Server v2.0.1 — Modular Cloudflare Worker
 *
 * A remote MCP server giving AI agents full control over GoHighLevel
 * across multiple sub-accounts. Built with Hono routing, modular tools,
 * and layered security.
 *
 * Architecture:
 *   OAuthProvider wraps the entire worker:
 *     /mcp       → McpAgent Durable Object (254 tools)
 *     /authorize → OAuth auto-approve (private server)
 *     /token     → OAuth token endpoint
 *     /register  → OAuth client registration
 *     /*         → defaultHandler (health, CORS)
 */

import OAuthProvider from "@cloudflare/workers-oauth-provider";
import { McpAgent } from "agents/mcp";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

import type { Env } from "./types";
import { CONFIG } from "./config";
import { Logger } from "./utils";
import { registerAllTools } from "./tools";
import { initErrorsDb, logError } from "./db/errors";
import { sendErrorWebhook } from "./utils/webhook";
import { initOAuthTable } from "./db/accounts";
import { handleOAuthCallback } from "./handlers/oauth-callback";

// =============================================================
// Error capture helper (fire-and-forget — never blocks MCP response)
// =============================================================

function captureError(
  env: Env,
  toolName: string,
  args: Record<string, unknown>,
  errorText: string
): void {
  (async () => {
    try {
      await initErrorsDb(env.GHL_DB);
      const errorId = await logError(env.GHL_DB, toolName, errorText, args);
      if (env.ERROR_WEBHOOK_URL) {
        await sendErrorWebhook(env.ERROR_WEBHOOK_URL, {
          tool: toolName,
          error: errorText,
          args,
          error_id: errorId,
          timestamp: new Date().toISOString(),
          source: "ghl-mcp-v2",
        });
      }
    } catch {
      // Never let error capture crash the worker
    }
  })();
}

// =============================================================
// MCP Agent (Durable Object)
// =============================================================

export class GHLMcpAgent extends McpAgent<Env> {
  server = new McpServer({
    name: CONFIG.MCP.NAME,
    version: CONFIG.MCP.VERSION,
  });

  async init() {
    const env = this.env;

    // Auto-capture errors from every tool without touching individual handlers
    const originalTool = this.server.tool.bind(this.server);
    (this.server as any).tool = (name: string, desc: string, schema: any, handler: any) => {
      return originalTool(name, desc, schema, async (args: any) => {
        const result = await handler(args);
        if (result?.isError) {
          const errorText = result.content?.[0]?.text ?? "Unknown error";
          captureError(env, name, args, errorText);
        }
        return result;
      });
    };

    // Ensure OAuth table exists at startup
    await initOAuthTable(env.GHL_DB);

    registerAllTools(this.server, env);
  }
}

// =============================================================
// Default Handler (raw fetch — needed for OAUTH_PROVIDER access)
// =============================================================

const log = new Logger("http");

const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS, PUT, DELETE",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, Accept, X-Requested-With, mcp-session-id, mcp-protocol-version",
};

const defaultHandler = {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext
  ): Promise<Response> {
  const url = new URL(request.url);

  // Handle CORS preflight
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  // Health checks
  if (url.pathname === "/" || url.pathname === "/health") {
    return Response.json(
      {
        status: "ok",
        server: CONFIG.MCP.NAME,
        version: CONFIG.MCP.VERSION,
        mcp_endpoint: "/mcp",
      },
      { headers: CORS_HEADERS }
    );
  }

  // GHL OAuth callback — handles agency app install
  if (url.pathname === "/callback" && request.method === "GET") {
    return handleOAuthCallback(request, env);
  }

  // OAuth authorize — auto-approve for owner (private server)
  if (url.pathname === "/authorize") {
    const oauthReqInfo = await (env as any).OAUTH_PROVIDER.parseAuthRequest(
      request
    );
    log.info("OAuth authorize request", {
      client_id: oauthReqInfo?.clientId,
    });

    const { redirectTo } = await (
      env as any
    ).OAUTH_PROVIDER.completeAuthorization({
      request: oauthReqInfo,
      userId: "owner",
      metadata: { label: "GHL MCP Owner" },
      scope: oauthReqInfo.scope,
      props: { userId: "owner" },
    });

    return Response.redirect(redirectTo, 302);
  }

  // Catch-all 404
  return Response.json(
    { error: "Not found", hint: "MCP endpoint is at /mcp" },
    { status: 404, headers: CORS_HEADERS }
  );
  },
};

// =============================================================
// Export: OAuthProvider wraps everything
// =============================================================

export default new OAuthProvider({
  apiRoute: "/mcp",
  apiHandler: GHLMcpAgent.serve("/mcp") as any,
  defaultHandler: defaultHandler as any,
  authorizeEndpoint: "/authorize",
  tokenEndpoint: "/token",
  clientRegistrationEndpoint: "/register",
});
