# AGENTS.md — AI Coding Guidelines

Guidelines for AI agents working on this codebase.

## Project Overview

This is a Cloudflare Worker that implements a remote MCP (Model Context Protocol) server for the GoHighLevel API. It uses OAuth 2.1 authentication, Durable Objects for session persistence, and D1/KV for storage.

## Key Constraints

- **McpAgent pattern**: All MCP tools must be registered in the `init()` method of the `GHLMcpAgent` Durable Object class via `this.server.tool()`. Tools cannot be lazily loaded or dynamically registered after init.
- **OAuthProvider wrapper**: The default export must be an `OAuthProvider` instance. Hono handles the `defaultHandler` for non-MCP routes.
- **GHL API versions**: Most endpoints use `2021-07-28`. Calendar events, blocked slots, and Conversation AI agents use `2021-04-15`. Always check existing methods in the same category for the correct version.
- **No outbound from VM**: If developing in a sandboxed VM, you cannot deploy directly. Use `npx wrangler deploy` from a machine with direct internet access.

## File Organization

- `src/client/<category>.ts` — API methods grouped by GHL domain (calendars, contacts, etc.)
- `src/tools/<category>.ts` — MCP tool registrations, one file per category
- `src/tools/_helpers.ts` — Shared `ok()`, `err()`, `resolveClient()` functions
- `src/db/accounts.ts` — D1 database helpers for multi-account management
- `src/utils/` — Logger with redaction, custom error classes

## Adding Tools

1. Add the API method to the correct `src/client/<category>.ts` file
2. Add the tool registration to the matching `src/tools/<category>.ts` file
3. Follow existing patterns exactly — Zod schemas for params, try/catch with `ok()`/`err()`
4. Tool names must start with `ghl_` and use snake_case

## Testing

- Run `npx wrangler deploy --dry-run --outdir=dist` to verify compilation
- Test the health endpoint: `curl https://<worker-url>/health`
- MCP tools are tested through MCP clients (Claude Desktop, etc.)

## Common Patterns

```typescript
// Tool registration pattern
server.tool("ghl_tool_name", "Description", { schema }, async (args) => {
  try {
    const client = await resolveClient(env, args.locationId);
    const result = await client.category.method(args);
    return ok(JSON.stringify(result, null, 2));
  } catch (e: any) { return err(e); }
});

// Client method pattern
async methodName(param: string, locationId?: string) {
  return client.request<any>("GET", `/path/${param}`, {
    query: { locationId: locationId || client.locationId },
    version: "2021-07-28",
  });
}
```
