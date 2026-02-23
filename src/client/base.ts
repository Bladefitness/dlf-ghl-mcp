/**
 * Base GHL API Client — Core HTTP request infrastructure
 */

import { CONFIG } from "../config";
import { GHLError } from "../utils/errors";
import type { GHLClientConfig, ApiVersion } from "../types";

export class BaseGHLClient {
  protected baseUrl = CONFIG.API.BASE_URL;
  public apiKey: string;
  public locationId: string;

  constructor(config: GHLClientConfig) {
    this.apiKey = config.apiKey;
    this.locationId = config.locationId;
  }

  protected headers(version?: string): Record<string, string> {
    const h: Record<string, string> = {
      Authorization: `Bearer ${this.apiKey}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    };
    if (version) h["Version"] = version;
    return h;
  }

  async request<T>(
    method: string,
    path: string,
    options?: {
      body?: unknown;
      query?: Record<string, string>;
      version?: string;
    }
  ): Promise<T> {
    const url = new URL(`${this.baseUrl}${path}`);
    if (options?.query) {
      Object.entries(options.query).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== "") {
          url.searchParams.set(k, v);
        }
      });
    }
    const resp = await fetch(url.toString(), {
      method,
      headers: this.headers(options?.version),
      body: options?.body ? JSON.stringify(options.body) : undefined,
    });
    if (!resp.ok) {
      const errorText = await resp.text();
      throw new GHLError(
        `GHL API Error ${resp.status}: ${resp.statusText}`,
        resp.status,
        errorText
      );
    }
    return resp.json() as Promise<T>;
  }

  get defaultLocationId() {
    return this.locationId;
  }
}
