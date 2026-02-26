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
  apiHandler: GHLMcpAgent.serve("/mcp"),
  defaultHandler: defaultHandler,
  authorizeEndpoint: "/authorize",
  tokenEndpoint: "/token",
  clientRegistrationEndpoint: "/register",
});
