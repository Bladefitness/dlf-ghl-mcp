import { BaseGHLClient } from "./base";

export function aiAgentMethods(client: BaseGHLClient) {
  return {
    async listVoiceAgents(locationId?: string, params?: { page?: string; pageSize?: string; query?: string }) {
      const q: Record<string, string> = { locationId: locationId || client.locationId };
      if (params?.page) q.page = params.page;
      if (params?.pageSize) q.pageSize = params.pageSize;
      if (params?.query) q.query = params.query;
      return client.request<any>("GET", `/voice-ai/agents`, {
        query: q,
        version: "2021-07-28",
      });
    },

    async getVoiceAgent(agentId: string, locationId?: string) {
      return client.request<any>("GET", `/voice-ai/agents/${agentId}`, {
        query: { locationId: locationId || client.locationId },
        version: "2021-07-28",
      });
    },

    async createVoiceAgent(data: any) {
      return client.request<any>("POST", `/voice-ai/agents`, {
        body: { ...data, locationId: data.locationId || client.locationId },
        version: "2021-07-28",
      });
    },

    async updateVoiceAgent(agentId: string, locationId: string, data: any) {
      return client.request<any>("PATCH", `/voice-ai/agents/${agentId}`, {
        query: { locationId },
        body: data,
        version: "2021-07-28",
      });
    },

    async deleteVoiceAgent(agentId: string, locationId?: string) {
      return client.request<any>("DELETE", `/voice-ai/agents/${agentId}`, {
        query: { locationId: locationId || client.locationId },
        version: "2021-07-28",
      });
    },

    async createVoiceAction(data: any) {
      return client.request<any>("POST", `/voice-ai/actions`, {
        body: data,
        version: "2021-07-28",
      });
    },

    async getVoiceAction(actionId: string, locationId?: string) {
      return client.request<any>("GET", `/voice-ai/actions/${actionId}`, {
        query: { locationId: locationId || client.locationId },
        version: "2021-07-28",
      });
    },

    async updateVoiceAction(actionId: string, data: any) {
      return client.request<any>("PUT", `/voice-ai/actions/${actionId}`, {
        body: data,
        version: "2021-07-28",
      });
    },

    async deleteVoiceAction(actionId: string, locationId?: string, agentId?: string) {
      const q: Record<string, string> = { locationId: locationId || client.locationId };
      if (agentId) q.agentId = agentId;
      return client.request<any>("DELETE", `/voice-ai/actions/${actionId}`, {
        query: q,
        version: "2021-07-28",
      });
    },

    async listCallLogs(locationId?: string, params?: {
      agentId?: string;
      contactId?: string;
      callType?: string;
      startDate?: string;
      endDate?: string;
      page?: string;
      pageSize?: string;
    }) {
      const q: Record<string, string> = { locationId: locationId || client.locationId };
      if (params?.agentId) q.agentId = params.agentId;
      if (params?.contactId) q.contactId = params.contactId;
      if (params?.callType) q.callType = params.callType;
      if (params?.startDate) q.startDate = params.startDate;
      if (params?.endDate) q.endDate = params.endDate;
      if (params?.page) q.page = params.page;
      if (params?.pageSize) q.pageSize = params.pageSize;
      return client.request<any>("GET", `/voice-ai/dashboard/call-logs`, {
        query: q,
        version: "2021-07-28",
      });
    },

    async getCallLog(callId: string, locationId?: string) {
      return client.request<any>("GET", `/voice-ai/dashboard/call-logs/${callId}`, {
        query: { locationId: locationId || client.locationId },
        version: "2021-07-28",
      });
    },

    async searchConversationAgents(params?: { startAfter?: string; limit?: string; query?: string }) {
      const q: Record<string, string> = {};
      if (params?.startAfter) q.startAfter = params.startAfter;
      if (params?.limit) q.limit = params.limit;
      if (params?.query) q.query = params.query;
      return client.request<any>("GET", `/conversation-ai/agents/search`, {
        query: q,
        version: "2021-04-15",
      });
    },

    async getConversationAgent(agentId: string) {
      return client.request<any>("GET", `/conversation-ai/agents/${agentId}`, {
        version: "2021-04-15",
      });
    },

    async createConversationAgent(data: any) {
      return client.request<any>("POST", `/conversation-ai/agents`, {
        body: data,
        version: "2021-04-15",
      });
    },

    async updateConversationAgent(agentId: string, data: any) {
      return client.request<any>("PUT", `/conversation-ai/agents/${agentId}`, {
        body: data,
        version: "2021-04-15",
      });
    },

    async deleteConversationAgent(agentId: string) {
      return client.request<any>("DELETE", `/conversation-ai/agents/${agentId}`, {
        version: "2021-04-15",
      });
    },
  };
}
