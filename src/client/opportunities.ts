import { BaseGHLClient } from "./base";

export function opportunityMethods(client: BaseGHLClient) {
  return {
    async searchOpportunities(opts: {
      locationId?: string;
      pipelineId?: string;
      pipelineStageId?: string;
      contactId?: string;
      status?: string;
      q?: string;
      limit?: string;
      startAfter?: string;
      startAfterId?: string;
      order?: string;
    }) {
      const q: Record<string, string> = { location_id: opts.locationId || client.locationId };
      if (opts.pipelineId) q.pipeline_id = opts.pipelineId;
      if (opts.pipelineStageId) q.pipeline_stage_id = opts.pipelineStageId;
      if (opts.contactId) q.contact_id = opts.contactId;
      if (opts.status) q.status = opts.status;
      if (opts.q) q.q = opts.q;
      if (opts.limit) q.limit = opts.limit;
      if (opts.startAfter) q.startAfter = opts.startAfter;
      if (opts.startAfterId) q.startAfterId = opts.startAfterId;
      if (opts.order) q.order = opts.order;
      return client.request<{ opportunities: any[]; meta?: any }>("GET", `/opportunities/search`, {
        query: q,
        version: "2021-07-28",
      });
    },

    async getOpportunity(opportunityId: string) {
      return client.request<{ opportunity: any }>("GET", `/opportunities/${opportunityId}`, {
        version: "2021-07-28",
      });
    },

    async createOpportunity(data: any) {
      return client.request<{ opportunity: any }>("POST", `/opportunities/`, {
        body: { ...data, locationId: data.locationId || client.locationId },
        version: "2021-07-28",
      });
    },

    async updateOpportunity(opportunityId: string, data: any) {
      return client.request<{ opportunity: any }>("PUT", `/opportunities/${opportunityId}`, {
        body: data,
        version: "2021-07-28",
      });
    },

    async deleteOpportunity(opportunityId: string) {
      return client.request<any>("DELETE", `/opportunities/${opportunityId}`, {
        version: "2021-07-28",
      });
    },

    async listPipelines(locationId?: string) {
      return client.request<{ pipelines: any[] }>("GET", `/opportunities/pipelines`, {
        query: { locationId: locationId || client.locationId },
        version: "2021-07-28",
      });
    },

    async getPipeline(pipelineId: string, locationId?: string) {
      return client.request<{ pipeline: any }>("GET", `/opportunities/pipelines/${pipelineId}`, {
        query: { locationId: locationId || client.locationId },
        version: "2021-07-28",
      });
    },

    async createPipeline(data: any) {
      return client.request<{ pipeline: any }>("POST", `/opportunities/pipelines`, {
        body: { ...data, locationId: data.locationId || client.locationId },
        version: "2021-07-28",
      });
    },

    async updatePipeline(pipelineId: string, data: any) {
      return client.request<{ pipeline: any }>("PUT", `/opportunities/pipelines/${pipelineId}`, {
        body: data,
        version: "2021-07-28",
      });
    },

    async deletePipeline(pipelineId: string) {
      return client.request<any>("DELETE", `/opportunities/pipelines/${pipelineId}`, {
        version: "2021-07-28",
      });
    },
  };
}
