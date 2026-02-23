import { BaseGHLClient } from "./base";

export function paymentMethods(client: BaseGHLClient) {
  return {
    async listInvoices(opts: {
      locationId?: string;
      status?: string;
      limit?: string;
      offset?: string;
      contactId?: string;
      search?: string;
      startAt?: string;
      endAt?: string;
    }) {
      const q: Record<string, string> = {
        altId: opts.locationId || client.locationId,
        altType: "location",
      };
      if (opts.status) q.status = opts.status;
      if (opts.limit) q.limit = opts.limit;
      if (opts.offset) q.offset = opts.offset;
      if (opts.contactId) q.contactId = opts.contactId;
      if (opts.search) q.search = opts.search;
      if (opts.startAt) q.startAt = opts.startAt;
      if (opts.endAt) q.endAt = opts.endAt;
      return client.request<{ invoices: any[]; total?: number }>("GET", `/invoices/`, {
        query: q,
        version: "2021-07-28",
      });
    },

    async getInvoice(invoiceId: string, locationId?: string) {
      return client.request<{ invoice: any }>("GET", `/invoices/${invoiceId}`, {
        query: { altId: locationId || client.locationId, altType: "location" },
        version: "2021-07-28",
      });
    },

    async createInvoice(data: any) {
      return client.request<{ invoice: any }>("POST", `/invoices/`, {
        body: { ...data, altId: data.altId || client.locationId, altType: "location" },
        version: "2021-07-28",
      });
    },

    async updateInvoice(invoiceId: string, data: any) {
      return client.request<{ invoice: any }>("PUT", `/invoices/${invoiceId}`, {
        body: data,
        version: "2021-07-28",
      });
    },

    async deleteInvoice(invoiceId: string, locationId?: string) {
      return client.request<any>("DELETE", `/invoices/${invoiceId}`, {
        query: { altId: locationId || client.locationId, altType: "location" },
        version: "2021-07-28",
      });
    },

    async sendInvoice(invoiceId: string, locationId?: string) {
      return client.request<any>("POST", `/invoices/${invoiceId}/send`, {
        body: { altId: locationId || client.locationId, altType: "location" },
        version: "2021-07-28",
      });
    },

    async voidInvoice(invoiceId: string, locationId?: string) {
      return client.request<any>("POST", `/invoices/${invoiceId}/void`, {
        body: { altId: locationId || client.locationId, altType: "location" },
        version: "2021-07-28",
      });
    },

    async recordPayment(invoiceId: string, data: any) {
      return client.request<any>("POST", `/invoices/${invoiceId}/record-payment`, {
        body: data,
        version: "2021-07-28",
      });
    },

    async listOrders(opts: {
      locationId?: string;
      limit?: string;
      offset?: string;
      contactId?: string;
      search?: string;
      startAt?: string;
      endAt?: string;
    }) {
      const q: Record<string, string> = {
        altId: opts.locationId || client.locationId,
        altType: "location",
      };
      if (opts.limit) q.limit = opts.limit;
      if (opts.offset) q.offset = opts.offset;
      if (opts.contactId) q.contactId = opts.contactId;
      if (opts.search) q.search = opts.search;
      if (opts.startAt) q.startAt = opts.startAt;
      if (opts.endAt) q.endAt = opts.endAt;
      return client.request<{ data: any[]; totalCount?: number }>("GET", `/payments/orders`, {
        query: q,
        version: "2021-07-28",
      });
    },

    async getOrder(orderId: string, locationId?: string) {
      return client.request<any>("GET", `/payments/orders/${orderId}`, {
        query: { altId: locationId || client.locationId, altType: "location" },
        version: "2021-07-28",
      });
    },

    async listTransactions(opts: {
      locationId?: string;
      limit?: string;
      offset?: string;
      contactId?: string;
      startAt?: string;
      endAt?: string;
      search?: string;
      entitySourceType?: string;
      entitySourceId?: string;
    }) {
      const q: Record<string, string> = {
        altId: opts.locationId || client.locationId,
        altType: "location",
      };
      if (opts.limit) q.limit = opts.limit;
      if (opts.offset) q.offset = opts.offset;
      if (opts.contactId) q.contactId = opts.contactId;
      if (opts.startAt) q.startAt = opts.startAt;
      if (opts.endAt) q.endAt = opts.endAt;
      if (opts.search) q.search = opts.search;
      if (opts.entitySourceType) q.entitySourceType = opts.entitySourceType;
      if (opts.entitySourceId) q.entitySourceId = opts.entitySourceId;
      return client.request<{ data: any[]; totalCount?: number }>("GET", `/payments/transactions`, {
        query: q,
        version: "2021-07-28",
      });
    },

    async getTransaction(transactionId: string, altId: string, altType: string) {
      return client.request<any>("GET", `/payments/transactions/${transactionId}`, {
        query: { altId, altType },
        version: "2021-07-28",
      });
    },

    async listSubscriptions(opts: {
      locationId?: string;
      limit?: string;
      offset?: string;
      contactId?: string;
      search?: string;
    }) {
      const q: Record<string, string> = {
        altId: opts.locationId || client.locationId,
        altType: "location",
      };
      if (opts.limit) q.limit = opts.limit;
      if (opts.offset) q.offset = opts.offset;
      if (opts.contactId) q.contactId = opts.contactId;
      if (opts.search) q.search = opts.search;
      return client.request<{ data: any[]; totalCount?: number }>("GET", `/payments/subscriptions`, {
        query: q,
        version: "2021-07-28",
      });
    },

    async getSubscription(subscriptionId: string, locationId?: string) {
      return client.request<any>("GET", `/payments/subscriptions/${subscriptionId}`, {
        query: { altId: locationId || client.locationId, altType: "location" },
        version: "2021-07-28",
      });
    },

    async cancelSubscription(subscriptionId: string, data: any) {
      return client.request<any>("POST", `/payments/subscriptions/${subscriptionId}/cancel`, {
        body: data,
        version: "2021-07-28",
      });
    },

    async listStoreProducts(locationId?: string, opts?: { limit?: string; offset?: string; search?: string }) {
      const q: Record<string, string> = { locationId: locationId || client.locationId };
      if (opts?.limit) q.limit = opts.limit;
      if (opts?.offset) q.offset = opts.offset;
      if (opts?.search) q.search = opts.search;
      return client.request<{ products: any[]; total?: number }>("GET", `/products/`, {
        query: q,
        version: "2021-07-28",
      });
    },

    async getStoreProduct(productId: string) {
      return client.request<{ product: any }>("GET", `/products/${productId}`, {
        version: "2021-07-28",
      });
    },

    async createStoreProduct(data: any) {
      return client.request<{ product: any }>("POST", `/products/`, {
        body: { ...data, locationId: data.locationId || client.locationId },
        version: "2021-07-28",
      });
    },

    async updateStoreProduct(productId: string, data: any) {
      return client.request<{ product: any }>("PUT", `/products/${productId}`, {
        body: data,
        version: "2021-07-28",
      });
    },

    async deleteStoreProduct(productId: string) {
      return client.request<any>("DELETE", `/products/${productId}`, {
        version: "2021-07-28",
      });
    },

    async listShippingRates(shippingZoneId: string, altId: string, altType: string, params?: { limit?: string; offset?: string }) {
      const q: Record<string, string> = { altId, altType };
      if (params?.limit) q.limit = params.limit;
      if (params?.offset) q.offset = params.offset;
      return client.request<any>("GET", `/store/shipping-zone/${shippingZoneId}/shipping-rate`, {
        query: q,
        version: "2021-07-28",
      });
    },

    async getShippingRate(shippingZoneId: string, shippingRateId: string, altId: string, altType: string) {
      return client.request<any>("GET", `/store/shipping-zone/${shippingZoneId}/shipping-rate/${shippingRateId}`, {
        query: { altId, altType },
        version: "2021-07-28",
      });
    },

    async createShippingRate(shippingZoneId: string, data: any) {
      return client.request<any>("POST", `/store/shipping-zone/${shippingZoneId}/shipping-rate`, {
        body: data,
        version: "2021-07-28",
      });
    },

    async updateShippingRate(shippingZoneId: string, shippingRateId: string, data: any) {
      return client.request<any>("PUT", `/store/shipping-zone/${shippingZoneId}/shipping-rate/${shippingRateId}`, {
        body: data,
        version: "2021-07-28",
      });
    },

    async deleteShippingRate(shippingZoneId: string, shippingRateId: string, altId: string, altType: string) {
      return client.request<any>("DELETE", `/store/shipping-zone/${shippingZoneId}/shipping-rate/${shippingRateId}`, {
        query: { altId, altType },
        version: "2021-07-28",
      });
    },

    async listShippingZones(altId: string, altType: string, params?: { limit?: string; offset?: string; withShippingRate?: string }) {
      const q: Record<string, string> = { altId, altType };
      if (params?.limit) q.limit = params.limit;
      if (params?.offset) q.offset = params.offset;
      if (params?.withShippingRate) q.withShippingRate = params.withShippingRate;
      return client.request<any>("GET", `/store/shipping-zone`, {
        query: q,
        version: "2021-07-28",
      });
    },

    async getShippingZone(shippingZoneId: string, altId: string, altType: string) {
      return client.request<any>("GET", `/store/shipping-zone/${shippingZoneId}`, {
        query: { altId, altType },
        version: "2021-07-28",
      });
    },

    async createShippingZone(data: any) {
      return client.request<any>("POST", `/store/shipping-zone`, {
        body: data,
        version: "2021-07-28",
      });
    },

    async updateShippingZone(shippingZoneId: string, data: any) {
      return client.request<any>("PUT", `/store/shipping-zone/${shippingZoneId}`, {
        body: data,
        version: "2021-07-28",
      });
    },

    async deleteShippingZone(shippingZoneId: string, altId: string, altType: string) {
      return client.request<any>("DELETE", `/store/shipping-zone/${shippingZoneId}`, {
        query: { altId, altType },
        version: "2021-07-28",
      });
    },

    async listShippingCarriers(altId: string, altType: string) {
      return client.request<any>("GET", `/store/shipping-carrier`, {
        query: { altId, altType },
        version: "2021-07-28",
      });
    },

    async getShippingCarrier(shippingCarrierId: string, altId: string, altType: string) {
      return client.request<any>("GET", `/store/shipping-carrier/${shippingCarrierId}`, {
        query: { altId, altType },
        version: "2021-07-28",
      });
    },

    async createShippingCarrier(data: any) {
      return client.request<any>("POST", `/store/shipping-carrier`, {
        body: data,
        version: "2021-07-28",
      });
    },

    async updateShippingCarrier(shippingCarrierId: string, data: any) {
      return client.request<any>("PUT", `/store/shipping-carrier/${shippingCarrierId}`, {
        body: data,
        version: "2021-07-28",
      });
    },

    async deleteShippingCarrier(shippingCarrierId: string, altId: string, altType: string) {
      return client.request<any>("DELETE", `/store/shipping-carrier/${shippingCarrierId}`, {
        query: { altId, altType },
        version: "2021-07-28",
      });
    },
  };
}
