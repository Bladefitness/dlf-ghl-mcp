# DLF GHL MCP Server — Project Context & End Goal

## What This Is

A remote MCP (Model Context Protocol) server that gives AI agents — specifically Claude — full programmatic control over GoHighLevel (GHL), our CRM and marketing automation platform. It runs as a Cloudflare Worker at `https://ghl-mcp-v2.skool-203.workers.dev` and connects to Claude through the "DLF GHL MCP Server V2" connector.

In plain terms: instead of manually clicking through GHL's dashboard to manage contacts, appointments, pipelines, invoices, campaigns, and everything else, we tell Claude what we want done and it handles it through 224 API tools.

## The End Goal

**Make Claude the operating layer for all GHL operations across every sub-account we manage.** Everything we do inside GoHighLevel — from checking calendars and creating contacts to managing invoices, running campaigns, configuring AI agents, and building funnels — should be doable through a conversation with Claude. No dashboard clicking. No switching between accounts manually. Just tell Claude what needs to happen and it does it.

This means:

1. **Full GHL API Coverage** — Every GHL API v2 endpoint should have a corresponding MCP tool. We currently cover 224 tools across 12 categories. As GHL adds new API endpoints, we add new tools.

2. **Multi-Account Management** — We manage 5 GHL sub-accounts (Amazing Skin Care & Med Spa, Christians Testing Account, DLF, New Heits, TVAAI). Claude can switch between them seamlessly. Each account has its own API token stored in D1. The `ghl_add_sub_account`, `ghl_list_sub_accounts`, `ghl_set_default_account`, and `ghl_remove_sub_account` tools handle this.

3. **Real-Time Operations** — This isn't just for reading data. Claude can create, update, and delete across all categories — book appointments, send messages, update pipeline stages, create invoices, publish blog posts, configure voice AI agents, etc.

4. **Always-On, Zero Maintenance** — Deployed as a Cloudflare Worker, it runs at the edge with no servers to manage, no containers to restart, no scaling to worry about. The Durable Object handles MCP session persistence, D1 stores account data, KV stores OAuth state.

5. **Private & Secure** — OAuth 2.1 auto-approves for the owner (us). API tokens never leave the server. Sensitive parameters are redacted in logs. Each MCP session is isolated in its own Durable Object.

## Current Status (February 2026)

### What's Working
- V2 server deployed and running (`ghl-mcp-v2` worker)
- 224 unique tools, zero duplicate registrations
- Full OAuth 2.1 flow (client registration → authorize → token → MCP)
- Streamable HTTP transport for MCP protocol
- Multi-account support with 5 active sub-accounts
- Claude connector configured as "DLF GHL MCP Server V2"
- All 12 tool modules operational: accounts, calendars, contacts, conversations, opportunities, payments, marketing, automation, ai-agents, locations, content, misc

### V1 vs V2
- **V1** (`ghl-mcp-server`): Monolith — 2 files, ~7,800 lines total. Still running. Not being updated.
- **V2** (`ghl-mcp-v2`): Modular — ~35 files, clean architecture. Active development. Same D1/KV backends.

Both share the same database and KV namespace, so sub-accounts added in one are visible in the other.

## Architecture

```
Claude (Cowork / Desktop / API)
    │
    ▼
DLF GHL MCP Server V2 (Cloudflare Worker)
    │
    ├── OAuthProvider (authentication wrapper)
    │     ├── /mcp → McpAgent Durable Object (224 tools)
    │     ├── /authorize → Auto-approve for owner
    │     ├── /token → Token issuance
    │     └── /register → Dynamic client registration
    │
    ├── Default Handler (health check, CORS)
    │
    ├── D1 Database: ghl-accounts
    │     └── sub_accounts table (5 locations)
    │
    ├── KV Namespace: ghl-mcp-oauth
    │     └── OAuth tokens and state
    │
    └── GHL API v2
          └── https://services.leadconnectorhq.com
```

## Tool Categories (224 Tools)

| Category | Count | What It Controls |
|----------|-------|------------------|
| Accounts | 5 | Add/list/switch/remove GHL sub-accounts |
| Calendars | 11 | Calendars, appointments, blocked slots, calendar groups |
| Contacts | 19 | Contact CRUD, notes, tasks, bulk import, dedup |
| Conversations | 7 | Conversations, messages, search |
| Opportunities | 8 | Pipeline deals, opportunity tracking |
| Payments | 33 | Invoices, orders, transactions, subscriptions, store, coupons |
| Marketing | 24 | Campaigns, social media, email builder, funnels, links |
| Automation | 5 | Workflows, forms, surveys |
| AI Agents | 16 | Voice AI + Conversation AI agents |
| Locations | 27 | Locations, users, businesses, custom fields, tags |
| Content | 34 | Blogs, media, documents, menus, snapshots, templates |
| Misc | 35 | Associations, companies, phone system, products, custom objects |

## Sub-Accounts

| Name | Location ID | Role |
|------|-------------|------|
| Amazing Skin Care & Med Spa | RGg9HNyo7e4ttGutRyMt | Default account |
| Christians Testing Account | 2hP6rCb3COd2HUjD25w2 | Testing |
| DLF | W7BRJwzJCvFs9r0xZHrE | Dr. Lead Flow main |
| New Heits | dSgkW9QSUv20b6XIL9H5 | Client account |
| TVAAI | jiR5qR3g4OrMRx6BmpF2 | Client account |

## Infrastructure

| Component | Value |
|-----------|-------|
| Worker Name | `ghl-mcp-v2` |
| Worker URL | `https://ghl-mcp-v2.skool-203.workers.dev` |
| MCP Endpoint | `https://ghl-mcp-v2.skool-203.workers.dev/mcp` |
| Cloudflare Account | Dr. Lead Flow (`203c62d7e81cfe8c46a8321623014797`) |
| D1 Database | ghl-accounts (`647917a2-ace2-4b98-a10f-f822c5678646`) |
| KV Namespace | ghl-mcp-oauth (`ac787b89a4014510af5bf1e5e56f88f5`) |
| GitHub Repo | `https://github.com/Bladefitness/dlf-ghl-mcp.git` |
| Local Path | `~/GITHUB/dlf-ghl-mcp-server/` |
| Claude Connector | "DLF GHL MCP Server V2" |
| V1 Worker (legacy) | `ghl-mcp-server` (not being updated) |

## GHL API Versioning

| Version Header | Used For |
|----------------|----------|
| `2021-04-15` | Calendar events, blocked slots, Conversation AI agents |
| `2021-07-28` | Everything else |

## Key Technical Decisions

1. **OAuthProvider must be the default export** — Cloudflare's MCP auth requires this. The Hono/handler sits inside `defaultHandler`, not wrapping the provider.

2. **No Hono in current deploy** — The plan called for Hono as `defaultHandler`, but the working deploy uses a raw `{ async fetch() {} }` object for simplicity. Hono can be added later if route complexity grows.

3. **Tool names are `ghl_` prefixed snake_case** — Every tool follows this convention (e.g., `ghl_list_calendars`, `ghl_create_contact`, `ghl_get_invoice`). This cannot change without breaking existing clients.

4. **No duplicate tool names allowed** — `McpServer.tool()` throws a fatal error if you register the same name twice, crashing the Durable Object. This was the root cause of the biggest bug in the V2 build.

5. **Prototype extension pattern for client** — Category files add methods to `GHLClient.prototype` via mixin functions. This keeps each category file self-contained while maintaining a single client class.

6. **Shared D1/KV between V1 and V2** — Both workers bind to the same database and KV namespace. No data migration needed when switching versions.

## Development Workflow

1. Edit source files at `~/GITHUB/dlf-ghl-mcp-server/src/`
2. Deploy: `cd ~/GITHUB/dlf-ghl-mcp-server && npx wrangler deploy`
3. Verify: `curl https://ghl-mcp-v2.skool-203.workers.dev/health`
4. Test MCP: Connect via Claude connector or direct HTTP
5. Commit: `git add . && git commit && git push origin main`

## What's Next

- **Expand tool coverage** as GHL releases new API endpoints
- **Add Hono routing** if admin/webhook routes are needed
- **Webhook receiver** for GHL event notifications (contact created, appointment booked, etc.)
- **Batch operations** for bulk contact imports, mass email sends
- **Error recovery** with automatic retries on transient GHL API failures
- **Usage analytics** via D1 to track which tools get used most
- **V1 sunset** once V2 is fully validated across all use cases
