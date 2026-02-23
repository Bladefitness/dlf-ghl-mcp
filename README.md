# GHL MCP Server v2

A remote [Model Context Protocol](https://modelcontextprotocol.io/) (MCP) server that gives AI agents full control over [GoHighLevel](https://www.gohighlevel.com/) — deployed as a Cloudflare Worker with OAuth 2.1 authentication.

Built with a modular architecture: Hono routing, category-based tool modules, and a composable GHL API client covering **254 tools** across the entire GHL API v2 surface.

## What It Does

Connect any MCP-compatible AI client (Claude Desktop, Cursor, Windsurf, custom agents) to your GoHighLevel account. The AI can then manage your entire GHL workspace — contacts, calendars, conversations, pipelines, invoices, workflows, AI agents, and more — through natural language.

**Example prompts once connected:**

- *"Show me all appointments for this week"*
- *"Create a new contact named John Smith with email john@example.com"*
- *"Search my pipeline for deals over $5,000"*
- *"Send a message to the conversation with contact ID xyz"*
- *"Create a Conversation AI agent for SMS auto-replies"*
- *"List all invoices from the last 30 days"*

## Architecture

```
MCP Client → HTTPS → Cloudflare Worker
                       │
                       ├─ OAuthProvider (authentication layer)
                       │    ├─ /mcp        → McpAgent Durable Object (254 tools)
                       │    ├─ /authorize  → OAuth approval flow
                       │    ├─ /token      → Token endpoint
                       │    └─ /register   → Client registration
                       │
                       ├─ Hono App (HTTP routes)
                       │    ├─ /health     → Health check
                       │    └─ /*          → 404 catch-all
                       │
                       ├─ D1 Database      → Multi-account management
                       ├─ KV Namespace     → OAuth state/tokens
                       └─ Durable Objects  → MCP session persistence
```

## Requirements

- [Cloudflare Workers](https://workers.cloudflare.com/) account (free tier works)
- [GoHighLevel](https://www.gohighlevel.com/) account with API access
- GHL Private Integration Token ([how to get one](https://highlevel.stoplight.io/docs/integrations/))
- [Node.js](https://nodejs.org/) 18+ and npm

## Setup

### 1. Clone and Install

```bash
git clone https://github.com/Bladefitness/ghl-mcp-v2.git
cd ghl-mcp-v2
npm install
```

### 2. Configure Cloudflare Resources

Create the required D1 database and KV namespace:

```bash
# Create D1 database
npx wrangler d1 create ghl-accounts

# Create KV namespace
npx wrangler kv namespace create OAUTH_KV
```

Update `wrangler.toml` with the IDs returned by each command:

```toml
[[d1_databases]]
binding = "GHL_DB"
database_name = "ghl-accounts"
database_id = "YOUR_D1_DATABASE_ID"

[[kv_namespaces]]
binding = "OAUTH_KV"
id = "YOUR_KV_NAMESPACE_ID"
```

### 3. Set Secrets

```bash
# Your GHL Private Integration Token
npx wrangler secret put GHL_API_KEY

# Your GHL Location ID
npx wrangler secret put GHL_LOCATION_ID
```

### 4. Deploy

```bash
npm run deploy
```

Your server will be live at `https://ghl-mcp-v2.<your-subdomain>.workers.dev`.

### 5. Connect Your MCP Client

Add to your MCP client configuration (e.g., Claude Desktop `claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "ghl": {
      "url": "https://ghl-mcp-v2.<your-subdomain>.workers.dev/mcp",
      "transport": "streamable-http"
    }
  }
}
```

## Tool Categories (254 Tools)

| Category | Tools | Description |
|----------|-------|-------------|
| **Accounts** | 5 | Multi-account management — add, list, switch, remove sub-accounts |
| **Calendars** | 11 | Calendars, appointments, blocked slots, calendar groups |
| **Contacts** | 19 | Contact CRUD, notes, tasks, bulk import, duplicate detection |
| **Conversations** | 7 | Conversations, messages, search |
| **Opportunities** | 8 | Opportunity pipeline management, deal tracking |
| **Payments** | 33 | Invoices, orders, transactions, subscriptions, store, shipping |
| **Marketing** | 24 | Campaigns, social media, email builder, funnels, links |
| **Automation** | 5 | Workflows, forms, surveys |
| **AI Agents** | 16 | Voice AI agents + Conversation AI agents (text-based) |
| **Locations** | 27 | Locations, users, businesses, custom fields, tags |
| **Content** | 34 | Blogs, media, documents, menus, snapshots, templates |
| **Misc** | 65 | Associations, companies, phone, products, custom objects |

## Project Structure

```
ghl-mcp-v2/
├── src/
│   ├── index.ts                 # Worker entry: OAuthProvider + Hono + McpAgent export
│   ├── types.ts                 # Shared type definitions (Env, SubAccount, etc.)
│   ├── config.ts                # Constants: API URLs, versions, server metadata
│   │
│   ├── client/                  # GHL API client (composable, category-based)
│   │   ├── index.ts             # GHLClient class — composes all category mixins
│   │   ├── base.ts              # BaseGHLClient — core HTTP request infrastructure
│   │   ├── calendars.ts         # Calendar, appointment, blocked slot methods
│   │   ├── contacts.ts          # Contact, note, task methods
│   │   ├── conversations.ts     # Conversation and message methods
│   │   ├── opportunities.ts     # Opportunity and pipeline methods
│   │   ├── payments.ts          # Invoice, order, transaction, store methods
│   │   ├── marketing.ts         # Campaign, social, email, funnel methods
│   │   ├── automation.ts        # Workflow, form, survey methods
│   │   ├── ai-agents.ts         # Voice AI + Conversation AI agent methods
│   │   ├── locations.ts         # Location, user, business, custom field methods
│   │   ├── content.ts           # Blog, media, document, template methods
│   │   └── misc.ts              # Association, company, phone, product methods
│   │
│   ├── tools/                   # MCP tool registrations (category-based)
│   │   ├── index.ts             # registerAllTools() — orchestrates all categories
│   │   ├── _helpers.ts          # ok(), err(), resolveClient() shared helpers
│   │   ├── accounts.ts          # Sub-account management tools
│   │   ├── calendars.ts         # Calendar tools
│   │   ├── contacts.ts          # Contact tools
│   │   ├── conversations.ts     # Conversation tools
│   │   ├── opportunities.ts     # Opportunity tools
│   │   ├── payments.ts          # Payment tools
│   │   ├── marketing.ts         # Marketing tools
│   │   ├── automation.ts        # Automation tools
│   │   ├── ai-agents.ts         # AI Agent tools
│   │   ├── locations.ts         # Location tools
│   │   ├── content.ts           # Content tools
│   │   └── misc.ts              # Miscellaneous tools
│   │
│   ├── db/
│   │   └── accounts.ts          # D1 database helpers for multi-account management
│   │
│   └── utils/
│       ├── index.ts             # Barrel export
│       ├── logger.ts            # Structured JSON logging with sensitive param redaction
│       └── errors.ts            # GHLError class with status codes
│
├── wrangler.toml                # Cloudflare Worker configuration
├── tsconfig.json                # TypeScript configuration
├── package.json                 # Dependencies and scripts
├── CONTRIBUTING.md              # Contribution guidelines
├── AGENTS.md                    # AI agent coding guidelines
├── LICENSE                      # Apache 2.0
└── .gitignore
```

## Multi-Account Support

The server supports managing multiple GHL locations through a built-in D1 database. AI agents can dynamically switch between accounts:

```
"Add my second location: name 'Sales Team', ID 'abc123', token 'pit-xyz...'"
"Set 'Sales Team' as default"
"List all contacts from location abc123"
```

Accounts are stored in a `sub_accounts` table with encrypted tokens. When no specific location is provided, the server falls back to the default account, then to environment variables.

## Security

**OAuth 2.1 Authentication** — MCP clients must complete the OAuth flow before accessing any tools. The server supports dynamic client registration, token issuance, and session management via Cloudflare's `@cloudflare/workers-oauth-provider`.

**Scoped API Access** — Each GHL Private Integration Token is scoped to a specific location. The server never exposes tokens to MCP clients; all API calls are made server-side.

**No Shared State** — Each MCP session runs in its own Durable Object instance with isolated SQLite storage. Sessions cannot access each other's data.

**Sensitive Param Redaction** — The structured logger automatically redacts `api_key`, `token`, `authorization`, and `password` fields from all log output.

## API Versioning

The GHL API uses two version headers. This server handles both automatically:

| Endpoints | Version Header |
|-----------|---------------|
| Calendar events, blocked slots, Conversation AI agents | `2021-04-15` |
| Everything else (contacts, invoices, workflows, etc.) | `2021-07-28` |

## Development

```bash
# Run locally
npm run dev

# Deploy to Cloudflare
npm run deploy

# Type check
npx tsc --noEmit
```

### Adding New Tools

1. Add the API method to the appropriate `src/client/<category>.ts`
2. Add the tool registration to `src/tools/<category>.ts`
3. The tool is automatically included via `registerAllTools()`

### Adding a New Category

1. Create `src/client/<new-category>.ts` with a mixin function
2. Import and compose it in `src/client/index.ts`
3. Create `src/tools/<new-category>.ts` with a registration function
4. Import and call it in `src/tools/index.ts`

## Approximate Costs

| Resource | Free Tier | Paid Tier |
|----------|-----------|-----------|
| Workers requests | 100K/day | $0.30/M requests |
| Durable Objects | - | $0.15/M requests |
| D1 reads | 5M/day | $0.001/M rows |
| KV reads | 100K/day | $0.50/M reads |

For personal/small team use, this typically stays within free tier limits.

## License

[Apache 2.0](LICENSE)
