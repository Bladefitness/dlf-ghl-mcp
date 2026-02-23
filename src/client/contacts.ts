import { BaseGHLClient } from "./base";

export function contactMethods(client: BaseGHLClient) {
  return {
    async searchContacts(query: string, locationId?: string, limit?: number) {
      const q: Record<string, string> = { locationId: locationId || client.locationId, query };
      if (limit) q.limit = String(limit);
      return client.request<{ contacts: any[]; meta?: any }>("GET", `/contacts/`, {
        query: q,
        version: "2021-07-28",
      });
    },

    async getContact(contactId: string) {
      return client.request<{ contact: any }>("GET", `/contacts/${contactId}`, {
        version: "2021-07-28",
      });
    },

    async createContact(data: any) {
      return client.request<{ contact: any }>("POST", `/contacts/`, {
        body: { ...data, locationId: data.locationId || client.locationId },
        version: "2021-07-28",
      });
    },

    async updateContact(contactId: string, data: any) {
      return client.request<{ contact: any }>("PUT", `/contacts/${contactId}`, {
        body: data,
        version: "2021-07-28",
      });
    },

    async deleteContact(contactId: string) {
      return client.request<any>("DELETE", `/contacts/${contactId}`, {
        version: "2021-07-28",
      });
    },

    async bulkImportContacts(data: any) {
      return client.request<{ contact: any; new?: boolean }>("POST", `/contacts/upsert`, {
        body: { ...data, locationId: data.locationId || client.locationId },
        version: "2021-07-28",
      });
    },

    async listContactNotes(contactId: string) {
      return client.request<{ notes: any[] }>("GET", `/contacts/${contactId}/notes`, {
        version: "2021-07-28",
      });
    },

    async createContactNote(contactId: string, body: string) {
      return client.request<{ note: any }>("POST", `/contacts/${contactId}/notes`, {
        body: { body },
        version: "2021-07-28",
      });
    },

    async updateContactNote(contactId: string, noteId: string, body: string) {
      return client.request<{ note: any }>("PUT", `/contacts/${contactId}/notes/${noteId}`, {
        body: { body },
        version: "2021-07-28",
      });
    },

    async deleteContactNote(contactId: string, noteId: string) {
      return client.request<any>("DELETE", `/contacts/${contactId}/notes/${noteId}`, {
        version: "2021-07-28",
      });
    },

    async listContactTasks(contactId: string) {
      return client.request<{ tasks: any[] }>("GET", `/contacts/${contactId}/tasks`, {
        version: "2021-07-28",
      });
    },

    async createContactTask(contactId: string, data: any) {
      return client.request<{ task: any }>("POST", `/contacts/${contactId}/tasks`, {
        body: data,
        version: "2021-07-28",
      });
    },

    async updateContactTask(contactId: string, taskId: string, data: any) {
      return client.request<{ task: any }>("PUT", `/contacts/${contactId}/tasks/${taskId}`, {
        body: data,
        version: "2021-07-28",
      });
    },

    async deleteContactTask(contactId: string, taskId: string) {
      return client.request<any>("DELETE", `/contacts/${contactId}/tasks/${taskId}`, {
        version: "2021-07-28",
      });
    },

    async findDuplicateContacts(locationId?: string, params?: any) {
      const q: Record<string, string> = { locationId: locationId || client.locationId };
      if (params) {
        Object.entries(params).forEach(([k, v]) => {
          if (v !== undefined && v !== null) q[k] = String(v);
        });
      }
      return client.request<any>("GET", `/contacts/search/duplicate`, {
        query: q,
        version: "2021-07-28",
      });
    },

    async mergeDuplicateContacts(data: any) {
      return client.request<any>("POST", `/contacts/bulk/tags/update/merge`, {
        body: data,
        version: "2021-07-28",
      });
    },

    async deleteDuplicateContact(contactId: string) {
      return client.request<any>("DELETE", `/contacts/${contactId}`, {
        version: "2021-07-28",
      });
    },
  };
}
