import { BaseGHLClient } from "./base";

export function miscMethods(client: BaseGHLClient) {
  return {
    async listAssociations(locationId?: string, skip?: string, limit?: string) {
      const q: Record<string, string> = { locationId: locationId || client.locationId };
      if (skip) q.skip = skip;
      if (limit) q.limit = limit;
      return client.request<any>("GET", `/associations/`, {
        query: q,
        version: "2021-07-28",
      });
    },

    async getAssociation(associationId: string) {
      return client.request<any>("GET", `/associations/${associationId}`, {
        version: "2021-07-28",
      });
    },

    async getAssociationByKey(keyName: string, locationId?: string) {
      return client.request<any>("GET", `/associations/key/${keyName}`, {
        query: { locationId: locationId || client.locationId },
        version: "2021-07-28",
      });
    },

    async createAssociation(data: any) {
      return client.request<any>("POST", `/associations/`, {
        body: { ...data, locationId: data.locationId || client.locationId },
        version: "2021-07-28",
      });
    },

    async updateAssociation(associationId: string, data: any) {
      return client.request<any>("PUT", `/associations/${associationId}`, {
        body: data,
        version: "2021-07-28",
      });
    },

    async deleteAssociation(associationId: string) {
      return client.request<any>("DELETE", `/associations/${associationId}`, {
        version: "2021-07-28",
      });
    },

    async listCompanies(locationId?: string) {
      return client.request<{ companies: any[] }>("GET", `/companies/`, {
        query: { locationId: locationId || client.locationId },
        version: "2021-07-28",
      });
    },

    async getCompany(companyId: string) {
      return client.request<any>("GET", `/companies/${companyId}`, {
        version: "2021-07-28",
      });
    },

    async createCompany(data: any) {
      return client.request<any>("POST", `/companies/`, {
        body: { ...data, locationId: data.locationId || client.locationId },
        version: "2021-07-28",
      });
    },

    async updateCompany(companyId: string, data: any) {
      return client.request<any>("PUT", `/companies/${companyId}`, {
        body: data,
        version: "2021-07-28",
      });
    },

    async deleteCompany(companyId: string) {
      return client.request<any>("DELETE", `/companies/${companyId}`, {
        version: "2021-07-28",
      });
    },

    async listPhoneNumbers(locationId?: string) {
      const q: Record<string, string> = {};
      if (locationId) q.locationId = locationId;
      else q.locationId = client.locationId;
      return client.request<any>("GET", `/phone-system/numbers/location/${locationId || client.locationId}`, {
        query: q,
        version: "2021-07-28",
      });
    },

    async getPhoneNumber(phoneNumberId: string) {
      return client.request<any>("GET", `/phone-system/numbers/${phoneNumberId}`, {
        version: "2021-07-28",
      });
    },

    async purchasePhoneNumber(data: any) {
      return client.request<any>("POST", `/phone-system/numbers`, {
        body: data,
        version: "2021-07-28",
      });
    },

    async deletePhoneNumber(phoneNumberId: string) {
      return client.request<any>("DELETE", `/phone-system/numbers/${phoneNumberId}`, {
        version: "2021-07-28",
      });
    },

    async updatePhoneNumber(phoneNumberId: string, data: any) {
      return client.request<any>("PUT", `/phone-system/numbers/${phoneNumberId}`, {
        body: data,
        version: "2021-07-28",
      });
    },

    async listProducts(locationId?: string, opts?: { limit?: string; offset?: string; search?: string }) {
      const q: Record<string, string> = { locationId: locationId || client.locationId };
      if (opts?.limit) q.limit = opts.limit;
      if (opts?.offset) q.offset = opts.offset;
      if (opts?.search) q.search = opts.search;
      return client.request<{ products: any[]; total?: number }>("GET", `/products/`, {
        query: q,
        version: "2021-07-28",
      });
    },

    async getProduct(productId: string) {
      return client.request<{ product: any }>("GET", `/products/${productId}`, {
        version: "2021-07-28",
      });
    },

    async createProduct(data: any) {
      return client.request<{ product: any }>("POST", `/products/`, {
        body: { ...data, locationId: data.locationId || client.locationId },
        version: "2021-07-28",
      });
    },

    async updateProduct(productId: string, data: any) {
      return client.request<{ product: any }>("PUT", `/products/${productId}`, {
        body: data,
        version: "2021-07-28",
      });
    },

    async deleteProduct(productId: string) {
      return client.request<any>("DELETE", `/products/${productId}`, {
        version: "2021-07-28",
      });
    },

    async listProductPrices(productId: string, opts?: { limit?: string; offset?: string }) {
      const q: Record<string, string> = {};
      if (opts?.limit) q.limit = opts.limit;
      if (opts?.offset) q.offset = opts.offset;
      return client.request<{ prices: any[] }>("GET", `/products/${productId}/price`, {
        query: q,
        version: "2021-07-28",
      });
    },

    async getProductPrice(productId: string, priceId: string) {
      return client.request<any>("GET", `/products/${productId}/price/${priceId}`, {
        version: "2021-07-28",
      });
    },

    async createProductPrice(productId: string, data: any) {
      return client.request<any>("POST", `/products/${productId}/price`, {
        body: data,
        version: "2021-07-28",
      });
    },

    async updateProductPrice(productId: string, priceId: string, data: any) {
      return client.request<any>("PUT", `/products/${productId}/price/${priceId}`, {
        body: data,
        version: "2021-07-28",
      });
    },

    async deleteProductPrice(productId: string, priceId: string) {
      return client.request<any>("DELETE", `/products/${productId}/price/${priceId}`, {
        version: "2021-07-28",
      });
    },

    async listCustomObjects(locationId?: string) {
      return client.request<any>("GET", `/objects/`, {
        query: { locationId: locationId || client.locationId },
        version: "2021-07-28",
      });
    },

    async getCustomObject(key: string, locationId?: string, fetchProperties?: string) {
      const q: Record<string, string> = { locationId: locationId || client.locationId };
      if (fetchProperties) q.fetchProperties = fetchProperties;
      return client.request<any>("GET", `/objects/${key}`, {
        query: q,
        version: "2021-07-28",
      });
    },

    async createCustomObject(data: any) {
      return client.request<any>("POST", `/objects/`, {
        body: { ...data, locationId: data.locationId || client.locationId },
        version: "2021-07-28",
      });
    },

    async updateCustomObject(key: string, data: any) {
      return client.request<any>("PUT", `/objects/${key}`, {
        body: data,
        version: "2021-07-28",
      });
    },

    async deleteCustomObject(key: string) {
      return client.request<any>("DELETE", `/objects/${key}`, {
        version: "2021-07-28",
      });
    },

    async listCustomObjectRecords(schemaKey: string) {
      return client.request<any>("GET", `/objects/${schemaKey}/records`, {
        version: "2021-07-28",
      });
    },

    async getCustomObjectRecord(schemaKey: string, id: string) {
      return client.request<any>("GET", `/objects/${schemaKey}/records/${id}`, {
        version: "2021-07-28",
      });
    },

    async createCustomObjectRecord(schemaKey: string, data: any) {
      return client.request<any>("POST", `/objects/${schemaKey}/records`, {
        body: data,
        version: "2021-07-28",
      });
    },

    async updateCustomObjectRecord(schemaKey: string, id: string, locationId: string, data: any) {
      return client.request<any>("PUT", `/objects/${schemaKey}/records/${id}`, {
        query: { locationId },
        body: data,
        version: "2021-07-28",
      });
    },

    async deleteCustomObjectRecord(schemaKey: string, id: string) {
      return client.request<any>("DELETE", `/objects/${schemaKey}/records/${id}`, {
        version: "2021-07-28",
      });
    },
  };
}
