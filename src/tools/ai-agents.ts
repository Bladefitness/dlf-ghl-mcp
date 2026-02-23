import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { Env } from "../types";
import { ok, err, resolveClient } from "./_helpers";

export function registerAIAgentsTools(server: McpServer, env: Env) {
  // ========== VOICE AI AGENTS ==========

  server.tool(
    "ghl_list_voice_agents",
    "List all Voice AI agents for a location.",
    {
      locationId: z.string().optional(),
      page: z.number().optional(),
      pageSize: z.number().optional(),
      query: z.string().optional(),
    },
    async ({ locationId, page, pageSize, query }) => {
      try {
        const client = await resolveClient(env, locationId);
        const result = await client.aiAgents.listVoiceAgents(client.apiKey, locationId || client.locationId, {
          page,
          pageSize,
          query,
        });
        return ok(JSON.stringify(result, null, 2));
      } catch (e: any) {
        return err(e);
      }
    }
  );

  server.tool(
    "ghl_get_voice_agent",
    "Get a Voice AI agent by ID.",
    {
      agentId: z.string(),
      locationId: z.string().optional(),
    },
    async ({ agentId, locationId }) => {
      try {
        const client = await resolveClient(env, locationId);
        const result = await client.aiAgents.getVoiceAgent(client.apiKey, agentId, locationId || client.locationId);
        return ok(JSON.stringify(result, null, 2));
      } catch (e: any) {
        return err(e);
      }
    }
  );

  server.tool(
    "ghl_create_voice_agent",
    "Create a new Voice AI agent.",
    {
      locationId: z.string().optional(),
      agentName: z.string(),
      businessName: z.string().optional(),
      welcomeMessage: z.string().optional(),
      agentPrompt: z.string().optional(),
      voiceId: z.string().optional(),
      language: z.string().optional(),
      patienceLevel: z.string().optional(),
      maxCallDuration: z.number().optional(),
    },
    async ({ locationId, agentName, businessName, welcomeMessage, agentPrompt, voiceId, language, patienceLevel, maxCallDuration }) => {
      try {
        const client = await resolveClient(env, locationId);
        const result = await client.aiAgents.createVoiceAgent(client.apiKey, {
          agentName,
          businessName,
          welcomeMessage,
          agentPrompt,
          voiceId,
          language,
          patienceLevel,
          maxCallDuration,
          locationId: locationId || client.locationId,
        });
        return ok(`Voice agent created!\n\n${JSON.stringify(result, null, 2)}`);
      } catch (e: any) {
        return err(e);
      }
    }
  );

  server.tool(
    "ghl_update_voice_agent",
    "Update a Voice AI agent.",
    {
      agentId: z.string(),
      locationId: z.string().optional(),
      body: z.record(z.any()),
    },
    async ({ agentId, locationId, body }) => {
      try {
        const client = await resolveClient(env, locationId);
        const result = await client.aiAgents.updateVoiceAgent(
          client.apiKey,
          agentId,
          locationId || client.locationId,
          body
        );
        return ok(`Voice agent updated!\n\n${JSON.stringify(result, null, 2)}`);
      } catch (e: any) {
        return err(e);
      }
    }
  );

  server.tool(
    "ghl_delete_voice_agent",
    "Delete a Voice AI agent.",
    {
      agentId: z.string(),
      locationId: z.string().optional(),
    },
    async ({ agentId, locationId }) => {
      try {
        const client = await resolveClient(env, locationId);
        await client.aiAgents.deleteVoiceAgent(client.apiKey, agentId, locationId || client.locationId);
        return ok(`Voice agent ${agentId} deleted.`);
      } catch (e: any) {
        return err(e);
      }
    }
  );

  server.tool(
    "ghl_create_voice_action",
    "Create an action for a Voice AI agent.",
    {
      agentId: z.string(),
      locationId: z.string().optional(),
      actionType: z.string(),
      name: z.string(),
      actionParameters: z.record(z.any()),
    },
    async ({ agentId, locationId, actionType, name, actionParameters }) => {
      try {
        const client = await resolveClient(env, locationId);
        const result = await client.aiAgents.createVoiceAction(client.apiKey, {
          agentId,
          locationId: locationId || client.locationId,
          actionType,
          name,
          actionParameters,
        });
        return ok(`Voice action created!\n\n${JSON.stringify(result, null, 2)}`);
      } catch (e: any) {
        return err(e);
      }
    }
  );

  server.tool(
    "ghl_get_voice_action",
    "Get a Voice AI agent action.",
    {
      actionId: z.string(),
      locationId: z.string().optional(),
    },
    async ({ actionId, locationId }) => {
      try {
        const client = await resolveClient(env, locationId);
        const result = await client.aiAgents.getVoiceAction(client.apiKey, actionId, locationId || client.locationId);
        return ok(JSON.stringify(result, null, 2));
      } catch (e: any) {
        return err(e);
      }
    }
  );

  server.tool(
    "ghl_update_voice_action",
    "Update a Voice AI agent action.",
    {
      actionId: z.string(),
      agentId: z.string(),
      locationId: z.string().optional(),
      actionType: z.string(),
      name: z.string(),
      actionParameters: z.record(z.any()),
    },
    async ({ actionId, agentId, locationId, actionType, name, actionParameters }) => {
      try {
        const client = await resolveClient(env, locationId);
        const result = await client.aiAgents.updateVoiceAction(client.apiKey, actionId, {
          agentId,
          locationId: locationId || client.locationId,
          actionType,
          name,
          actionParameters,
        });
        return ok(`Voice action updated!\n\n${JSON.stringify(result, null, 2)}`);
      } catch (e: any) {
        return err(e);
      }
    }
  );

  server.tool(
    "ghl_delete_voice_action",
    "Delete a Voice AI agent action.",
    {
      actionId: z.string(),
      locationId: z.string().optional(),
      agentId: z.string(),
    },
    async ({ actionId, locationId, agentId }) => {
      try {
        const client = await resolveClient(env, locationId);
        await client.aiAgents.deleteVoiceAction(client.apiKey, actionId, locationId || client.locationId, agentId);
        return ok(`Voice action ${actionId} deleted.`);
      } catch (e: any) {
        return err(e);
      }
    }
  );

  server.tool(
    "ghl_list_call_logs",
    "List Voice AI call logs.",
    {
      locationId: z.string().optional(),
      agentId: z.string().optional(),
      contactId: z.string().optional(),
      callType: z.string().optional(),
      startDate: z.number().optional(),
      endDate: z.number().optional(),
      page: z.number().optional(),
      pageSize: z.number().optional(),
    },
    async ({ locationId, agentId, contactId, callType, startDate, endDate, page, pageSize }) => {
      try {
        const client = await resolveClient(env, locationId);
        const result = await client.aiAgents.listCallLogs(client.apiKey, locationId || client.locationId, {
          agentId,
          contactId,
          callType,
          startDate,
          endDate,
          page,
          pageSize,
        });
        return ok(JSON.stringify(result, null, 2));
      } catch (e: any) {
        return err(e);
      }
    }
  );

  server.tool(
    "ghl_get_call_log",
    "Get a specific Voice AI call log.",
    {
      callId: z.string(),
      locationId: z.string().optional(),
    },
    async ({ callId, locationId }) => {
      try {
        const client = await resolveClient(env, locationId);
        const result = await client.aiAgents.getCallLog(client.apiKey, callId, locationId || client.locationId);
        return ok(JSON.stringify(result, null, 2));
      } catch (e: any) {
        return err(e);
      }
    }
  );

  // ========== CONVERSATION AI AGENTS ==========

  server.tool(
    "ghl_search_conversation_agents",
    "Search Conversation AI agents (text-based agents for SMS, Live Chat, WhatsApp, Instagram, Facebook, WebChat).",
    {
      query: z.string().optional().describe("Search query to filter agents by name"),
      startAfter: z.string().optional().describe("Cursor for pagination"),
      limit: z.string().optional().describe("Number of results to return"),
    },
    async ({ query, startAfter, limit }) => {
      try {
        const client = await resolveClient(env);
        const result = await client.aiAgents.searchConversationAgents({ query, startAfter, limit });
        return ok(JSON.stringify(result, null, 2));
      } catch (e: any) {
        return err(e);
      }
    }
  );

  server.tool(
    "ghl_get_conversation_agent",
    "Get a Conversation AI agent by ID.",
    {
      agentId: z.string().describe("The conversation agent ID"),
    },
    async ({ agentId }) => {
      try {
        const client = await resolveClient(env);
        const result = await client.aiAgents.getConversationAgent(agentId);
        return ok(JSON.stringify(result, null, 2));
      } catch (e: any) {
        return err(e);
      }
    }
  );

  server.tool(
    "ghl_create_conversation_agent",
    "Create a new Conversation AI agent (text-based agent for SMS, Live Chat, WhatsApp, etc). Requires name, personality, goal, and instructions.",
    {
      name: z.string().describe("Agent name"),
      personality: z.string().describe("Agent personality description"),
      goal: z.string().describe("Agent goal"),
      instructions: z.string().describe("Agent instructions"),
      businessName: z.string().optional().describe("Business name"),
      mode: z.enum(["off", "suggestive", "auto-pilot"]).optional().describe("Agent mode"),
      channels: z
        .array(z.enum(["IG", "FB", "SMS", "WebChat", "WhatsApp", "Live_Chat"]))
        .optional()
        .describe("Channels the agent operates on"),
      isPrimary: z.boolean().optional().describe("Whether this is the primary agent"),
      waitTime: z.number().optional().describe("Wait time before responding"),
      waitTimeUnit: z.string().optional().describe("Wait time unit (seconds/minutes)"),
      sleepEnabled: z.boolean().optional().describe("Enable sleep mode"),
      sleepTime: z.number().optional().describe("Sleep time value"),
      sleepTimeUnit: z.string().optional().describe("Sleep time unit"),
      autoPilotMaxMessages: z.number().optional().describe("Max messages in auto-pilot mode"),
      knowledgeBaseIds: z.array(z.string()).optional().describe("Knowledge base IDs to attach"),
      respondToImages: z.boolean().optional().describe("Whether agent can respond to images"),
      respondToAudio: z.boolean().optional().describe("Whether agent can respond to audio"),
    },
    async (params) => {
      try {
        const client = await resolveClient(env);
        const result = await client.aiAgents.createConversationAgent(params);
        return ok(`Conversation AI agent created!\n\n${JSON.stringify(result, null, 2)}`);
      } catch (e: any) {
        return err(e);
      }
    }
  );

  server.tool(
    "ghl_update_conversation_agent",
    "Update a Conversation AI agent (uses PUT - send all fields you want to keep).",
    {
      agentId: z.string().describe("The conversation agent ID to update"),
      name: z.string().optional().describe("Agent name"),
      personality: z.string().optional().describe("Agent personality description"),
      goal: z.string().optional().describe("Agent goal"),
      instructions: z.string().optional().describe("Agent instructions"),
      businessName: z.string().optional().describe("Business name"),
      mode: z.enum(["off", "suggestive", "auto-pilot"]).optional().describe("Agent mode"),
      channels: z
        .array(z.enum(["IG", "FB", "SMS", "WebChat", "WhatsApp", "Live_Chat"]))
        .optional()
        .describe("Channels"),
      isPrimary: z.boolean().optional().describe("Whether this is the primary agent"),
      waitTime: z.number().optional().describe("Wait time before responding"),
      waitTimeUnit: z.string().optional().describe("Wait time unit"),
      sleepEnabled: z.boolean().optional().describe("Enable sleep mode"),
      sleepTime: z.number().optional().describe("Sleep time value"),
      sleepTimeUnit: z.string().optional().describe("Sleep time unit"),
      autoPilotMaxMessages: z.number().optional().describe("Max messages in auto-pilot mode"),
      knowledgeBaseIds: z.array(z.string()).optional().describe("Knowledge base IDs"),
      respondToImages: z.boolean().optional().describe("Whether agent can respond to images"),
      respondToAudio: z.boolean().optional().describe("Whether agent can respond to audio"),
    },
    async ({ agentId, ...data }) => {
      try {
        const client = await resolveClient(env);
        const result = await client.aiAgents.updateConversationAgent(agentId, data);
        return ok(`Conversation AI agent updated!\n\n${JSON.stringify(result, null, 2)}`);
      } catch (e: any) {
        return err(e);
      }
    }
  );

  server.tool(
    "ghl_delete_conversation_agent",
    "Delete a Conversation AI agent.",
    {
      agentId: z.string().describe("The conversation agent ID to delete"),
    },
    async ({ agentId }) => {
      try {
        const client = await resolveClient(env);
        await client.aiAgents.deleteConversationAgent(agentId);
        return ok(`Conversation AI agent ${agentId} deleted.`);
      } catch (e: any) {
        return err(e);
      }
    }
  );
}
