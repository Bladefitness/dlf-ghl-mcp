/**
 * GHL Internal Site Builder Client
 * Uses backend.leadconnectorhq.com (undocumented internal API)
 * Auth: Firebase JWT via BOTH token-id header AND Authorization: Bearer
 *
 * Critical auth difference from workflow-builder:
 *   The autosave endpoint requires all four headers:
 *     token-id: {firebase-jwt}
 *     Authorization: Bearer {firebase-jwt}
 *     channel: APP
 *     source: WEB_USER
 *   Both token-id AND Authorization must be the same token value.
 *
 * Token cache: shares the same KV keys as workflow-builder so a single
 * refreshed token serves both modules without double-refreshing.
 */

const INTERNAL_BASE = "https://backend.leadconnectorhq.com";
const KV_TOKEN_KEY = "ghl_firebase_id_token"; // shared with workflow-builder
const KV_REFRESH_KEY = "ghl_refresh_token";
const KV_TOKEN_TTL = 3300; // 55 minutes (tokens last 60, refresh early)

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export interface SiteBuilderConfig {
  firebaseToken: string;
  locationId: string;
  kv?: KVNamespace;
  refreshToken?: string;
}

export interface SavePagePayload {
  funnelId: string;
  pageData: {
    sections: any[];
    settings?: Record<string, any>;
    general?: {
      colors: any[];
      fontsForPreview: string[];
      rootVars: Record<string, string>;
    };
    pageStyles?: Record<string, any>;
    trackingCode?: Record<string, any>;
    fontsForPreview?: string[];
    popups?: any[];
    popupsList?: any[];
  };
  pageVersion: number;
  pageType?: string;
  manualSave?: boolean;
  integrations?: Record<string, any>;
}

export interface CreateStepInput {
  id: string;
  name: string;
  url?: string;
  pages?: any[];
  type?: string;
  split?: boolean;
  control_traffic?: number;
}

// ---------------------------------------------------------------------------
// Auth utilities
// Duplicated from workflow-builder.ts — cannot modify that file.
// Logic is identical; only internalRequest headers differ (see below).
// ---------------------------------------------------------------------------

/**
 * Refresh a GHL session token using GHL's /auth/refresh endpoint.
 * Returns a fresh JWT and a new refresh token.
 * The refresh token rotates on each use — always store the new one.
 */
async function refreshGHLToken(
  refreshToken: string
): Promise<{ jwt: string; refreshJwt: string }> {
  const resp = await fetch(`${INTERNAL_BASE}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json", channel: "APP" },
    body: JSON.stringify({ refreshToken }),
  });
  if (!resp.ok) {
    const err = await resp.text();
    throw new Error(`GHL token refresh failed (${resp.status}): ${err}`);
  }
  const data = (await resp.json()) as { jwt: string; refreshJwt: string };
  return { jwt: data.jwt, refreshJwt: data.refreshJwt };
}

/**
 * Get a valid token for the auth headers, using KV cache or refreshing as needed.
 */
async function getValidToken(config: SiteBuilderConfig): Promise<string> {
  if (config.kv && config.refreshToken) {
    const cached = await config.kv.get(KV_TOKEN_KEY);
    if (cached) return cached;

    // Cache miss or expired — get latest refresh token (may have been rotated)
    const currentRefresh =
      (await config.kv.get(KV_REFRESH_KEY)) || config.refreshToken;

    const { jwt, refreshJwt } = await refreshGHLToken(currentRefresh);

    await config.kv.put(KV_TOKEN_KEY, jwt, { expirationTtl: KV_TOKEN_TTL });
    await config.kv.put(KV_REFRESH_KEY, refreshJwt);
    return jwt;
  }

  // Fallback: use static token from config (may be expired)
  return config.firebaseToken;
}

/**
 * Make an authenticated request to the GHL internal API.
 *
 * Site builder endpoints require all four headers:
 *   token-id, Authorization: Bearer (same value), channel: APP, source: WEB_USER
 *
 * On 401/403, force-refreshes the token once and retries.
 */
async function internalRequest<T>(
  config: SiteBuilderConfig,
  method: string,
  path: string,
  body?: unknown
): Promise<T> {
  const token = await getValidToken(config);

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    channel: "APP",
    source: "WEB_USER",
    "token-id": token,
    Authorization: `Bearer ${token}`,
  };

  const resp = await fetch(`${INTERNAL_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  // On auth failure, force-refresh and retry once
  if (
    (resp.status === 401 || resp.status === 403) &&
    config.kv &&
    config.refreshToken
  ) {
    const currentRefresh =
      (await config.kv.get(KV_REFRESH_KEY)) || config.refreshToken;
    const { jwt, refreshJwt } = await refreshGHLToken(currentRefresh);
    await config.kv.put(KV_TOKEN_KEY, jwt, { expirationTtl: KV_TOKEN_TTL });
    await config.kv.put(KV_REFRESH_KEY, refreshJwt);
    headers["token-id"] = jwt;
    headers["Authorization"] = `Bearer ${jwt}`;

    const retry = await fetch(`${INTERNAL_BASE}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!retry.ok) {
      const errorText = await retry.text();
      throw new Error(`GHL Internal API ${retry.status}: ${errorText}`);
    }
    const retryText = await retry.text();
    if (!retryText) return {} as T;
    return JSON.parse(retryText) as T;
  }

  if (!resp.ok) {
    const errorText = await resp.text();
    throw new Error(`GHL Internal API ${resp.status}: ${errorText}`);
  }

  const text = await resp.text();
  if (!text) return {} as T;
  return JSON.parse(text) as T;
}

// ---------------------------------------------------------------------------
// Private structural helpers for column child[] manipulation
// All helpers are immutable — they return new objects, never mutate in place.
// ---------------------------------------------------------------------------

/**
 * Walk the section metaData tree (section → rows → columns) and append
 * `elementId` to the matching column's child[] array.
 *
 * GHL's builder stores the tree in metaData as nested objects:
 *   section.metaData.child → row[] → each row.child → col[]
 *   each col.child → element ID strings
 *
 * If `columnId` is provided, only that column receives the element.
 * Otherwise the first column in the first row is used.
 *
 * Returns a new metaData object — the original is not mutated.
 */
function addElementIdToColumn(
  metaData: any,
  elementId: string,
  columnId?: string
): any {
  if (!metaData || !Array.isArray(metaData.child) || metaData.child.length === 0) {
    return metaData;
  }

  let inserted = false;

  const updatedRows = metaData.child.map((row: any) => {
    if (typeof row !== "object" || row === null || row.type !== "row") {
      return row;
    }
    if (!Array.isArray(row.child)) return row;

    const updatedColumns = row.child.map((col: any) => {
      if (typeof col !== "object" || col === null || col.type !== "col") {
        return col;
      }
      // Skip if a specific columnId was requested and this isn't it
      if (columnId && col.id !== columnId) return col;
      // Skip if we already inserted (first-match-only when no columnId given)
      if (!columnId && inserted) return col;

      const already = Array.isArray(col.child) && col.child.includes(elementId);
      if (already) return col;

      inserted = true;
      return { ...col, child: [...(col.child ?? []), elementId] };
    });

    return { ...row, child: updatedColumns };
  });

  return { ...metaData, child: updatedRows };
}

/**
 * Walk the section metaData tree and remove `elementId` from every column's
 * child[] array.
 *
 * Returns a new metaData object — the original is not mutated.
 */
function removeElementIdFromColumns(
  metaData: any,
  elementId: string
): any {
  if (!metaData || !Array.isArray(metaData.child) || metaData.child.length === 0) {
    return metaData;
  }

  const updatedRows = metaData.child.map((row: any) => {
    if (typeof row !== "object" || row === null || row.type !== "row") {
      return row;
    }
    if (!Array.isArray(row.child)) return row;

    const updatedColumns = row.child.map((col: any) => {
      if (typeof col !== "object" || col === null || col.type !== "col") {
        return col;
      }
      if (!Array.isArray(col.child)) return col;
      return {
        ...col,
        child: col.child.filter((id: string) => id !== elementId),
      };
    });

    return { ...row, child: updatedColumns };
  });

  return { ...metaData, child: updatedRows };
}

// ---------------------------------------------------------------------------
// Public factory
// ---------------------------------------------------------------------------

export function siteBuilderMethods(config: SiteBuilderConfig) {
  const loc = config.locationId;

  /**
   * Fetches both page content (sections) and page metadata (pageVersion) in
   * parallel, then merges them into the shape needed for read-modify-write helpers.
   */
  async function fetchCurrentPage(pageId: string): Promise<{
    funnelId: string;
    pageVersion: number;
    pageData: SavePagePayload["pageData"];
  }> {
    const [content, meta] = await Promise.all([
      internalRequest<{
        sections?: any[];
        funnelId?: string;
        popups?: any[];
        general?: any;
        pageStyles?: any;
        trackingCode?: any;
        fontsForPreview?: string[];
        [key: string]: any;
      }>(config, "GET", `/funnels/builder/page/data?pageId=${pageId}`),
      internalRequest<{
        pageVersion?: number;
        funnelId?: string;
        [key: string]: any;
      }>(config, "GET", `/funnels/page/${pageId}`),
    ]);

    return {
      funnelId: content.funnelId ?? meta.funnelId ?? "",
      pageVersion: meta.pageVersion ?? 1,
      pageData: {
        sections: content.sections ?? [],
        popups: content.popups ?? [],
        general: content.general,
        pageStyles: content.pageStyles,
        trackingCode: content.trackingCode,
        fontsForPreview: content.fontsForPreview,
      },
    };
  }

  return {
    // ================================================================
    // READ
    // ================================================================

    /**
     * GET /funnels/builder/page/data?pageId={id}
     * Returns the full page sections data (the builder content: sections, popups, etc.).
     */
    async getPageContent(pageId: string): Promise<any> {
      return internalRequest<any>(
        config,
        "GET",
        `/funnels/builder/page/data?pageId=${pageId}`
      );
    },

    /**
     * GET /funnels/page/{pageId}
     * Returns page metadata: name, url, pageVersion, stepId, funnelId, templateType, etc.
     */
    async getPageMetadata(pageId: string): Promise<any> {
      return internalRequest<any>(config, "GET", `/funnels/page/${pageId}`);
    },

    /**
     * GET /funnels/funnel/fetch/{funnelId}
     * Returns the full funnel object including all steps and pages.
     */
    async getFunnel(funnelId: string): Promise<any> {
      return internalRequest<any>(
        config,
        "GET",
        `/funnels/funnel/fetch/${funnelId}`
      );
    },

    /**
     * GET /funnels/funnel/folder/entities?locationId={loc}&type={type}
     * Lists all funnels or websites for the location.
     *
     * @param type - "funnel" | "website" (default: "funnel")
     */
    async listFunnels(type = "funnel"): Promise<{ data: any[] }> {
      const params = new URLSearchParams({
        locationId: loc,
        type,
      });
      return internalRequest<{ data: any[] }>(
        config,
        "GET",
        `/funnels/funnel/folder/entities?${params}`
      );
    },

    /**
     * GET /funnels/builder/section-template
     * Lists section templates available for the builder (user-saved templates).
     */
    async listSectionTemplates(limit = 20, offset = 0): Promise<any> {
      const params = new URLSearchParams({
        locationId: loc,
        limit: String(limit),
        offset: String(offset),
      });
      return internalRequest<any>(
        config,
        "GET",
        `/funnels/builder/section-template?${params}`
      );
    },

    /**
     * GET /funnels/builder/prebuilt-section
     * Lists prebuilt/starter sections available to drop into the builder.
     */
    async listPrebuiltSections(): Promise<any> {
      return internalRequest<any>(
        config,
        "GET",
        `/funnels/builder/prebuilt-section?locationId=${loc}`
      );
    },

    // ================================================================
    // WRITE
    // ================================================================

    /**
     * POST /funnels/builder/autosave/{pageId}
     * Saves page content.
     *
     * Requires both token-id and Authorization: Bearer headers set to the same
     * token value, plus source: WEB_USER (handled by internalRequest).
     *
     * Defaults: pageType "optin_funnel_page", manualSave true, integrations {}.
     */
    async savePage(pageId: string, payload: SavePagePayload): Promise<any> {
      const body: SavePagePayload = {
        pageType: "optin_funnel_page",
        manualSave: true,
        integrations: {},
        ...payload,
      };
      return internalRequest<any>(
        config,
        "POST",
        `/funnels/builder/autosave/${pageId}`,
        body
      );
    },

    /**
     * POST /funnels/funnel/create
     * Creates a new funnel or website in the location.
     *
     * @param type - "funnel" | "website" (default: "funnel")
     */
    async createFunnel(
      name: string,
      type = "funnel"
    ): Promise<{ ok: boolean; id: string; name: string; locationId: string; type: string }> {
      return internalRequest<{
        ok: boolean;
        id: string;
        name: string;
        locationId: string;
        type: string;
      }>(config, "POST", `/funnels/funnel/create`, {
        locationId: loc,
        name,
        type,
      });
    },

    /**
     * POST /funnels/funnel/create-step
     * Adds a new step (with a blank page) to an existing funnel.
     * The step.id must be a UUID v4 — caller is responsible for generating it.
     */
    async createStep(
      funnelId: string,
      step: CreateStepInput
    ): Promise<{ page: any }> {
      const stepBody: CreateStepInput = {
        url: "",
        pages: [],
        type: "optin_funnel_page",
        split: false,
        control_traffic: 100,
        ...step,
      };
      return internalRequest<{ page: any }>(
        config,
        "POST",
        `/funnels/funnel/create-step`,
        { step: stepBody, funnelId }
      );
    },

    /**
     * POST /funnels/builder/global-sections/{funnelId}
     * Saves global sections for the funnel at the given version.
     */
    async saveGlobalSections(
      funnelId: string,
      version: number,
      sectionData: any[]
    ): Promise<any> {
      return internalRequest<any>(
        config,
        "POST",
        `/funnels/builder/global-sections/${funnelId}`,
        { version, sectionData }
      );
    },

    // ================================================================
    // READ-MODIFY-WRITE HELPERS
    // Each helper:
    //   1. GETs current page content + metadata in parallel
    //   2. Applies the change immutably (new objects, no mutation)
    //   3. Increments pageVersion
    //   4. POSTs via savePage
    // ================================================================

    /**
     * Inserts a section into the page at `position` (appends if omitted).
     */
    async addSectionToPage(
      pageId: string,
      section: any,
      position?: number
    ): Promise<any> {
      const { funnelId, pageVersion, pageData } =
        await fetchCurrentPage(pageId);

      const current = pageData.sections ?? [];
      const insertAt =
        position !== undefined &&
        position >= 0 &&
        position <= current.length
          ? position
          : current.length;

      const updatedSections = [
        ...current.slice(0, insertAt),
        section,
        ...current.slice(insertAt),
      ];

      return this.savePage(pageId, {
        funnelId,
        pageVersion: pageVersion + 1,
        pageData: { ...pageData, sections: updatedSections },
      });
    },

    /**
     * Removes the section with `sectionId` from the page.
     */
    async removeSectionFromPage(
      pageId: string,
      sectionId: string
    ): Promise<any> {
      const { funnelId, pageVersion, pageData } =
        await fetchCurrentPage(pageId);

      const updatedSections = (pageData.sections ?? []).filter(
        (s: any) => s.id !== sectionId
      );

      return this.savePage(pageId, {
        funnelId,
        pageVersion: pageVersion + 1,
        pageData: { ...pageData, sections: updatedSections },
      });
    },

    /**
     * Adds an element to the target section.
     *
     * Structure per captured autosave payload:
     *   - section.elements[] is a flat array of all element objects
     *   - section.metaData contains the nested tree (section → row → col)
     *   - each col.child[] holds element ID strings
     *
     * This method:
     *   1. Appends the element to section.elements[]
     *   2. Appends element.id to the target column's child[] in metaData
     *      (first column of first row if columnId is not specified)
     */
    async addElementToSection(
      pageId: string,
      sectionId: string,
      element: any,
      columnId?: string
    ): Promise<any> {
      const { funnelId, pageVersion, pageData } =
        await fetchCurrentPage(pageId);

      const updatedSections = (pageData.sections ?? []).map((section: any) => {
        if (section.id !== sectionId) return section;

        const updatedElements = [...(section.elements ?? []), element];
        const updatedMetaData = addElementIdToColumn(
          section.metaData,
          element.id,
          columnId
        );

        return { ...section, elements: updatedElements, metaData: updatedMetaData };
      });

      return this.savePage(pageId, {
        funnelId,
        pageVersion: pageVersion + 1,
        pageData: { ...pageData, sections: updatedSections },
      });
    },

    /**
     * Merges `updates` into the element matching `elementId` across all sections.
     * Throws if the element is not found.
     */
    async updateElement(
      pageId: string,
      elementId: string,
      updates: Record<string, any>
    ): Promise<any> {
      const { funnelId, pageVersion, pageData } =
        await fetchCurrentPage(pageId);

      let found = false;

      const updatedSections = (pageData.sections ?? []).map((section: any) => {
        const updatedElements = (section.elements ?? []).map((el: any) => {
          if (el.id !== elementId) return el;
          found = true;
          return { ...el, ...updates };
        });
        return { ...section, elements: updatedElements };
      });

      if (!found) {
        throw new Error(
          `Element "${elementId}" not found on page "${pageId}"`
        );
      }

      return this.savePage(pageId, {
        funnelId,
        pageVersion: pageVersion + 1,
        pageData: { ...pageData, sections: updatedSections },
      });
    },

    /**
     * Removes an element from the page.
     * - Removes the element object from section.elements[]
     * - Removes the element ID from its parent column's child[] in metaData
     * Throws if the element is not found.
     */
    async removeElement(pageId: string, elementId: string): Promise<any> {
      const { funnelId, pageVersion, pageData } =
        await fetchCurrentPage(pageId);

      let found = false;

      const updatedSections = (pageData.sections ?? []).map((section: any) => {
        const hadElement = (section.elements ?? []).some(
          (el: any) => el.id === elementId
        );
        if (!hadElement) return section;

        found = true;
        const updatedElements = (section.elements ?? []).filter(
          (el: any) => el.id !== elementId
        );
        const updatedMetaData = removeElementIdFromColumns(
          section.metaData,
          elementId
        );

        return {
          ...section,
          elements: updatedElements,
          metaData: updatedMetaData,
        };
      });

      if (!found) {
        throw new Error(
          `Element "${elementId}" not found on page "${pageId}"`
        );
      }

      return this.savePage(pageId, {
        funnelId,
        pageVersion: pageVersion + 1,
        pageData: { ...pageData, sections: updatedSections },
      });
    },
  };
}
