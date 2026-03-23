/**
 * GHL Internal Workflow Builder Client
 * Uses backend.leadconnectorhq.com (undocumented internal API)
 * Auth: Firebase JWT via token-id header
 * Auto-refreshes tokens using Firebase securetoken API + KV cache
 */

const INTERNAL_BASE = "https://backend.leadconnectorhq.com";
const FIREBASE_API_KEY = "AIzaSyB_w3vXmsI7WeQtrIOkjR6xTRVN5uOieiE";
const KV_TOKEN_KEY = "ghl_firebase_id_token";
const KV_TOKEN_TTL = 3300; // 55 minutes (Firebase tokens last 60, refresh early)

export interface WorkflowBuilderConfig {
  firebaseToken: string;
  locationId: string;
  kv?: KVNamespace;
  refreshToken?: string; // Firebase refresh token (never expires)
}

/**
 * Refresh a Firebase ID token using the securetoken REST API.
 * Firebase refresh tokens do not expire -- they persist until revoked.
 * Returns a fresh ID token (usable as token-id header value).
 */
async function refreshFirebaseToken(refreshToken: string): Promise<{ idToken: string; refreshToken: string }> {
  const resp = await fetch(
    `https://securetoken.googleapis.com/v1/token?key=${FIREBASE_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `grant_type=refresh_token&refresh_token=${encodeURIComponent(refreshToken)}`,
    }
  );
  if (!resp.ok) {
    const err = await resp.text();
    throw new Error(`Firebase token refresh failed (${resp.status}): ${err}`);
  }
  const data = await resp.json() as { id_token: string; refresh_token: string; expires_in: string };
  return { idToken: data.id_token, refreshToken: data.refresh_token };
}

/**
 * Get a valid token for the token-id header, using KV cache or refreshing as needed.
 */
async function getValidToken(config: WorkflowBuilderConfig): Promise<string> {
  if (config.kv && config.refreshToken) {
    const cached = await config.kv.get(KV_TOKEN_KEY);
    if (cached) return cached;

    const { idToken } = await refreshFirebaseToken(config.refreshToken);
    await config.kv.put(KV_TOKEN_KEY, idToken, { expirationTtl: KV_TOKEN_TTL });
    return idToken;
  }

  return config.firebaseToken;
}

async function internalRequest<T>(
  config: WorkflowBuilderConfig,
  method: string,
  path: string,
  body?: unknown
): Promise<T> {
  const token = await getValidToken(config);

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    channel: "APP",
    "token-id": token,
  };

  const resp = await fetch(`${INTERNAL_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  // If 401/403 and we have refresh capability, force-refresh and retry once
  if ((resp.status === 401 || resp.status === 403) && config.kv && config.refreshToken) {
    const { idToken } = await refreshFirebaseToken(config.refreshToken);
    await config.kv.put(KV_TOKEN_KEY, idToken, { expirationTtl: KV_TOKEN_TTL });
    headers["token-id"] = idToken;

    const retry = await fetch(`${INTERNAL_BASE}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!retry.ok) {
      const errorText = await retry.text();
      throw new Error(`GHL Internal API ${retry.status}: ${errorText}`);
    }
    const text = await retry.text();
    if (!text) return {} as T;
    return JSON.parse(text) as T;
  }

  if (!resp.ok) {
    const errorText = await resp.text();
    throw new Error(`GHL Internal API ${resp.status}: ${errorText}`);
  }

  const text = await resp.text();
  if (!text) return {} as T;
  return JSON.parse(text) as T;
}

export function workflowBuilderMethods(config: WorkflowBuilderConfig) {
  const loc = config.locationId;

  return {
    // ===== WORKFLOW CRUD =====

    async listWorkflows(opts?: {
      parentId?: string;
      type?: string;
      limit?: number;
      offset?: number;
      sortBy?: string;
      sortOrder?: string;
    }) {
      const params = new URLSearchParams();
      params.set("parentId", opts?.parentId || "root");
      params.set("limit", String(opts?.limit || 50));
      params.set("offset", String(opts?.offset || 0));
      params.set("sortBy", opts?.sortBy || "name");
      params.set("sortOrder", opts?.sortOrder || "asc");
      if (opts?.type) params.set("type", opts.type);
      params.set("includeCustomObjects", "true");
      params.set("includeObjectiveBuilder", "true");
      return internalRequest<{ rows: any[]; total?: number }>(
        config,
        "GET",
        `/workflow/${loc}/list?${params}`
      );
    },

    async createWorkflow(name: string, parentId?: string) {
      const body: Record<string, unknown> = { name };
      if (parentId) body.parentId = parentId;
      return internalRequest<{ id: string }>(
        config,
        "POST",
        `/workflow/${loc}`,
        body
      );
    },

    async getWorkflow(workflowId: string) {
      return internalRequest<any>(
        config,
        "GET",
        `/workflow/${loc}/${workflowId}`
      );
    },

    async updateWorkflow(
      workflowId: string,
      data: {
        version: number;
        name?: string;
        workflowData?: { templates: any[] };
        [key: string]: any;
      }
    ) {
      // GHL's PUT replaces the entire document. Fetch current state and merge
      // to avoid accidentally wiping name, workflowData, or other fields.
      const current = await internalRequest<any>(
        config,
        "GET",
        `/workflow/${loc}/${workflowId}`
      );
      const merged = {
        name: current.name,
        workflowData: current.workflowData,
        allowMultiple: current.allowMultiple,
        stopOnResponse: current.stopOnResponse,
        autoMarkAsRead: current.autoMarkAsRead,
        removeContactFromLastStep: current.removeContactFromLastStep,
        timezone: current.timezone,
        ...data,
      };
      return internalRequest<any>(
        config,
        "PUT",
        `/workflow/${loc}/${workflowId}`,
        merged
      );
    },

    async deleteWorkflow(workflowId: string) {
      return internalRequest<{ success: boolean }>(
        config,
        "DELETE",
        `/workflow/${loc}/${workflowId}`
      );
    },

    async changeWorkflowStatus(
      workflowId: string,
      status: "published" | "draft",
      updatedBy: string
    ) {
      return internalRequest<any>(
        config,
        "PUT",
        `/workflow/${loc}/change-status/${workflowId}`,
        { status, updatedBy }
      );
    },

    // ===== WORKFLOW DATA (Firebase Storage) =====

    async getWorkflowData(workflowId: string): Promise<{ templates: any[] }> {
      const wf = await this.getWorkflow(workflowId);
      if (!wf.fileUrl) return { templates: [] };
      const resp = await fetch(wf.fileUrl);
      if (!resp.ok) return { templates: [] };
      return resp.json();
    },

    async getWorkflowTriggers(workflowId: string): Promise<any[]> {
      const wf = await this.getWorkflow(workflowId);
      if (!wf.triggersFilePath) return [];
      const encodedPath = encodeURIComponent(wf.triggersFilePath);
      const url = `https://firebasestorage.googleapis.com/v0/b/highlevel-backend.appspot.com/o/${encodedPath}?alt=media`;
      try {
        const resp = await fetch(url);
        if (!resp.ok) return [];
        return resp.json();
      } catch {
        return [];
      }
    },

    // ===== TRIGGER CRUD =====

    async createTrigger(data: {
      type: string;
      name: string;
      active: boolean;
      workflowId: string;
      conditions?: any[];
      actions?: any[];
      [key: string]: any;
    }) {
      return internalRequest<{ id: string }>(
        config,
        "POST",
        `/workflow/${loc}/trigger`,
        { masterType: "highlevel", belongs_to: "workflow", location_id: loc, ...data }
      );
    },

    async updateTrigger(triggerId: string, data: any) {
      return internalRequest<any>(
        config,
        "PUT",
        `/workflow/${loc}/trigger/${triggerId}`,
        data
      );
    },

    async deleteTrigger(triggerId: string) {
      return internalRequest<string>(
        config,
        "DELETE",
        `/workflow/${loc}/trigger/${triggerId}`
      );
    },

    // ===== AUTO-SAVE (Advanced Canvas sync) =====

    async autoSaveWorkflow(
      workflowId: string,
      data: {
        templates: any[];
        triggers?: any[];
        userId?: string;
      }
    ) {
      // GET current workflow to build the full auto-save payload
      const current = await this.getWorkflow(workflowId);

      const now = new Date().toISOString();

      // Enable advanced canvas
      const meta = current.meta || {};
      meta.advanceCanvasMeta = {
        enabled: true,
        enabledAt: meta.advanceCanvasMeta?.enabledAt || now,
      };

      // Add advanceCanvasMeta positions to steps
      const stepsWithMeta = (data.templates || []).map((step: any, idx: number) => ({
        ...step,
        cat: step.cat ?? "",
        order: step.order ?? idx,
        advanceCanvasMeta: step.advanceCanvasMeta || {
          position: { x: 400 + idx * 300, y: 0 },
        },
      }));

      // Format triggers for auto-save
      const triggerList = (data.triggers || []).map((t: any) => ({
        ...t,
        workflow_id: t.workflow_id || workflowId,
        location_id: t.location_id || loc,
        belongs_to: t.belongs_to || "workflow",
        deleted: false,
        date_added: t.date_added || now,
        date_updated: now,
        advanceCanvasMeta: t.advanceCanvasMeta || {
          position: { x: 57.5, y: -73 },
        },
      }));

      const body = {
        ...current,
        status: current.status || "draft",
        meta,
        workflowData: { templates: stepsWithMeta },
        triggersChanged: triggerList.length > 0,
        oldTriggers: triggerList,
        newTriggers: triggerList,
        isAutoSave: true,
        autoSaveSession: {
          workflowId,
          id: crypto.randomUUID(),
          userId: data.userId || "",
          version: current.version || 1,
          inProgress: true,
        },
        scheduledPauseDates: [],
        modifiedSteps: [],
        deletedSteps: [],
        createdSteps: [],
        senderAddress: current.senderAddress || {},
        eventStartDate: current.eventStartDate || "",
      };

      return internalRequest<any>(
        config,
        "PUT",
        `/workflow/${loc}/${workflowId}/auto-save`,
        body
      );
    },

    // ===== TAG CREATION =====

    async createLocationTag(tag: string) {
      return internalRequest<any>(
        config,
        "POST",
        `/workflow/${loc}/tags/create`,
        { tag }
      );
    },

    // ===== FOLDER MANAGEMENT =====

    async createFolder(name: string, parentId?: string) {
      return internalRequest<{ id: string }>(
        config,
        "POST",
        `/workflow/${loc}`,
        { name, type: "directory", parentId: parentId || null }
      );
    },

    // ===== UTILITY =====

    async getErrorCount() {
      return internalRequest<number>(
        config,
        "GET",
        `/workflow/${loc}/error-notification/count`
      );
    },

    async getWorkflowAISettings() {
      return internalRequest<any>(
        config,
        "GET",
        `/workflow/${loc}/workflow-ai/settings`
      );
    },
  };
}
