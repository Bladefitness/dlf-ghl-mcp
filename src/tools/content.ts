import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { Env } from "../types";
import { ok, err, resolveClient } from "./_helpers";

export function registerContentTools(server: McpServer, env: Env) {
  // ========== BLOGS ==========

  server.tool(
    "ghl_list_blogs",
    "List blogs for a location.",
    {
      locationId: z.string().optional(),
      skip: z.string().optional(),
      limit: z.string().optional(),
      searchTerm: z.string().optional(),
    },
    async ({ locationId, skip, limit, searchTerm }) => {
      try {
        const client = await resolveClient(env, locationId);
        const result = await client.content.listBlogs(locationId || client.locationId, skip, limit, searchTerm);
        return ok(JSON.stringify(result, null, 2));
      } catch (e: any) {
        return err(e);
      }
    }
  );

  server.tool(
    "ghl_get_blog",
    "Get a blog by ID.",
    {
      blogId: z.string(),
    },
    async ({ blogId }) => {
      try {
        const client = await resolveClient(env);
        const result = await client.content.getBlog(blogId);
        return ok(JSON.stringify(result, null, 2));
      } catch (e: any) {
        return err(e);
      }
    }
  );

  server.tool(
    "ghl_create_blog",
    "Create a new blog.",
    {
      data: z.record(z.any()),
    },
    async ({ data }) => {
      try {
        const client = await resolveClient(env);
        const result = await client.content.createBlog(data);
        return ok(`Blog created!\n\n${JSON.stringify(result, null, 2)}`);
      } catch (e: any) {
        return err(e);
      }
    }
  );

  server.tool(
    "ghl_update_blog",
    "Update a blog.",
    {
      blogId: z.string(),
      data: z.record(z.any()),
    },
    async ({ blogId, data }) => {
      try {
        const client = await resolveClient(env);
        const result = await client.content.updateBlog(blogId, data);
        return ok(`Blog updated!\n\n${JSON.stringify(result, null, 2)}`);
      } catch (e: any) {
        return err(e);
      }
    }
  );

  server.tool(
    "ghl_delete_blog",
    "Delete a blog.",
    {
      blogId: z.string(),
    },
    async ({ blogId }) => {
      try {
        const client = await resolveClient(env);
        await client.content.deleteBlog(blogId);
        return ok(`Blog ${blogId} deleted.`);
      } catch (e: any) {
        return err(e);
      }
    }
  );

  // ========== BLOG POSTS ==========

  server.tool(
    "ghl_list_blog_posts",
    "List blog posts.",
    {
      locationId: z.string().optional(),
      blogId: z.string().optional(),
      limit: z.string().optional(),
      offset: z.string().optional(),
      searchTerm: z.string().optional(),
      status: z.string().optional(),
    },
    async ({ locationId, blogId, limit, offset, searchTerm, status }) => {
      try {
        const client = await resolveClient(env, locationId);
        const result = await client.content.listBlogPosts(locationId || client.locationId, blogId, limit, offset, searchTerm, status);
        return ok(JSON.stringify(result, null, 2));
      } catch (e: any) {
        return err(e);
      }
    }
  );

  server.tool(
    "ghl_get_blog_post",
    "Get a blog post by ID.",
    {
      postId: z.string(),
    },
    async ({ postId }) => {
      try {
        const client = await resolveClient(env);
        const result = await client.content.getBlogPost(postId);
        return ok(JSON.stringify(result, null, 2));
      } catch (e: any) {
        return err(e);
      }
    }
  );

  server.tool(
    "ghl_create_blog_post",
    "Create a new blog post.",
    {
      data: z.record(z.any()),
    },
    async ({ data }) => {
      try {
        const client = await resolveClient(env);
        const result = await client.content.createBlogPost(data);
        return ok(`Blog post created!\n\n${JSON.stringify(result, null, 2)}`);
      } catch (e: any) {
        return err(e);
      }
    }
  );

  server.tool(
    "ghl_update_blog_post",
    "Update a blog post.",
    {
      postId: z.string(),
      data: z.record(z.any()),
    },
    async ({ postId, data }) => {
      try {
        const client = await resolveClient(env);
        const result = await client.content.updateBlogPost(postId, data);
        return ok(`Blog post updated!\n\n${JSON.stringify(result, null, 2)}`);
      } catch (e: any) {
        return err(e);
      }
    }
  );

  server.tool(
    "ghl_delete_blog_post",
    "Delete a blog post.",
    {
      postId: z.string(),
    },
    async ({ postId }) => {
      try {
        const client = await resolveClient(env);
        await client.content.deleteBlogPost(postId);
        return ok(`Blog post ${postId} deleted.`);
      } catch (e: any) {
        return err(e);
      }
    }
  );

  server.tool(
    "ghl_list_blog_categories",
    "List blog categories.",
    {
      locationId: z.string().optional(),
      limit: z.string().optional(),
      offset: z.string().optional(),
    },
    async ({ locationId, limit, offset }) => {
      try {
        const client = await resolveClient(env, locationId);
        const result = await client.content.listBlogCategories(locationId || client.locationId, limit, offset);
        return ok(JSON.stringify(result, null, 2));
      } catch (e: any) {
        return err(e);
      }
    }
  );

  server.tool(
    "ghl_list_blog_authors",
    "List blog authors.",
    {
      locationId: z.string().optional(),
      limit: z.string().optional(),
      offset: z.string().optional(),
    },
    async ({ locationId, limit, offset }) => {
      try {
        const client = await resolveClient(env, locationId);
        const result = await client.content.listBlogAuthors(locationId || client.locationId, limit, offset);
        return ok(JSON.stringify(result, null, 2));
      } catch (e: any) {
        return err(e);
      }
    }
  );

  // ========== MEDIA ==========

  server.tool(
    "ghl_upload_file",
    "Upload a file to the media library.",
    {
      body: z.record(z.any()),
    },
    async ({ body }) => {
      try {
        const client = await resolveClient(env);
        const result = await client.content.uploadFile(body);
        return ok(`File uploaded!\n\n${JSON.stringify(result, null, 2)}`);
      } catch (e: any) {
        return err(e);
      }
    }
  );

  server.tool(
    "ghl_create_media_folder",
    "Create a folder in the media library.",
    {
      body: z.record(z.any()),
    },
    async ({ body }) => {
      try {
        const client = await resolveClient(env);
        const result = await client.content.createFolder(body);
        return ok(`Media folder created!\n\n${JSON.stringify(result, null, 2)}`);
      } catch (e: any) {
        return err(e);
      }
    }
  );

  server.tool(
    "ghl_bulk_delete_media",
    "Bulk delete files or folders.",
    {
      body: z.record(z.any()),
    },
    async ({ body }) => {
      try {
        const client = await resolveClient(env);
        const result = await client.content.bulkDeleteMedia(body);
        return ok(`Media deleted!\n\n${JSON.stringify(result, null, 2)}`);
      } catch (e: any) {
        return err(e);
      }
    }
  );

  // ========== DOCUMENTS & CONTRACTS ==========

  server.tool(
    "ghl_list_documents",
    "List documents and contracts.",
    {
      locationId: z.string().optional(),
      status: z.string().optional(),
      limit: z.number().optional(),
      skip: z.number().optional(),
      query: z.string().optional(),
    },
    async ({ locationId, status, limit, skip, query }) => {
      try {
        const client = await resolveClient(env, locationId);
        const result = await client.content.listDocuments(locationId || client.locationId, { status, limit, skip, query });
        return ok(JSON.stringify(result, null, 2));
      } catch (e: any) {
        return err(e);
      }
    }
  );

  server.tool(
    "ghl_list_document_templates",
    "List document/contract templates.",
    {
      locationId: z.string().optional(),
      type: z.string().optional(),
      name: z.string().optional(),
      limit: z.string().optional(),
      skip: z.string().optional(),
    },
    async ({ locationId, type, name, limit, skip }) => {
      try {
        const client = await resolveClient(env, locationId);
        const result = await client.content.listDocumentTemplates(locationId || client.locationId, { type, name, limit, skip });
        return ok(JSON.stringify(result, null, 2));
      } catch (e: any) {
        return err(e);
      }
    }
  );

  server.tool(
    "ghl_send_document",
    "Send a document to a recipient.",
    {
      locationId: z.string().optional(),
      documentId: z.string(),
      sentBy: z.string(),
      medium: z.string().optional(),
      ccRecipients: z.array(z.string()).optional(),
    },
    async ({ locationId, documentId, sentBy, medium, ccRecipients }) => {
      try {
        const client = await resolveClient(env, locationId);
        const result = await client.content.sendDocument({ documentId, sentBy, medium, ccRecipients, locationId: locationId || client.locationId });
        return ok(`Document sent!\n\n${JSON.stringify(result, null, 2)}`);
      } catch (e: any) {
        return err(e);
      }
    }
  );

  server.tool(
    "ghl_send_document_template",
    "Send a document template to a contact.",
    {
      templateId: z.string(),
      userId: z.string(),
      locationId: z.string().optional(),
      contactId: z.string(),
      opportunityId: z.string().optional(),
      sendDocument: z.boolean().optional(),
    },
    async ({ templateId, userId, locationId, contactId, opportunityId, sendDocument }) => {
      try {
        const client = await resolveClient(env, locationId);
        const result = await client.content.sendDocumentTemplate({ templateId, userId, contactId, opportunityId, sendDocument, locationId: locationId || client.locationId });
        return ok(`Document template sent!\n\n${JSON.stringify(result, null, 2)}`);
      } catch (e: any) {
        return err(e);
      }
    }
  );

  // ========== CUSTOM MENUS ==========

  server.tool(
    "ghl_list_custom_menus",
    "List custom menu links.",
    {
      locationId: z.string().optional(),
      query: z.string().optional(),
      limit: z.number().optional(),
      skip: z.number().optional(),
    },
    async ({ locationId, query, limit, skip }) => {
      try {
        const client = await resolveClient(env, locationId);
        const result = await client.content.listCustomMenus(locationId || client.locationId, { query, limit, skip });
        return ok(JSON.stringify(result, null, 2));
      } catch (e: any) {
        return err(e);
      }
    }
  );

  server.tool(
    "ghl_get_custom_menu",
    "Get a custom menu link by ID.",
    {
      customMenuId: z.string(),
    },
    async ({ customMenuId }) => {
      try {
        const client = await resolveClient(env);
        const result = await client.content.getCustomMenu(customMenuId);
        return ok(JSON.stringify(result, null, 2));
      } catch (e: any) {
        return err(e);
      }
    }
  );

  server.tool(
    "ghl_create_custom_menu",
    "Create a custom menu link.",
    {
      title: z.string(),
      url: z.string(),
      icon: z.record(z.any()),
      showOnCompany: z.boolean(),
      showOnLocation: z.boolean(),
      showToAllLocations: z.boolean(),
      openMode: z.string(),
      locations: z.array(z.string()),
      userRole: z.string(),
    },
    async ({ title, url, icon, showOnCompany, showOnLocation, showToAllLocations, openMode, locations, userRole }) => {
      try {
        const client = await resolveClient(env);
        const result = await client.content.createCustomMenu({ title, url, icon, showOnCompany, showOnLocation, showToAllLocations, openMode, locations, userRole });
        return ok(`Custom menu created!\n\n${JSON.stringify(result, null, 2)}`);
      } catch (e: any) {
        return err(e);
      }
    }
  );

  server.tool(
    "ghl_update_custom_menu",
    "Update a custom menu link.",
    {
      customMenuId: z.string(),
      body: z.record(z.any()),
    },
    async ({ customMenuId, body }) => {
      try {
        const client = await resolveClient(env);
        const result = await client.content.updateCustomMenu(customMenuId, body);
        return ok(`Custom menu updated!\n\n${JSON.stringify(result, null, 2)}`);
      } catch (e: any) {
        return err(e);
      }
    }
  );

  server.tool(
    "ghl_delete_custom_menu",
    "Delete a custom menu link.",
    {
      customMenuId: z.string(),
    },
    async ({ customMenuId }) => {
      try {
        const client = await resolveClient(env);
        await client.content.deleteCustomMenu(customMenuId);
        return ok(`Custom menu ${customMenuId} deleted.`);
      } catch (e: any) {
        return err(e);
      }
    }
  );

  // ========== SNAPSHOTS ==========

  server.tool(
    "ghl_get_snapshots",
    "Get agency snapshots.",
    {
      companyId: z.string(),
    },
    async ({ companyId }) => {
      try {
        const client = await resolveClient(env);
        const result = await client.content.getSnapshots(companyId);
        return ok(JSON.stringify(result, null, 2));
      } catch (e: any) {
        return err(e);
      }
    }
  );

  server.tool(
    "ghl_create_snapshot_share_link",
    "Create a snapshot share link.",
    {
      companyId: z.string(),
      body: z.record(z.any()),
    },
    async ({ companyId, body }) => {
      try {
        const client = await resolveClient(env);
        const result = await client.content.createSnapshotShareLink(companyId, body);
        return ok(`Snapshot share link created!\n\n${JSON.stringify(result, null, 2)}`);
      } catch (e: any) {
        return err(e);
      }
    }
  );

  server.tool(
    "ghl_get_snapshot_push_status",
    "Get snapshot push status between dates.",
    {
      snapshotId: z.string(),
      companyId: z.string(),
      from: z.string(),
      to: z.string(),
      lastDoc: z.string(),
      limit: z.string(),
    },
    async ({ snapshotId, companyId, from, to, lastDoc, limit }) => {
      try {
        const client = await resolveClient(env);
        const result = await client.content.getSnapshotPushStatus(snapshotId, companyId, from, to, lastDoc, limit);
        return ok(JSON.stringify(result, null, 2));
      } catch (e: any) {
        return err(e);
      }
    }
  );

  server.tool(
    "ghl_get_last_snapshot_push",
    "Get last snapshot push for a location.",
    {
      snapshotId: z.string(),
      locationId: z.string(),
      companyId: z.string(),
    },
    async ({ snapshotId, locationId, companyId }) => {
      try {
        const client = await resolveClient(env, locationId);
        const result = await client.content.getLastSnapshotPush(snapshotId, locationId, companyId);
        return ok(JSON.stringify(result, null, 2));
      } catch (e: any) {
        return err(e);
      }
    }
  );

  // ========== EMAIL TEMPLATES & CAMPAIGNS ==========

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
        const result = await client.content.listEmailTemplates(locationId || client.locationId, { search, limit, offset });
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
        const result = await client.content.createEmailTemplate({ title, type, importProvider, body, locationId: locationId || client.locationId });
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
        const result = await client.content.updateEmailTemplate({ templateId, updatedBy, html, editorType, dnd, locationId: locationId || client.locationId });
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
        await client.content.deleteEmailTemplate(locationId || client.locationId, templateId);
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
        const result = await client.content.listEmailCampaigns(locationId || client.locationId, { status, name, limit, offset });
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
        const result = await client.content.verifyEmail(locationId || client.locationId, { email });
        return ok(JSON.stringify(result, null, 2));
      } catch (e: any) {
        return err(e);
      }
    }
  );
}
