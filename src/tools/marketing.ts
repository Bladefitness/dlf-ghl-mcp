import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { Env } from "../types";
import { ok, err, resolveClient } from "./_helpers";

export function registerMarketingTools(server: McpServer, env: Env) {
  // ==========================================================
  // FUNNELS & PAGES
  // ==========================================================

  server.tool(
    "ghl_list_funnels",
    "List all funnels/websites in a location.",
    {
      type: z.string().optional().describe("Filter by type"),
      limit: z.string().optional().describe("Max results"),
      offset: z.string().optional().describe("Offset"),
      locationId: z.string().optional().describe("Target location"),
    },
    async ({ type, limit, offset, locationId }) => {
      try {
        const client = await resolveClient(env, locationId);
        const result = await client.marketing.listFunnels(locationId, { type, limit, offset });
        const funnels = result.funnels || [];
        const summary = funnels.map((f: any) => ({
          id: f.id,
          name: f.name,
          type: f.type,
          url: f.url,
          createdAt: f.createdAt,
        }));
        return ok(`${funnels.length} funnel(s):\n\n${JSON.stringify(summary, null, 2)}`);
      } catch (e: any) {
        return err(e);
      }
    }
  );

  server.tool(
    "ghl_list_funnel_pages",
    "List all pages within a funnel.",
    {
      funnelId: z.string().describe("Funnel ID"),
      limit: z.string().optional().describe("Max results"),
      offset: z.string().optional().describe("Offset"),
      locationId: z.string().optional().describe("Target location"),
    },
    async ({ funnelId, limit, offset, locationId }) => {
      try {
        const client = await resolveClient(env, locationId);
        const result = await client.marketing.listFunnelPages(funnelId, locationId, {
          limit,
          offset,
        });
        const pages = result.funnelPages || result.pages || [];
        const summary = pages.map((p: any) => ({
          id: p.id,
          name: p.name,
          type: p.type,
          url: p.url,
        }));
        return ok(`${pages.length} page(s):\n\n${JSON.stringify(summary, null, 2)}`);
      } catch (e: any) {
        return err(e);
      }
    }
  );

  // ==========================================================
  // LINKS
  // ==========================================================

  server.tool(
    "ghl_list_links",
    "List all short links in a location.",
    { locationId: z.string().optional().describe("Target location") },
    async ({ locationId }) => {
      try {
        const client = await resolveClient(env, locationId);
        const result = await client.marketing.listLinks(locationId);
        const links = result.links || [];
        const summary = links.map((l: any) => ({
          id: l.id,
          shortSlug: l.shortSlug,
          longUrl: l.longUrl,
          clicks: l.clicks,
          createdAt: l.createdAt,
        }));
        return ok(`${links.length} link(s):\n\n${JSON.stringify(summary, null, 2)}`);
      } catch (e: any) {
        return err(e);
      }
    }
  );

  server.tool(
    "ghl_create_link",
    "Create a new short link.",
    {
      longUrl: z.string().describe("Long URL to shorten"),
      shortSlug: z.string().optional().describe("Custom slug (optional)"),
      title: z.string().optional().describe("Link title"),
      locationId: z.string().optional().describe("Target location"),
    },
    async (args) => {
      try {
        const client = await resolveClient(env, args.locationId);
        const result = await client.marketing.createLink(args);
        return ok(`Link created!\n\n${JSON.stringify(result, null, 2)}`);
      } catch (e: any) {
        return err(e);
      }
    }
  );

  server.tool(
    "ghl_update_link",
    "Update an existing short link.",
    {
      linkId: z.string().describe("Link ID"),
      longUrl: z.string().optional(),
      shortSlug: z.string().optional(),
      title: z.string().optional(),
    },
    async ({ linkId, ...data }) => {
      try {
        const client = await resolveClient(env);
        const result = await client.marketing.updateLink(linkId, data);
        return ok(`Link updated!\n\n${JSON.stringify(result, null, 2)}`);
      } catch (e: any) {
        return err(e);
      }
    }
  );

  server.tool(
    "ghl_delete_link",
    "Delete a short link.",
    { linkId: z.string().describe("Link ID") },
    async ({ linkId }) => {
      try {
        const client = await resolveClient(env);
        await client.marketing.deleteLink(linkId);
        return ok(`Link ${linkId} deleted.`);
      } catch (e: any) {
        return err(e);
      }
    }
  );

  // ==========================================================
  // SOCIAL MEDIA POSTING
  // ==========================================================

  server.tool(
    "ghl_list_social_posts",
    "List social media posts with optional filters.",
    {
      type: z.string().optional().describe("Filter by post type"),
      status: z.string().optional().describe("Filter by status"),
      fromDate: z.string().optional().describe("From date (ISO 8601)"),
      toDate: z.string().optional().describe("To date (ISO 8601)"),
      accounts: z.string().optional().describe("Filter by accounts (comma-separated)"),
      limit: z.string().optional().describe("Max results"),
      skip: z.string().optional().describe("Skip (offset)"),
      locationId: z.string().optional().describe("Target location"),
    },
    async ({ type, status, fromDate, toDate, accounts, limit, skip, locationId }) => {
      try {
        const client = await resolveClient(env, locationId);
        const result = await client.marketing.listSocialPosts(locationId, {
          type,
          status,
          fromDate,
          toDate,
          accounts,
          limit,
          skip,
        });
        const posts = result.posts || [];
        const summary = posts.map((p: any) => ({
          id: p.id,
          message: p.message?.substring(0, 100),
          status: p.status,
          scheduledTime: p.scheduledTime,
          createdAt: p.createdAt,
        }));
        return ok(`${posts.length} post(s):\n\n${JSON.stringify(summary, null, 2)}`);
      } catch (e: any) {
        return err(e);
      }
    }
  );

  server.tool(
    "ghl_create_social_post",
    "Create a social media post.",
    {
      locationId: z.string().describe("Location ID"),
      message: z.string().describe("Post message"),
      accounts: z.array(z.string()).optional().describe("Social accounts to post to"),
      scheduledTime: z.string().optional().describe("Schedule time (ISO 8601)"),
      media: z.array(z.string()).optional().describe("Media URLs"),
    },
    async ({ locationId, ...data }) => {
      try {
        const client = await resolveClient(env, locationId);
        const result = await client.marketing.createSocialPost(locationId, data);
        return ok(`Social post created!\n\n${JSON.stringify(result, null, 2)}`);
      } catch (e: any) {
        return err(e);
      }
    }
  );

  server.tool(
    "ghl_delete_social_post",
    "Delete a social media post.",
    {
      locationId: z.string().describe("Location ID"),
      postId: z.string().describe("Post ID"),
    },
    async ({ locationId, postId }) => {
      try {
        const client = await resolveClient(env, locationId);
        await client.marketing.deleteSocialPost(locationId, postId);
        return ok(`Social post ${postId} deleted.`);
      } catch (e: any) {
        return err(e);
      }
    }
  );

  server.tool(
    "ghl_get_social_accounts",
    "Get all connected social media accounts.",
    { locationId: z.string().optional().describe("Target location") },
    async ({ locationId }) => {
      try {
        const client = await resolveClient(env, locationId);
        const result = await client.marketing.getSocialAccounts(locationId);
        return ok(JSON.stringify(result, null, 2));
      } catch (e: any) {
        return err(e);
      }
    }
  );

  server.tool(
    "ghl_get_social_post",
    "Get a specific social media post.",
    {
      locationId: z.string().optional(),
      postId: z.string(),
    },
    async ({ locationId, postId }) => {
      try {
        const client = await resolveClient(env, locationId);
        const result = await client.marketing.getSocialPost(
          client.apiKey,
          locationId || client.locationId,
          postId
        );
        return ok(JSON.stringify(result, null, 2));
      } catch (e: any) {
        return err(e);
      }
    }
  );

  server.tool(
    "ghl_edit_social_post",
    "Edit a social media post.",
    {
      locationId: z.string().optional(),
      postId: z.string(),
      body: z.record(z.any()),
    },
    async ({ locationId, postId, body }) => {
      try {
        const client = await resolveClient(env, locationId);
        const result = await client.marketing.editSocialPost(
          client.apiKey,
          locationId || client.locationId,
          postId,
          body
        );
        return ok(`Social post edited!\n\n${JSON.stringify(result, null, 2)}`);
      } catch (e: any) {
        return err(e);
      }
    }
  );

  server.tool(
    "ghl_get_social_categories",
    "Get social media categories.",
    {
      locationId: z.string().optional(),
    },
    async ({ locationId }) => {
      try {
        const client = await resolveClient(env, locationId);
        const result = await client.marketing.getSocialCategories(
          client.apiKey,
          locationId || client.locationId
        );
        return ok(JSON.stringify(result, null, 2));
      } catch (e: any) {
        return err(e);
      }
    }
  );

  server.tool(
    "ghl_get_social_statistics",
    "Get social media statistics.",
    {
      body: z.record(z.any()),
    },
    async ({ body }) => {
      try {
        const client = await resolveClient(env);
        const result = await client.marketing.getSocialStatistics(client.apiKey, body);
        return ok(JSON.stringify(result, null, 2));
      } catch (e: any) {
        return err(e);
      }
    }
  );

  // ==========================================================
  // EMAILS / EMAIL BUILDER
  // ==========================================================

  server.tool(
    "ghl_list_email_templates",
    "List email builder templates.",
    {
      locationId: z.string().optional(),
      search: z.string().optional(),
      limit: z.string().optional(),
      offset: z.string().optional(),
    },
    async ({ locationId, search, limit, offset }) => {
      try {
        const client = await resolveClient(env, locationId);
        const result = await client.marketing.listEmailTemplates(client.apiKey, locationId || client.locationId, {
          search,
          limit,
          offset,
        });
        return ok(JSON.stringify(result, null, 2));
      } catch (e: any) {
        return err(e);
      }
    }
  );

  server.tool(
    "ghl_create_email_template",
    "Create a new email template.",
    {
      locationId: z.string().optional(),
      title: z.string().optional(),
      type: z.string(),
      importProvider: z.string(),
      body: z.record(z.any()).optional(),
    },
    async ({ locationId, title, type, importProvider, body }) => {
      try {
        const client = await resolveClient(env, locationId);
        const result = await client.marketing.createEmailTemplate(client.apiKey, {
          title,
          type,
          importProvider,
          body,
          locationId: locationId || client.locationId,
        });
        return ok(`Email template created!\n\n${JSON.stringify(result, null, 2)}`);
      } catch (e: any) {
        return err(e);
      }
    }
  );

  server.tool(
    "ghl_update_email_template",
    "Update an email template.",
    {
      locationId: z.string().optional(),
      templateId: z.string(),
      updatedBy: z.string(),
      html: z.string(),
      editorType: z.string(),
      dnd: z.record(z.any()),
    },
    async ({ locationId, templateId, updatedBy, html, editorType, dnd }) => {
      try {
        const client = await resolveClient(env, locationId);
        const result = await client.marketing.updateEmailTemplate(client.apiKey, {
          templateId,
          updatedBy,
          html,
          editorType,
          dnd,
          locationId: locationId || client.locationId,
        });
        return ok(`Email template updated!\n\n${JSON.stringify(result, null, 2)}`);
      } catch (e: any) {
        return err(e);
      }
    }
  );

  server.tool(
    "ghl_delete_email_template",
    "Delete an email template.",
    {
      locationId: z.string().optional(),
      templateId: z.string(),
    },
    async ({ locationId, templateId }) => {
      try {
        const client = await resolveClient(env, locationId);
        await client.marketing.deleteEmailTemplate(client.apiKey, locationId || client.locationId, templateId);
        return ok(`Email template ${templateId} deleted.`);
      } catch (e: any) {
        return err(e);
      }
    }
  );

  server.tool(
    "ghl_list_email_campaigns",
    "List email campaigns.",
    {
      locationId: z.string().optional(),
      status: z.string().optional(),
      name: z.string().optional(),
      limit: z.number().optional(),
      offset: z.number().optional(),
    },
    async ({ locationId, status, name, limit, offset }) => {
      try {
        const client = await resolveClient(env, locationId);
        const result = await client.marketing.listEmailCampaigns(client.apiKey, locationId || client.locationId, {
          status,
          name,
          limit,
          offset,
        });
        return ok(JSON.stringify(result, null, 2));
      } catch (e: any) {
        return err(e);
      }
    }
  );

  server.tool(
    "ghl_verify_email",
    "Verify an email address.",
    {
      locationId: z.string().optional(),
      email: z.string(),
    },
    async ({ locationId, email }) => {
      try {
        const client = await resolveClient(env, locationId);
        const result = await client.marketing.verifyEmail(client.apiKey, locationId || client.locationId, {
          email,
        });
        return ok(JSON.stringify(result, null, 2));
      } catch (e: any) {
        return err(e);
      }
    }
  );

  // ==========================================================
  // CAMPAIGNS
  // ==========================================================

  server.tool(
    "ghl_get_campaigns",
    "List campaigns for a location.",
    {
      locationId: z.string().optional(),
    },
    async ({ locationId }) => {
      try {
        const client = await resolveClient(env, locationId);
        const result = await client.marketing.getCampaigns(client.apiKey, locationId || client.locationId);
        return ok(JSON.stringify(result, null, 2));
      } catch (e: any) {
        return err(e);
      }
    }
  );

  server.tool(
    "ghl_add_contact_to_campaign",
    "Add a contact to a campaign.",
    {
      contactId: z.string(),
      campaignId: z.string(),
    },
    async ({ contactId, campaignId }) => {
      try {
        const client = await resolveClient(env);
        const result = await client.marketing.addContactToCampaign(client.apiKey, contactId, campaignId);
        return ok(`Contact added to campaign!\n\n${JSON.stringify(result, null, 2)}`);
      } catch (e: any) {
        return err(e);
      }
    }
  );

  server.tool(
    "ghl_remove_contact_from_campaign",
    "Remove a contact from a campaign.",
    {
      contactId: z.string(),
      campaignId: z.string(),
    },
    async ({ contactId, campaignId }) => {
      try {
        const client = await resolveClient(env);
        await client.marketing.removeContactFromCampaign(client.apiKey, contactId, campaignId);
        return ok(`Contact removed from campaign.`);
      } catch (e: any) {
        return err(e);
      }
    }
  );

  server.tool(
    "ghl_remove_contact_from_all_campaigns",
    "Remove a contact from all campaigns.",
    {
      contactId: z.string(),
    },
    async ({ contactId }) => {
      try {
        const client = await resolveClient(env);
        await client.marketing.removeContactFromAllCampaigns(client.apiKey, contactId);
        return ok(`Contact removed from all campaigns.`);
      } catch (e: any) {
        return err(e);
      }
    }
  );
}
