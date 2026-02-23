/**
 * GHL MCP Server v2.0.0 — Modular Cloudflare Worker
 *
 * A remote MCP server giving AI agents full control over GoHighLevel
 * across multiple sub-accounts. Built with Hono routing, modular tools,
 * and layered security.
 *
 * Architecture:
 *   OAuthProvider wraps the entire worker:
 *     /mcp       → McpAgent Durable Object (240 tools)
 *     /authorize → OAuth approval flow
 *     /token     → OAuth token endpoint
 *     /register  → OAuth client registration
 *     /*         → Hono app (health, CORS, admin)
 */

import OAuthProvider from "@cloudflare/workers-oauth-provider";
import { McpAgent } from "agents/mcp";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { Hono } from "hono";
import { cors } from "hono/cors";

import type { Env } from "./types";
import { CONFIG } from "./config";
import { Logger } from "./utils";
import { registerAllTools } from "./tools";

// ============================================================
// MCP Agent (Durable Object)
// ============================================================

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

// ============================================================
// Hono App (default handler for non-MCP routes)
// ============================================================

const app = new Hono<{ Bindings: Env }>();
const log = new Logger("http");

// Global CORS
app.use(
  "*",
  cors({
    origin: "*",
    allowMethods: ["GET", "POST", "OPTIONS", "PUT", "DELETE"],
    allowHeaders: [
      "Content-Type",
      "Authorization",
      "Accept",
      "X-Requested-With",
      "mcp-session-id",
      "mcp-protocol-version",
    ],
  })
);

// Health check
app.get("/", (c) => {
  return c.json({
    status: "ok",
    server: CONFIG.MCP.NAME,
    version: CONFIG.MCP.VERSION,
    mcp_endpoint: "/mcp",
  });
});

app.get("/health", (c) => {
  return c.json({
    status: "ok",
    server: CONFIG.MCP.NAME,
    version: CONFIG.MCP.VERSION,
    mcp_endpoint: "/mcp",
  });
});

// OAuth authorize — auto-approve for owner
app.get("/authorize", async (c) => {
  const oauthReqInfo = c.req.query();
  log.info("OAuth authorize request", { client_id: oauthReqInfo.client_id });

  return new Response(null, {
    status: 302,
    headers: {
      Location: `/approve?${new URLSearchParams(oauthReqInfo).toString()}`,
    },
  });
});

app.post("/approve", async (c) => {
  // The OAuthProvider handles the actual approval flow
  // This is a fallback for any direct POST requests
  return c.json({ error: "Use the OAuth flow via /authorize" }, 400);
});

// Catch-all 404
app.all("*", (c) => {
  return c.json({ error: "Not found", hint: "MCP endpoint is at /mcp" }, 404);
});

// ============================================================
// Export: OAuthProvider wraps everything
// ============================================================

export default new OAuthProvider({
  apiRoute: "/mcp",
  apiHandler: GHLMcpAgent.serve("/mcp"),
  defaultHandler: app,
  authorizeEndpoint: "/authorize",
  tokenEndpoint: "/token",
  clientRegistrationEndpoint: "/register",
});
