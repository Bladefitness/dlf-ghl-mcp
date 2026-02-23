import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { Env } from "../types";
import { ok, err, resolveClient } from "./_helpers";

export function registerAutomationTools(server: McpServer, env: Env) {
  // ==========================================================
  // FORMS
  // ==========================================================

  server.tool(
    "ghl_list_forms",
    "List all forms in a location.",
    {
      type: z.string().optional().describe("Filter by form type"),
      limit: z.string().optional().describe("Max results"),
      skip: z.string().optional().describe("Skip (offset)"),
      locationId: z.string().optional().describe("Target location"),
    },
    async ({ type, limit, skip, locationId }) => {
      try {
        const client = await resolveClient(env, locationId);
        const result = await client.automation.listForms(locationId, { limit, skip, type });
        const forms = result.forms || [];
        const summary = forms.map((f: any) => ({
          id: f.id,
          name: f.name,
          type: f.type,
          submissions: f.submissionCount || 0,
          createdAt: f.createdAt,
        }));
        return ok(`${forms.length} form(s):\n\n${JSON.stringify(summary, null, 2)}`);
      } catch (e: any) {
        return err(e);
      }
    }
  );

  server.tool(
    "ghl_get_form_submissions",
    "Get submissions for a form with optional filters.",
    {
      formId: z.string().describe("Form ID"),
      q: z.string().optional().describe("Search text"),
      startAt: z.string().optional().describe("Start date (ISO 8601)"),
      endAt: z.string().optional().describe("End date (ISO 8601)"),
      limit: z.string().optional().describe("Max results"),
      page: z.string().optional().describe("Page number"),
      locationId: z.string().optional().describe("Target location"),
    },
    async ({ formId, q, startAt, endAt, limit, page, locationId }) => {
      try {
        const client = await resolveClient(env, locationId);
        const result = await client.automation.getFormSubmissions({
          locationId,
          formId,
          q,
          startAt,
          endAt,
          limit,
          page,
        });
        const subs = result.submissions || [];
        return ok(`${subs.length} submission(s):\n\n${JSON.stringify(subs, null, 2)}`);
      } catch (e: any) {
        return err(e);
      }
    }
  );

  // ==========================================================
  // SURVEYS
  // ==========================================================

  server.tool(
    "ghl_list_surveys",
    "List all surveys in a location.",
    {
      limit: z.string().optional().describe("Max results"),
      skip: z.string().optional().describe("Skip (offset)"),
      locationId: z.string().optional().describe("Target location"),
    },
    async ({ limit, skip, locationId }) => {
      try {
        const client = await resolveClient(env, locationId);
        const result = await client.automation.listSurveys(locationId, { limit, skip });
        const surveys = result.surveys || [];
        const summary = surveys.map((s: any) => ({
          id: s.id,
          name: s.name,
          submissions: s.submissionCount || 0,
          createdAt: s.createdAt,
        }));
        return ok(`${surveys.length} survey(ies):\n\n${JSON.stringify(summary, null, 2)}`);
      } catch (e: any) {
        return err(e);
      }
    }
  );

  server.tool(
    "ghl_get_survey_submissions",
    "Get submissions for a survey with optional filters.",
    {
      surveyId: z.string().describe("Survey ID"),
      q: z.string().optional().describe("Search text"),
      startAt: z.string().optional().describe("Start date (ISO 8601)"),
      endAt: z.string().optional().describe("End date (ISO 8601)"),
      limit: z.string().optional().describe("Max results"),
      page: z.string().optional().describe("Page number"),
      locationId: z.string().optional().describe("Target location"),
    },
    async ({ surveyId, q, startAt, endAt, limit, page, locationId }) => {
      try {
        const client = await resolveClient(env, locationId);
        const result = await client.automation.getSurveySubmissions({
          locationId,
          surveyId,
          q,
          startAt,
          endAt,
          limit,
          page,
        });
        const subs = result.submissions || [];
        return ok(`${subs.length} submission(s):\n\n${JSON.stringify(subs, null, 2)}`);
      } catch (e: any) {
        return err(e);
      }
    }
  );

  // ==========================================================
  // WORKFLOWS
  // ==========================================================

  server.tool(
    "ghl_list_workflows",
    "List all automation workflows in a location.",
    { locationId: z.string().optional().describe("Target location") },
    async ({ locationId }) => {
      try {
        const client = await resolveClient(env, locationId);
        const result = await client.automation.listWorkflows(locationId);
        const workflows = result.workflows || [];
        const summary = workflows.map((w: any) => ({
          id: w.id,
          name: w.name,
          status: w.status,
          trigger: w.trigger,
          enrolledCount: w.enrolledCount,
        }));
        return ok(`${workflows.length} workflow(s):\n\n${JSON.stringify(summary, null, 2)}`);
      } catch (e: any) {
        return err(e);
      }
    }
  );
}
