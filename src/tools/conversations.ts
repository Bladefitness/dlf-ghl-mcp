import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { Env } from "../types";
import { ok, err, resolveClient } from "./_helpers";

export function registerConversationsTools(server: McpServer, env: Env) {
  server.tool(
    "ghl_search_conversations",
    "Search conversations in a location. Can filter by contact ID or text query.",
    {
      contactId: z.string().optional().describe("Filter by contact ID"),
      query: z.string().optional().describe("Text search query"),
      limit: z.string().optional().describe("Max results"),
      locationId: z.string().optional().describe("Target location"),
    },
    async ({ contactId, query, limit, locationId }) => {
      try {
        const client = await resolveClient(env, locationId);
        const result = await client.conversations.searchConversations(locationId, contactId, query, limit);
        const convos = result.conversations || [];
        if (convos.length === 0) return ok("No conversations found.");
        const summary = convos.map((c: any) => ({
          id: c.id,
          contactId: c.contactId,
          contactName: c.fullName || c.contactName || "N/A",
          lastMessageType: c.lastMessageType,
          lastMessageDate: c.lastMessageDate,
          unreadCount: c.unreadCount,
          type: c.type,
        }));
        return ok(`${convos.length} conversation(s):\n\n${JSON.stringify(summary, null, 2)}`);
      } catch (e: any) {
        return err(e);
      }
    }
  );

  server.tool(
    "ghl_get_conversation",
    "Get full details for a specific conversation.",
    { conversationId: z.string().describe("Conversation ID") },
    async ({ conversationId }) => {
      try {
        const client = await resolveClient(env);
        const result = await client.conversations.getConversation(conversationId);
        return ok(JSON.stringify(result, null, 2));
      } catch (e: any) {
        return err(e);
      }
    }
  );

  server.tool(
    "ghl_create_conversation",
    "Start a new conversation with a contact.",
    {
      contactId: z.string().describe("Contact ID to start conversation with"),
      locationId: z.string().optional().describe("Target location"),
    },
    async ({ contactId, locationId }) => {
      try {
        const client = await resolveClient(env, locationId);
        const result = await client.conversations.createConversation({ contactId, locationId });
        return ok(`Conversation created!\n\n${JSON.stringify(result, null, 2)}`);
      } catch (e: any) {
        return err(e);
      }
    }
  );

  server.tool(
    "ghl_get_conversation_messages",
    "Get messages in a conversation.",
    {
      conversationId: z.string().describe("Conversation ID"),
      limit: z.string().optional().describe("Max messages to return"),
    },
    async ({ conversationId, limit }) => {
      try {
        const client = await resolveClient(env);
        const result = await client.conversations.getConversationMessages(conversationId, limit);
        // GHL nests messages: { messages: { messages: [...], lastMessageId, nextPage } }
        const wrapper = result.messages || {};
        const msgs = Array.isArray(wrapper) ? wrapper : (wrapper as any).messages || [];
        if (!Array.isArray(msgs) || msgs.length === 0) return ok("No messages in this conversation.");
        const summary = msgs.map((m: any) => ({
          id: m.id,
          direction: m.direction,
          type: m.type || m.messageType,
          body: m.body || m.message,
          dateAdded: m.dateAdded,
          status: m.status,
          contentType: m.contentType,
        }));
        return ok(`${msgs.length} message(s):\n\n${JSON.stringify(summary, null, 2)}`);
      } catch (e: any) {
        return err(e);
      }
    }
  );

  server.tool(
    "ghl_send_message",
    `Send a message in a conversation. Supports SMS, Email, WhatsApp, etc.
For SMS: type="SMS", contactId, phone, message
For Email: type="Email", contactId, emailFrom, emailTo, subject, html or message`,
    {
      type: z.enum(["SMS", "Email", "WhatsApp", "GMB", "IG", "FB", "Custom", "Live_Chat"])
        .describe("Message channel type"),
      contactId: z.string().describe("Contact ID to message"),
      message: z.string().optional().describe("Message text (for SMS/WhatsApp/etc.)"),
      subject: z.string().optional().describe("Email subject"),
      html: z.string().optional().describe("Email HTML body"),
      emailFrom: z.string().optional().describe("From email address"),
      emailTo: z.string().optional().describe("To email address"),
      phone: z.string().optional().describe("Phone number for SMS/WhatsApp"),
      conversationId: z.string().optional().describe("Existing conversation ID"),
      conversationProviderId: z.string().optional().describe("Provider ID"),
    },
    async (args) => {
      try {
        const client = await resolveClient(env);
        const result = await client.conversations.sendMessage(args);
        return ok(`Message sent!\n\n${JSON.stringify(result, null, 2)}`);
      } catch (e: any) {
        return err(e);
      }
    }
  );

  server.tool(
    "ghl_get_message",
    "Get a single message by ID.",
    { messageId: z.string().describe("Message ID") },
    async ({ messageId }) => {
      try {
        const client = await resolveClient(env);
        const result = await client.conversations.getMessage(messageId);
        return ok(JSON.stringify(result, null, 2));
      } catch (e: any) {
        return err(e);
      }
    }
  );

  server.tool(
    "ghl_cancel_scheduled_messages",
    "Cancel all scheduled messages for a conversation.",
    { conversationId: z.string().describe("Conversation ID") },
    async ({ conversationId }) => {
      try {
        const client = await resolveClient(env);
        const result = await client.conversations.cancelScheduledMessages(conversationId);
        return ok(`Scheduled messages cancelled.\n\n${JSON.stringify(result, null, 2)}`);
      } catch (e: any) {
        return err(e);
      }
    }
  );
}
