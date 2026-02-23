import { BaseGHLClient } from "./base";

export function marketingMethods(client: BaseGHLClient) {
  return {
    async listCampaigns(locationId?: string) {
      return client.request<any>("GET", `/campaigns/`, {
        query: { locationId: locationId || client.locationId },
        version: "2021-07-28",
      });
    },

    async createCampaign(data: any) {
      return client.request<any>("POST", `/campaigns/`, {
        body: { ...data, locationId: data.locationId || client.locationId },
        version: "2021-07-28",
      });
    },

    async updateCampaign(campaignId: string, data: any) {
      return client.request<any>("PUT", `/campaigns/${campaignId}`, {
        body: data,
        version: "2021-07-28",
      });
    },

    async getCampaign(campaignId: string) {
      return client.request<any>("GET", `/campaigns/${campaignId}`, {
        version: "2021-07-28",
      });
    },

    async createSocialPost(locationId: string, data: any) {
      const locId = locationId || client.locationId;
      return client.request<any>("POST", `/social-media-posting/${locId}/posts`, {
        body: data,
        version: "2021-07-28",
      });
    },

    async getSocialPost(locationId: string, postId: string) {
      return client.request<any>("GET", `/social-media-posting/${locationId}/posts/${postId}`, {
        version: "2021-07-28",
      });
    },

    async deleteSocialPost(locationId: string, postId: string) {
      const locId = locationId || client.locationId;
      return client.request<any>("DELETE", `/social-media-posting/${locId}/posts/${postId}`, {
        version: "2021-07-28",
      });
    },

    async listSocialCategories(locationId?: string) {
      const locId = locationId || client.locationId;
      return client.request<any>("GET", `/social-media-posting/${locId}/categories`, {
        version: "2021-07-28",
      });
    },

    async getSocialStatistics(data: any) {
      return client.request<any>("POST", `/social-media-posting/statistics`, {
        body: data,
        version: "2021-07-28",
      });
    },

    async listEmails(locationId?: string, params?: { limit?: string; offset?: string; search?: string; sortByDate?: string; archived?: string; builderVersion?: string }) {
      const q: Record<string, string> = { locationId: locationId || client.locationId };
      if (params?.limit) q.limit = params.limit;
      if (params?.offset) q.offset = params.offset;
      if (params?.search) q.search = params.search;
      if (params?.sortByDate) q.sortByDate = params.sortByDate;
      if (params?.archived) q.archived = params.archived;
      if (params?.builderVersion) q.builderVersion = params.builderVersion;
      return client.request<any>("GET", `/emails/builder`, {
        query: q,
        version: "2021-07-28",
      });
    },

    async getEmail(emailId: string) {
      return client.request<any>("GET", `/emails/${emailId}`, {
        version: "2021-07-28",
      });
    },

    async createEmail(data: any) {
      return client.request<any>("POST", `/emails/builder`, {
        body: { ...data, locationId: data.locationId || client.locationId },
        version: "2021-07-28",
      });
    },

    async updateEmail(data: any) {
      return client.request<any>("POST", `/emails/builder/data`, {
        body: { ...data, locationId: data.locationId || client.locationId },
        version: "2021-07-28",
      });
    },

    async deleteEmail(locationId: string, templateId: string) {
      return client.request<any>("DELETE", `/emails/builder/${locationId}/${templateId}`, {
        version: "2021-07-28",
      });
    },

    async listFunnels(locationId?: string, opts?: { limit?: string; offset?: string; type?: string }) {
      const q: Record<string, string> = { locationId: locationId || client.locationId };
      if (opts?.limit) q.limit = opts.limit;
      if (opts?.offset) q.offset = opts.offset;
      if (opts?.type) q.type = opts.type;
      return client.request<{ funnels: any[]; count?: number; total?: number }>("GET", `/funnels/funnel/list`, {
        query: q,
        version: "2021-07-28",
      });
    },

    async createFunnel(data: any) {
      return client.request<any>("POST", `/funnels/funnel/list`, {
        body: { ...data, locationId: data.locationId || client.locationId },
        version: "2021-07-28",
      });
    },

    async getFunnel(funnelId: string) {
      return client.request<any>("GET", `/funnels/funnel/${funnelId}`, {
        version: "2021-07-28",
      });
    },

    async listFunnelPages(funnelId: string, locationId?: string, opts?: { limit?: string; offset?: string }) {
      const q: Record<string, string> = { locationId: locationId || client.locationId };
      if (opts?.limit) q.limit = opts.limit;
      if (opts?.offset) q.offset = opts.offset;
      return client.request<any>("GET", `/funnels/page`, {
        query: { ...q, funnelId },
        version: "2021-07-28",
      });
    },

    async getFunnelPage(funnelId: string, pageId: string) {
      return client.request<any>("GET", `/funnels/page/${pageId}`, {
        query: { funnelId },
        version: "2021-07-28",
      });
    },

    async listLinks(locationId?: string) {
      return client.request<{ links: any[] }>("GET", `/links/`, {
        query: { locationId: locationId || client.locationId },
        version: "2021-07-28",
      });
    },

    async createLink(data: any) {
      return client.request<{ link: any }>("POST", `/links/`, {
        body: { ...data, locationId: data.locationId || client.locationId },
        version: "2021-07-28",
      });
    },

    async updateLink(linkId: string, data: any) {
      return client.request<{ link: any }>("PUT", `/links/${linkId}`, {
        body: data,
        version: "2021-07-28",
      });
    },

    async deleteLink(linkId: string) {
      return client.request<any>("DELETE", `/links/${linkId}`, {
        version: "2021-07-28",
      });
    },
  };
}
