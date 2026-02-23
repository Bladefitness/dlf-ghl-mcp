import { BaseGHLClient } from "./base";

export function locationMethods(client: BaseGHLClient) {
  return {
    async getLocation(locationId?: string) {
      const locId = locationId || client.locationId;
      return client.request<{ location: any }>("GET", `/locations/${locId}`, {
        version: "2021-07-28",
      });
    },

    async updateLocation(locationId: string, data: any) {
      return client.request<{ location: any }>("PUT", `/locations/${locationId}`, {
        body: data,
        version: "2021-07-28",
      });
    },

    async searchLocations(companyId: string, opts?: { limit?: string; skip?: string; order?: string; search?: string }) {
      const q: Record<string, string> = { companyId };
      if (opts?.limit) q.limit = opts.limit;
      if (opts?.skip) q.skip = opts.skip;
      if (opts?.order) q.order = opts.order;
      if (opts?.search) q.search = opts.search;
      return client.request<{ locations: any[]; count?: number }>("GET", `/locations/search`, {
        query: q,
        version: "2021-07-28",
      });
    },

    async listLocationTags(locationId?: string) {
      const locId = locationId || client.locationId;
      return client.request<{ tags: any[] }>("GET", `/locations/${locId}/tags`, {
        version: "2021-07-28",
      });
    },

    async createTag(name: string, locationId?: string) {
      const locId = locationId || client.locationId;
      return client.request<{ tag: any }>("POST", `/locations/${locId}/tags`, {
        body: { name },
        version: "2021-07-28",
      });
    },

    async updateTag(tagId: string, name: string, locationId?: string) {
      const locId = locationId || client.locationId;
      return client.request<{ tag: any }>("PUT", `/locations/${locId}/tags/${tagId}`, {
        body: { name },
        version: "2021-07-28",
      });
    },

    async deleteTag(tagId: string, locationId?: string) {
      const locId = locationId || client.locationId;
      return client.request<any>("DELETE", `/locations/${locId}/tags/${tagId}`, {
        version: "2021-07-28",
      });
    },

    async getLocationCustomFields(locationId?: string) {
      const locId = locationId || client.locationId;
      return client.request<{ customFields: any[] }>("GET", `/locations/${locId}/customFields`, {
        version: "2021-07-28",
      });
    },

    async createLocationCustomField(data: any, locationId?: string) {
      const locId = locationId || client.locationId;
      return client.request<{ customField: any }>("POST", `/locations/${locId}/customFields`, {
        body: data,
        version: "2021-07-28",
      });
    },

    async updateLocationCustomField(fieldId: string, data: any, locationId?: string) {
      const locId = locationId || client.locationId;
      return client.request<{ customField: any }>("PUT", `/locations/${locId}/customFields/${fieldId}`, {
        body: data,
        version: "2021-07-28",
      });
    },

    async deleteLocationCustomField(fieldId: string, locationId?: string) {
      const locId = locationId || client.locationId;
      return client.request<any>("DELETE", `/locations/${locId}/customFields/${fieldId}`, {
        version: "2021-07-28",
      });
    },

    async listCustomFieldsV2(objectKey: string, locationId?: string) {
      return client.request<{ fields: any[]; folders: any[] }>("GET", `/custom-fields/object-key/${objectKey}`, {
        query: { locationId: locationId || client.locationId },
        version: "2021-07-28",
      });
    },

    async getCustomField(id: string) {
      return client.request<{ field: any }>("GET", `/custom-fields/${id}`, {
        version: "2021-07-28",
      });
    },

    async createCustomField(data: any) {
      return client.request<{ field: any }>("POST", `/custom-fields/`, {
        body: { ...data, locationId: data.locationId || client.locationId },
        version: "2021-07-28",
      });
    },

    async updateCustomField(id: string, data: any) {
      return client.request<{ field: any }>("PUT", `/custom-fields/${id}`, {
        body: { ...data, locationId: data.locationId || client.locationId },
        version: "2021-07-28",
      });
    },

    async deleteCustomField(id: string) {
      return client.request<any>("DELETE", `/custom-fields/${id}`, {
        version: "2021-07-28",
      });
    },

    async listCustomValues(locationId?: string) {
      const locId = locationId || client.locationId;
      return client.request<{ customValues: any[] }>("GET", `/locations/${locId}/customValues`, {
        version: "2021-07-28",
      });
    },

    async getCustomValue(valueId: string, locationId?: string) {
      const locId = locationId || client.locationId;
      return client.request<{ customValue: any }>("GET", `/locations/${locId}/customValues/${valueId}`, {
        version: "2021-07-28",
      });
    },

    async createCustomValue(data: { name: string; value: string }, locationId?: string) {
      const locId = locationId || client.locationId;
      return client.request<{ customValue: any }>("POST", `/locations/${locId}/customValues`, {
        body: data,
        version: "2021-07-28",
      });
    },

    async updateCustomValue(valueId: string, data: { name?: string; value?: string }, locationId?: string) {
      const locId = locationId || client.locationId;
      return client.request<{ customValue: any }>("PUT", `/locations/${locId}/customValues/${valueId}`, {
        body: data,
        version: "2021-07-28",
      });
    },

    async deleteCustomValue(valueId: string, locationId?: string) {
      const locId = locationId || client.locationId;
      return client.request<any>("DELETE", `/locations/${locId}/customValues/${valueId}`, {
        version: "2021-07-28",
      });
    },

    async getBusinessProfile(businessId: string) {
      return client.request<{ business: any }>("GET", `/businesses/${businessId}`, {
        version: "2021-07-28",
      });
    },

    async updateBusinessProfile(businessId: string, data: any) {
      return client.request<{ business: any }>("PUT", `/businesses/${businessId}`, {
        body: data,
        version: "2021-07-28",
      });
    },

    async listBusinesses(locationId?: string) {
      return client.request<{ businesses: any[] }>("GET", `/businesses/`, {
        query: { locationId: locationId || client.locationId },
        version: "2021-07-28",
      });
    },

    async listUsers(locationId?: string) {
      return client.request<{ users: any[] }>("GET", `/users/`, {
        query: { locationId: locationId || client.locationId },
        version: "2021-07-28",
      });
    },

    async getUser(userId: string) {
      return client.request<any>("GET", `/users/${userId}`, {
        version: "2021-07-28",
      });
    },

    async createUser(data: any) {
      return client.request<any>("POST", `/users/`, {
        body: { ...data, companyId: data.companyId || client.apiKey },
        version: "2021-07-28",
      });
    },

    async updateUser(userId: string, data: any) {
      return client.request<any>("PUT", `/users/${userId}`, {
        body: data,
        version: "2021-07-28",
      });
    },

    async deleteUser(userId: string) {
      return client.request<any>("DELETE", `/users/${userId}`, {
        version: "2021-07-28",
      });
    },
  };
}
