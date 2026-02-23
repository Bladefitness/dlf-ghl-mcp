import { BaseGHLClient } from "./base";

export function conversationMethods(client: BaseGHLClient) {
  return {
    async searchConversations(locationId?: string, contactId?: string, query?: string, limit?: string) {
      const q: Record<string, string> = { locationId: locationId || client.locationId };
      if (contactId) q.contactId = contactId;
      if (query) q.q = query;
      if (limit) q.limit = limit;
      return client.request<{ conversations: any[] }>("GET", `/conversations/search`, {
        query: q,
        version: "2021-07-28",
      });
    },

    async getConversation(conversationId: string) {
      return client.request<{ conversation: any }>("GET", `/conversations/${conversationId}`, {
        version: "2021-07-28",
      });
    },

    async createConversation(data: { contactId: string; locationId?: string }) {
      return client.request<{ conversation: any }>("POST", `/conversations/`, {
        body: { ...data, locationId: data.locationId || client.locationId },
        version: "2021-07-28",
      });
    },

    async updateConversation(conversationId: string, data: any) {
      return client.request<{ conversation: any }>("PUT", `/conversations/${conversationId}`, {
        body: data,
        version: "2021-07-28",
      });
    },

    async deleteConversation(conversationId: string) {
      return client.request<any>("DELETE", `/conversations/${conversationId}`, {
        version: "2021-07-28",
      });
    },

    async getConversationMessages(conversationId: string, limit?: string) {
      const q: Record<string, string> = {};
      if (limit) q.limit = limit;
      return client.request<{ messages: any }>("GET", `/conversations/${conversationId}/messages`, {
        query: q,
        version: "2021-07-28",
      });
    },

    async sendConversationMessage(data: any) {
      return client.request<{ message: any; conversationId: string }>("POST", `/conversations/messages`, {
        body: data,
        version: "2021-07-28",
      });
    },
  };
}
