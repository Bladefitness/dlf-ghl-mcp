/**
 * Site Builder Tools — Internal GHL API
 * Uses backend.leadconnectorhq.com with Firebase JWT auth
 * These tools are INDEPENDENT of the existing GHLClient/resolveClient system.
 *
 * Covers funnel/website management, page content read/write, and granular
 * section/element manipulation via read-modify-write patterns.
 */
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { Env } from "../types";
import { ok, err } from "./_helpers";
import { siteBuilderMethods } from "../client/site-builder";

function getSiteBuilderClient(env: Env, locationId?: string) {
  const refreshToken = (env as any).GHL_FIREBASE_REFRESH_TOKEN;
  const staticToken = (env as any).GHL_FIREBASE_TOKEN;

  if (!refreshToken && !staticToken) {
    throw new Error(
      "Neither GHL_FIREBASE_REFRESH_TOKEN nor GHL_FIREBASE_TOKEN is set. At least one is required for site builder operations."
    );
  }

  const loc = locationId || env.GHL_LOCATION_ID;
  if (!loc) {
    throw new Error(
      "No locationId provided and no default GHL_LOCATION_ID set."
    );
  }

  return siteBuilderMethods({
    firebaseToken: staticToken || "",
    refreshToken: refreshToken,
    kv: env.OAUTH_KV,
    locationId: loc,
  });
}

export function registerSiteBuilderTools(server: McpServer, env: Env) {
  // ==========================================================
  // GET PAGE
  // ==========================================================

  server.tool(
    "ghl_site_builder_get_page",
    "Read the full content of a funnel/website page (internal API). Returns pageData (sections, elements, layout), pageVersion, and metadata. Always call this before modifying a page — the pageVersion is required for all save operations.",
    {
      pageId: z.string().describe("Page (step) ID to retrieve"),
      locationId: z.string().optional().describe("Target location ID"),
    },
    async ({ pageId, locationId }) => {
      try {
        const client = getSiteBuilderClient(env, locationId);
        const [content, meta] = await Promise.all([
          client.getPageContent(pageId),
          client.getPageMetadata(pageId),
        ]);
        const result = { ...content, ...meta };
        return ok(JSON.stringify(result, null, 2));
      } catch (e: any) {
        return err(e);
      }
    }
  );

  // ==========================================================
  // SAVE PAGE
  // ==========================================================

  server.tool(
    "ghl_site_builder_save_page",
    "Save the full page content to a funnel/website page (internal API). Overwrites the entire pageData. Requires pageVersion (get it from ghl_site_builder_get_page to avoid conflicts). pageData must be the complete page structure as a JSON string.",
    {
      pageId: z.string().describe("Page (step) ID to save"),
      funnelId: z.string().describe("Funnel/website ID that owns this page"),
      pageData: z
        .string()
        .describe(
          "JSON string of the complete page data object (sections, layout, etc.)"
        ),
      pageVersion: z
        .number()
        .describe(
          "Current page version — required for conflict prevention (get from ghl_site_builder_get_page)"
        ),
      pageType: z
        .string()
        .optional()
        .describe('Page type (e.g. "optin_funnel_page")'),
      manualSave: z
        .boolean()
        .optional()
        .describe("Mark as a manual save (default: false)"),
      locationId: z.string().optional().describe("Target location ID"),
    },
    async ({
      pageId,
      funnelId,
      pageData,
      pageVersion,
      pageType,
      manualSave,
      locationId,
    }) => {
      try {
        let parsed: Record<string, unknown>;
        try {
          parsed = JSON.parse(pageData);
        } catch (e: any) {
          return err(new Error(`Invalid pageData JSON: ${e.message}`));
        }

        const client = getSiteBuilderClient(env, locationId);
        const result = await client.savePage(pageId, {
          funnelId,
          pageData: parsed as any,
          pageVersion,
          pageType,
          manualSave,
        });
        return ok(
          `Page saved successfully.\n\n${JSON.stringify(result, null, 2)}`
        );
      } catch (e: any) {
        return err(e);
      }
    }
  );

  // ==========================================================
  // ADD SECTION
  // ==========================================================

  server.tool(
    "ghl_site_builder_add_section",
    "Add a new section to a page using read-modify-write (internal API). Reads the current page, inserts the section at the given position (or appends if omitted), then saves. sectionData is a JSON string describing the section (columns, background, padding, etc.).",
    {
      pageId: z.string().describe("Page (step) ID"),
      sectionData: z
        .string()
        .describe(
          "JSON string of the section object to insert. Should include columns, type, and any styling properties."
        ),
      position: z
        .number()
        .optional()
        .describe(
          "Zero-based index to insert at (default: append to end of sections)"
        ),
      locationId: z.string().optional().describe("Target location ID"),
    },
    async ({ pageId, sectionData, position, locationId }) => {
      try {
        let parsed: Record<string, unknown>;
        try {
          parsed = JSON.parse(sectionData);
        } catch (e: any) {
          return err(new Error(`Invalid sectionData JSON: ${e.message}`));
        }

        const client = getSiteBuilderClient(env, locationId);
        const result = await client.addSectionToPage(pageId, parsed, position);
        return ok(
          `Section added successfully.\n\n${JSON.stringify(result, null, 2)}`
        );
      } catch (e: any) {
        return err(e);
      }
    }
  );

  // ==========================================================
  // REMOVE SECTION
  // ==========================================================

  server.tool(
    "ghl_site_builder_remove_section",
    "Remove a section from a page by section ID using read-modify-write (internal API). Reads the current page, filters out the matching section, then saves.",
    {
      pageId: z.string().describe("Page (step) ID"),
      sectionId: z.string().describe("ID of the section to remove"),
      locationId: z.string().optional().describe("Target location ID"),
    },
    async ({ pageId, sectionId, locationId }) => {
      try {
        const client = getSiteBuilderClient(env, locationId);
        const result = await client.removeSectionFromPage(pageId, sectionId);
        return ok(
          `Section removed successfully.\n\n${JSON.stringify(result, null, 2)}`
        );
      } catch (e: any) {
        return err(e);
      }
    }
  );

  // ==========================================================
  // ADD ELEMENT
  // ==========================================================

  server.tool(
    "ghl_site_builder_add_element",
    "Add an element to a section (optionally inside a specific column) using read-modify-write (internal API). Reads the current page, inserts the element into the target section/column, then saves. element is a JSON string describing the element (type, content, styles, etc.).",
    {
      pageId: z.string().describe("Page (step) ID"),
      sectionId: z
        .string()
        .describe("ID of the section to add the element to"),
      element: z
        .string()
        .describe(
          "JSON string of the element object (e.g. { type: 'text', content: '...', styles: {...} })"
        ),
      columnId: z
        .string()
        .optional()
        .describe(
          "Column ID within the section to place the element (omit for section-level placement)"
        ),
      locationId: z.string().optional().describe("Target location ID"),
    },
    async ({ pageId, sectionId, element, columnId, locationId }) => {
      try {
        let parsed: Record<string, unknown>;
        try {
          parsed = JSON.parse(element);
        } catch (e: any) {
          return err(new Error(`Invalid element JSON: ${e.message}`));
        }

        const client = getSiteBuilderClient(env, locationId);
        const result = await client.addElementToSection(
          pageId,
          sectionId,
          parsed,
          columnId
        );
        return ok(
          `Element added successfully.\n\n${JSON.stringify(result, null, 2)}`
        );
      } catch (e: any) {
        return err(e);
      }
    }
  );

  // ==========================================================
  // UPDATE ELEMENT
  // ==========================================================

  server.tool(
    "ghl_site_builder_update_element",
    "Update properties of an existing element by element ID using read-modify-write (internal API). Searches all sections and columns for the element, merges the updates, then saves. updates is a JSON string of the properties to merge into the element.",
    {
      pageId: z.string().describe("Page (step) ID"),
      elementId: z.string().describe("ID of the element to update"),
      updates: z
        .string()
        .describe(
          "JSON string of properties to merge into the element (e.g. { content: 'new text', styles: { color: '#fff' } })"
        ),
      locationId: z.string().optional().describe("Target location ID"),
    },
    async ({ pageId, elementId, updates, locationId }) => {
      try {
        let parsed: Record<string, unknown>;
        try {
          parsed = JSON.parse(updates);
        } catch (e: any) {
          return err(new Error(`Invalid updates JSON: ${e.message}`));
        }

        const client = getSiteBuilderClient(env, locationId);
        const result = await client.updateElement(pageId, elementId, parsed);
        return ok(
          `Element updated successfully.\n\n${JSON.stringify(result, null, 2)}`
        );
      } catch (e: any) {
        return err(e);
      }
    }
  );

  // ==========================================================
  // REMOVE ELEMENT
  // ==========================================================

  server.tool(
    "ghl_site_builder_remove_element",
    "Remove an element from a page by element ID using read-modify-write (internal API). Searches all sections and columns, removes the matching element, then saves.",
    {
      pageId: z.string().describe("Page (step) ID"),
      elementId: z.string().describe("ID of the element to remove"),
      locationId: z.string().optional().describe("Target location ID"),
    },
    async ({ pageId, elementId, locationId }) => {
      try {
        const client = getSiteBuilderClient(env, locationId);
        const result = await client.removeElement(pageId, elementId);
        return ok(
          `Element removed successfully.\n\n${JSON.stringify(result, null, 2)}`
        );
      } catch (e: any) {
        return err(e);
      }
    }
  );

  // ==========================================================
  // CREATE FUNNEL
  // ==========================================================

  server.tool(
    "ghl_site_builder_create_funnel",
    'Create a new funnel or website in a location (internal API). Use type "funnel" for sales funnels and "website" for full websites.',
    {
      name: z.string().describe("Funnel or website name"),
      type: z
        .enum(["funnel", "website"])
        .optional()
        .describe('Type of site to create: "funnel" (default) or "website"'),
      locationId: z.string().optional().describe("Target location ID"),
    },
    async ({ name, type, locationId }) => {
      try {
        const client = getSiteBuilderClient(env, locationId);
        const result = await client.createFunnel(name, type || "funnel");
        const id = (result as any).id || (result as any)._id;
        return ok(
          `Funnel/website created successfully.\n\nID: ${id || JSON.stringify(result)}`
        );
      } catch (e: any) {
        return err(e);
      }
    }
  );

  // ==========================================================
  // CREATE STEP
  // ==========================================================

  server.tool(
    "ghl_site_builder_create_step",
    'Create a new page (step) inside a funnel or website (internal API). Use type "optin_funnel_page" for opt-in pages, "sales_page" for sales pages, etc. The url param sets the path slug for the page.',
    {
      funnelId: z
        .string()
        .describe("Funnel/website ID to create the step inside"),
      name: z.string().describe("Step/page name"),
      type: z
        .string()
        .optional()
        .describe(
          'Page type (default: "optin_funnel_page"). Other common values: "sales_page", "order_page", "upsell_page", "downsell_page", "thank_you_page"'
        ),
      url: z
        .string()
        .optional()
        .describe("URL slug for the page (e.g. /landing)"),
      locationId: z.string().optional().describe("Target location ID"),
    },
    async ({ funnelId, name, type, url, locationId }) => {
      try {
        const client = getSiteBuilderClient(env, locationId);
        const result = await client.createStep(funnelId, {
          id: crypto.randomUUID(),
          name,
          type: type || "optin_funnel_page",
          url,
        });
        const id = (result as any).page?._id || (result as any).page?.id;
        return ok(
          `Step/page created successfully.\n\nID: ${id || JSON.stringify(result)}`
        );
      } catch (e: any) {
        return err(e);
      }
    }
  );

  // ==========================================================
  // GET FUNNEL
  // ==========================================================

  server.tool(
    "ghl_site_builder_get_funnel",
    "Get details of a funnel or website by ID (internal API). Returns name, type, steps/pages list, settings, and metadata.",
    {
      funnelId: z.string().describe("Funnel/website ID"),
      locationId: z.string().optional().describe("Target location ID"),
    },
    async ({ funnelId, locationId }) => {
      try {
        const client = getSiteBuilderClient(env, locationId);
        const result = await client.getFunnel(funnelId);
        return ok(JSON.stringify(result, null, 2));
      } catch (e: any) {
        return err(e);
      }
    }
  );

  // ==========================================================
  // LIST FUNNELS
  // ==========================================================

  server.tool(
    "ghl_site_builder_list_funnels",
    'List all funnels or websites in a location (internal API). Filter by type to see only "funnel" or "website" entries. Returns IDs, names, step counts, and status.',
    {
      type: z
        .enum(["funnel", "website"])
        .optional()
        .describe('Filter by type: "funnel" or "website" (omit for all)'),
      locationId: z.string().optional().describe("Target location ID"),
    },
    async ({ type, locationId }) => {
      try {
        const client = getSiteBuilderClient(env, locationId);
        const result = await client.listFunnels(type);
        const funnels = result.data || [];
        const summary = funnels.map((f: any) => ({
          id: f.id || f._id,
          name: f.name,
          type: f.type,
          stepCount: f.steps?.length ?? f.stepCount ?? 0,
          updatedAt: f.updatedAt,
        }));
        return ok(
          `${funnels.length} funnel(s):\n\n${JSON.stringify(summary, null, 2)}`
        );
      } catch (e: any) {
        return err(e);
      }
    }
  );

  // ==========================================================
  // SAVE GLOBAL SECTIONS
  // ==========================================================

  server.tool(
    "ghl_site_builder_save_global_sections",
    "Save global (shared) sections to a funnel (internal API). Global sections are reused across multiple pages. Requires the current funnel version. sectionData is a JSON string of the global sections object.",
    {
      funnelId: z.string().describe("Funnel/website ID"),
      version: z
        .number()
        .describe(
          "Current funnel version — required for conflict prevention (get from ghl_site_builder_get_funnel)"
        ),
      sectionData: z
        .string()
        .describe(
          "JSON string of the global sections data object to save (e.g. { sections: [...] })"
        ),
      locationId: z.string().optional().describe("Target location ID"),
    },
    async ({ funnelId, version, sectionData, locationId }) => {
      try {
        let parsed: unknown;
        try {
          parsed = JSON.parse(sectionData);
        } catch (e: any) {
          return err(new Error(`Invalid sectionData JSON: ${e.message}`));
        }

        // Accept either an array directly or an object with a sections[] key
        const sections: any[] = Array.isArray(parsed)
          ? parsed
          : Array.isArray((parsed as any).sections)
          ? (parsed as any).sections
          : [parsed];

        const client = getSiteBuilderClient(env, locationId);
        const result = await client.saveGlobalSections(funnelId, version, sections);
        return ok(
          `Global sections saved successfully.\n\n${JSON.stringify(result, null, 2)}`
        );
      } catch (e: any) {
        return err(e);
      }
    }
  );
}
