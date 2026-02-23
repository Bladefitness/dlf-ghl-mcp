import { BaseGHLClient } from "./base";

export function automationMethods(client: BaseGHLClient) {
  return {
    async listWorkflows(locationId?: string) {
      return client.request<{ workflows: any[] }>("GET", `/workflows/`, {
        query: { locationId: locationId || client.locationId },
        version: "2021-07-28",
      });
    },

    async getWorkflow(workflowId: string) {
      return client.request<any>("GET", `/workflows/${workflowId}`, {
        version: "2021-07-28",
      });
    },

    async createWorkflow(data: any) {
      return client.request<any>("POST", `/workflows/`, {
        body: { ...data, locationId: data.locationId || client.locationId },
        version: "2021-07-28",
      });
    },

    async updateWorkflow(workflowId: string, data: any) {
      return client.request<any>("PUT", `/workflows/${workflowId}`, {
        body: data,
        version: "2021-07-28",
      });
    },

    async listForms(locationId?: string, opts?: { limit?: string; skip?: string; type?: string }) {
      const q: Record<string, string> = { locationId: locationId || client.locationId };
      if (opts?.limit) q.limit = opts.limit;
      if (opts?.skip) q.skip = opts.skip;
      if (opts?.type) q.type = opts.type;
      return client.request<{ forms: any[]; total?: number }>("GET", `/forms/`, {
        query: q,
        version: "2021-07-28",
      });
    },

    async getForm(formId: string) {
      return client.request<any>("GET", `/forms/${formId}`, {
        version: "2021-07-28",
      });
    },

    async getFormSubmissions(opts: {
      locationId?: string;
      formId?: string;
      limit?: string;
      page?: string;
      q?: string;
      startAt?: string;
      endAt?: string;
    }) {
      const q: Record<string, string> = { locationId: opts.locationId || client.locationId };
      if (opts.formId) q.formId = opts.formId;
      if (opts.limit) q.limit = opts.limit;
      if (opts.page) q.page = opts.page;
      if (opts.q) q.q = opts.q;
      if (opts.startAt) q.startAt = opts.startAt;
      if (opts.endAt) q.endAt = opts.endAt;
      return client.request<{ submissions: any[]; meta?: any }>("GET", `/forms/submissions`, {
        query: q,
        version: "2021-07-28",
      });
    },

    async listSurveys(locationId?: string, opts?: { limit?: string; skip?: string }) {
      const q: Record<string, string> = { locationId: locationId || client.locationId };
      if (opts?.limit) q.limit = opts.limit;
      if (opts?.skip) q.skip = opts.skip;
      return client.request<{ surveys: any[]; total?: number }>("GET", `/surveys/`, {
        query: q,
        version: "2021-07-28",
      });
    },

    async getSurvey(surveyId: string) {
      return client.request<any>("GET", `/surveys/${surveyId}`, {
        version: "2021-07-28",
      });
    },

    async getSurveySubmissions(opts: {
      locationId?: string;
      surveyId?: string;
      limit?: string;
      page?: string;
      q?: string;
      startAt?: string;
      endAt?: string;
    }) {
      const q: Record<string, string> = { locationId: opts.locationId || client.locationId };
      if (opts.surveyId) q.surveyId = opts.surveyId;
      if (opts.limit) q.limit = opts.limit;
      if (opts.page) q.page = opts.page;
      if (opts.q) q.q = opts.q;
      if (opts.startAt) q.startAt = opts.startAt;
      if (opts.endAt) q.endAt = opts.endAt;
      return client.request<{ submissions: any[]; meta?: any }>("GET", `/surveys/submissions`, {
        query: q,
        version: "2021-07-28",
      });
    },
  };
}
