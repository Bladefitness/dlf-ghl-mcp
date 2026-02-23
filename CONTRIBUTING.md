# Contributing to GHL MCP Server v2

Thanks for your interest in contributing! This guide will help you get started.

## Development Setup

1. **Clone the repo:**
   ```bash
   git clone https://github.com/Bladefitness/ghl-mcp-v2.git
   cd ghl-mcp-v2
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create a `.dev.vars` file** with your GHL credentials for local development:
   ```
   GHL_API_KEY=your-private-integration-token
   GHL_LOCATION_ID=your-location-id
   ```

4. **Run locally:**
   ```bash
   npm run dev
   ```

## Project Architecture

The codebase follows a modular pattern with three main layers:

**Client Layer** (`src/client/`) — Makes HTTP requests to the GHL API. Each category file exports a mixin function that returns an object of async methods. The main `GHLClient` class composes all mixins.

**Tools Layer** (`src/tools/`) — Registers MCP tools that AI agents can call. Each category file exports a registration function that adds tools to the MCP server. Tools validate inputs with Zod schemas and delegate to the client layer.

**Infrastructure** (`src/index.ts`, `src/db/`, `src/utils/`) — Worker entry point, database helpers, logging, and error handling.

```
MCP Client Request
    → McpAgent.init() registers tools
    → Tool handler validates args (Zod)
    → resolveClient() finds the right account
    → GHLClient.category.method() calls GHL API
    → Response formatted and returned
```

## Adding a New Tool

### Step 1: Add the API method

Find the right category file in `src/client/` and add your method:

```typescript
// src/client/contacts.ts
async searchContacts(query: string, locationId?: string) {
  return client.request<any>("GET", `/contacts/`, {
    query: { locationId: locationId || client.locationId, query },
    version: "2021-07-28",
  });
},
```

### Step 2: Register the MCP tool

Find the matching category in `src/tools/` and add the tool registration:

```typescript
// src/tools/contacts.ts
server.tool(
  "ghl_search_contacts",
  "Search contacts by name, email, or phone.",
  {
    query: z.string().describe("Search query"),
    locationId: z.string().optional(),
    limit: z.number().optional(),
  },
  async ({ query, locationId, limit }) => {
    try {
      const client = await resolveClient(env, locationId);
      const result = await client.contacts.searchContacts(query, locationId, limit);
      return ok(JSON.stringify(result, null, 2));
    } catch (e: any) {
      return err(e);
    }
  }
);
```

### Step 3: Done

The tool is automatically included via `registerAllTools()` — no additional wiring needed.

## Adding a New Category

1. Create `src/client/<category>.ts` with a mixin function
2. Import and compose it in `src/client/index.ts` (add to constructor)
3. Create `src/tools/<category>.ts` with a `register<Category>Tools()` function
4. Import and call it in `src/tools/index.ts`

## Code Style

- **TypeScript strict mode** — all types must be explicit
- **Zod schemas** — all tool parameters validated at runtime
- **Error handling** — always use try/catch in tool handlers, return `err()` on failure
- **Naming** — tool names use `ghl_` prefix with snake_case (e.g., `ghl_list_calendars`)
- **API versions** — use `CONFIG.API.VERSION_STANDARD` (`2021-07-28`) for most endpoints, `CONFIG.API.VERSION_LEGACY` (`2021-04-15`) for calendar events and Conversation AI

## GHL API Reference

- [GHL API v2 Documentation](https://highlevel.stoplight.io/docs/integrations/)
- [GHL OpenAPI Spec](https://highlevel.stoplight.io/docs/integrations/openapi.json)

## Submitting Changes

1. Fork the repo
2. Create a feature branch (`git checkout -b feature/add-xyz-tools`)
3. Make your changes
4. Test locally with `npm run dev`
5. Ensure TypeScript compiles: `npx tsc --noEmit`
6. Submit a pull request

## Reporting Issues

Open an issue on GitHub with:
- What you expected to happen
- What actually happened
- The tool name and parameters you used
- Any error messages
