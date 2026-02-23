import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { Env } from "../types";
import { ok, err, resolveClient } from "./_helpers";

export function registerPaymentsTools(server: McpServer, env: Env) {
  // ==========================================================
  // INVOICES
  // ==========================================================

  server.tool(
    "ghl_list_invoices",
    "List invoices with optional filters: status, contactId, search, date range.",
    {
      status: z.string().optional().describe("Filter by status"),
      contactId: z.string().optional().describe("Filter by contact ID"),
      search: z.string().optional().describe("Search text"),
      startAt: z.string().optional().describe("Start date (ISO 8601)"),
      endAt: z.string().optional().describe("End date (ISO 8601)"),
      limit: z.string().optional().describe("Max results"),
      offset: z.string().optional().describe("Offset for pagination"),
      locationId: z.string().optional().describe("Target location"),
    },
    async ({ status, contactId, search, startAt, endAt, limit, offset, locationId }) => {
      try {
        const client = await resolveClient(env, locationId);
        const result = await client.payments.listInvoices({
          locationId,
          status,
          contactId,
          search,
          startAt,
          endAt,
          limit,
          offset,
        });
        const invoices = result.invoices || [];
        const summary = invoices.map((i: any) => ({
          id: i.id,
          number: i.number,
          contactName: i.contactName,
          total: i.total,
          status: i.status,
          dueDate: i.dueDate,
          createdAt: i.createdAt,
        }));
        return ok(`${invoices.length} invoice(s):\n\n${JSON.stringify(summary, null, 2)}`);
      } catch (e: any) {
        return err(e);
      }
    }
  );

  server.tool(
    "ghl_get_invoice",
    "Get full details for a specific invoice.",
    {
      invoiceId: z.string().describe("Invoice ID"),
      locationId: z.string().optional().describe("Target location"),
    },
    async ({ invoiceId, locationId }) => {
      try {
        const client = await resolveClient(env, locationId);
        const result = await client.payments.getInvoice(invoiceId, locationId);
        return ok(JSON.stringify(result, null, 2));
      } catch (e: any) {
        return err(e);
      }
    }
  );

  server.tool(
    "ghl_create_invoice",
    "Create a new invoice.",
    {
      contactId: z.string().describe("Contact ID"),
      total: z.number().optional().describe("Total amount"),
      dueDate: z.string().optional().describe("Due date (ISO 8601)"),
      description: z.string().optional().describe("Invoice description"),
      lineItems: z.array(z.any()).optional().describe("Line items array"),
      locationId: z.string().optional().describe("Target location"),
    },
    async (args) => {
      try {
        const client = await resolveClient(env, args.locationId);
        const result = await client.payments.createInvoice(args);
        return ok(`Invoice created!\n\n${JSON.stringify(result, null, 2)}`);
      } catch (e: any) {
        return err(e);
      }
    }
  );

  server.tool(
    "ghl_update_invoice",
    "Update an existing invoice.",
    {
      invoiceId: z.string().describe("Invoice ID"),
      total: z.number().optional(),
      dueDate: z.string().optional(),
      description: z.string().optional(),
      status: z.string().optional(),
    },
    async ({ invoiceId, ...data }) => {
      try {
        const client = await resolveClient(env);
        const result = await client.payments.updateInvoice(invoiceId, data);
        return ok(`Invoice updated!\n\n${JSON.stringify(result, null, 2)}`);
      } catch (e: any) {
        return err(e);
      }
    }
  );

  server.tool(
    "ghl_delete_invoice",
    "Delete an invoice by ID.",
    {
      invoiceId: z.string().describe("Invoice ID"),
      locationId: z.string().optional().describe("Target location"),
    },
    async ({ invoiceId, locationId }) => {
      try {
        const client = await resolveClient(env, locationId);
        await client.payments.deleteInvoice(invoiceId, locationId);
        return ok(`Invoice ${invoiceId} deleted.`);
      } catch (e: any) {
        return err(e);
      }
    }
  );

  server.tool(
    "ghl_send_invoice",
    "Send an invoice to the contact via email.",
    {
      invoiceId: z.string().describe("Invoice ID"),
      locationId: z.string().optional().describe("Target location"),
    },
    async ({ invoiceId, locationId }) => {
      try {
        const client = await resolveClient(env, locationId);
        const result = await client.payments.sendInvoice(invoiceId, locationId);
        return ok(`Invoice sent!\n\n${JSON.stringify(result, null, 2)}`);
      } catch (e: any) {
        return err(e);
      }
    }
  );

  server.tool(
    "ghl_void_invoice",
    "Mark an invoice as void.",
    {
      invoiceId: z.string().describe("Invoice ID"),
      locationId: z.string().optional().describe("Target location"),
    },
    async ({ invoiceId, locationId }) => {
      try {
        const client = await resolveClient(env, locationId);
        const result = await client.payments.voidInvoice(invoiceId, locationId);
        return ok(`Invoice voided!\n\n${JSON.stringify(result, null, 2)}`);
      } catch (e: any) {
        return err(e);
      }
    }
  );

  server.tool(
    "ghl_record_invoice_payment",
    "Record a payment against an invoice.",
    {
      invoiceId: z.string().describe("Invoice ID"),
      amount: z.number().describe("Payment amount"),
      paymentDate: z.string().optional().describe("Payment date (ISO 8601)"),
      paymentMethod: z.string().optional().describe("Payment method"),
    },
    async ({ invoiceId, ...data }) => {
      try {
        const client = await resolveClient(env);
        const result = await client.payments.recordInvoicePayment(invoiceId, data);
        return ok(`Payment recorded!\n\n${JSON.stringify(result, null, 2)}`);
      } catch (e: any) {
        return err(e);
      }
    }
  );

  server.tool(
    "ghl_generate_invoice_number",
    "Generate a new invoice number.",
    {
      locationId: z.string().optional(),
    },
    async ({ locationId }) => {
      try {
        const client = await resolveClient(env, locationId);
        const result = await client.payments.generateInvoiceNumber(
          client.apiKey,
          locationId || client.locationId,
          "location"
        );
        return ok(JSON.stringify(result, null, 2));
      } catch (e: any) {
        return err(e);
      }
    }
  );

  server.tool(
    "ghl_create_estimate",
    "Create a new estimate.",
    {
      body: z.record(z.any()),
    },
    async ({ body }) => {
      try {
        const client = await resolveClient(env);
        const result = await client.payments.createEstimate(client.apiKey, body);
        return ok(`Estimate created!\n\n${JSON.stringify(result, null, 2)}`);
      } catch (e: any) {
        return err(e);
      }
    }
  );

  server.tool(
    "ghl_list_estimates",
    "List estimates.",
    {
      locationId: z.string().optional(),
      limit: z.number().optional(),
      offset: z.number().optional(),
    },
    async ({ locationId, limit, offset }) => {
      try {
        const client = await resolveClient(env, locationId);
        const result = await client.payments.listEstimates(
          client.apiKey,
          locationId || client.locationId,
          "location",
          { limit, offset }
        );
        return ok(JSON.stringify(result, null, 2));
      } catch (e: any) {
        return err(e);
      }
    }
  );

  server.tool(
    "ghl_send_estimate",
    "Send an estimate.",
    {
      estimateId: z.string(),
      body: z.record(z.any()),
    },
    async ({ estimateId, body }) => {
      try {
        const client = await resolveClient(env);
        const result = await client.payments.sendEstimate(client.apiKey, estimateId, body);
        return ok(`Estimate sent!\n\n${JSON.stringify(result, null, 2)}`);
      } catch (e: any) {
        return err(e);
      }
    }
  );

  server.tool(
    "ghl_list_invoice_schedules",
    "List invoice schedules.",
    {
      locationId: z.string().optional(),
    },
    async ({ locationId }) => {
      try {
        const client = await resolveClient(env, locationId);
        const result = await client.payments.listInvoiceSchedules(
          client.apiKey,
          locationId || client.locationId,
          "location"
        );
        return ok(JSON.stringify(result, null, 2));
      } catch (e: any) {
        return err(e);
      }
    }
  );

  server.tool(
    "ghl_create_invoice_schedule",
    "Create an invoice schedule.",
    {
      body: z.record(z.any()),
    },
    async ({ body }) => {
      try {
        const client = await resolveClient(env);
        const result = await client.payments.createInvoiceSchedule(client.apiKey, body);
        return ok(`Invoice schedule created!\n\n${JSON.stringify(result, null, 2)}`);
      } catch (e: any) {
        return err(e);
      }
    }
  );

  server.tool(
    "ghl_list_invoice_templates",
    "List invoice templates.",
    {
      locationId: z.string().optional(),
    },
    async ({ locationId }) => {
      try {
        const client = await resolveClient(env, locationId);
        const result = await client.payments.listInvoiceTemplates(
          client.apiKey,
          locationId || client.locationId,
          "location"
        );
        return ok(JSON.stringify(result, null, 2));
      } catch (e: any) {
        return err(e);
      }
    }
  );

  server.tool(
    "ghl_create_text2pay",
    "Create and send a text-to-pay invoice.",
    {
      body: z.record(z.any()),
    },
    async ({ body }) => {
      try {
        const client = await resolveClient(env);
        const result = await client.payments.createText2Pay(client.apiKey, body);
        return ok(`Text-to-pay invoice created!\n\n${JSON.stringify(result, null, 2)}`);
      } catch (e: any) {
        return err(e);
      }
    }
  );

  // ==========================================================
  // PAYMENTS - ORDERS
  // ==========================================================

  server.tool(
    "ghl_list_orders",
    "List orders with optional filters.",
    {
      contactId: z.string().optional().describe("Filter by contact ID"),
      search: z.string().optional().describe("Search text"),
      startAt: z.string().optional().describe("Start date (ISO 8601)"),
      endAt: z.string().optional().describe("End date (ISO 8601)"),
      limit: z.string().optional().describe("Max results"),
      offset: z.string().optional().describe("Offset"),
      locationId: z.string().optional().describe("Target location"),
    },
    async ({ contactId, search, startAt, endAt, limit, offset, locationId }) => {
      try {
        const client = await resolveClient(env, locationId);
        const result = await client.payments.listOrders({
          locationId,
          contactId,
          search,
          startAt,
          endAt,
          limit,
          offset,
        });
        const orders = result.data || [];
        const summary = orders.map((o: any) => ({
          id: o.id,
          contactId: o.contactId,
          total: o.total,
          status: o.status,
          createdAt: o.createdAt,
        }));
        return ok(`${orders.length} order(s):\n\n${JSON.stringify(summary, null, 2)}`);
      } catch (e: any) {
        return err(e);
      }
    }
  );

  server.tool(
    "ghl_get_order",
    "Get full details for a specific order.",
    {
      orderId: z.string().describe("Order ID"),
      locationId: z.string().optional().describe("Target location"),
    },
    async ({ orderId, locationId }) => {
      try {
        const client = await resolveClient(env, locationId);
        const result = await client.payments.getOrder(orderId, locationId);
        return ok(JSON.stringify(result, null, 2));
      } catch (e: any) {
        return err(e);
      }
    }
  );

  server.tool(
    "ghl_get_order_fulfillments",
    "Get order fulfillments.",
    {
      orderId: z.string(),
      locationId: z.string().optional(),
    },
    async ({ orderId, locationId }) => {
      try {
        const client = await resolveClient(env, locationId);
        const result = await client.payments.getOrderFulfillments(
          client.apiKey,
          orderId,
          locationId || client.locationId,
          "location"
        );
        return ok(JSON.stringify(result, null, 2));
      } catch (e: any) {
        return err(e);
      }
    }
  );

  server.tool(
    "ghl_create_order_fulfillment",
    "Create an order fulfillment.",
    {
      orderId: z.string(),
      body: z.record(z.any()),
    },
    async ({ orderId, body }) => {
      try {
        const client = await resolveClient(env);
        const result = await client.payments.createOrderFulfillment(client.apiKey, orderId, body);
        return ok(`Order fulfillment created!\n\n${JSON.stringify(result, null, 2)}`);
      } catch (e: any) {
        return err(e);
      }
    }
  );

  // ==========================================================
  // PAYMENTS - TRANSACTIONS
  // ==========================================================

  server.tool(
    "ghl_list_transactions",
    "List payment transactions with optional filters.",
    {
      contactId: z.string().optional().describe("Filter by contact ID"),
      search: z.string().optional().describe("Search text"),
      startAt: z.string().optional().describe("Start date (ISO 8601)"),
      endAt: z.string().optional().describe("End date (ISO 8601)"),
      entitySourceType: z.string().optional().describe("Filter by entity source type"),
      entitySourceId: z.string().optional().describe("Filter by entity source ID"),
      limit: z.string().optional().describe("Max results"),
      offset: z.string().optional().describe("Offset"),
      locationId: z.string().optional().describe("Target location"),
    },
    async ({
      contactId,
      search,
      startAt,
      endAt,
      entitySourceType,
      entitySourceId,
      limit,
      offset,
      locationId,
    }) => {
      try {
        const client = await resolveClient(env, locationId);
        const result = await client.payments.listTransactions({
          locationId,
          contactId,
          search,
          startAt,
          endAt,
          entitySourceType,
          entitySourceId,
          limit,
          offset,
        });
        const transactions = result.data || [];
        const summary = transactions.map((t: any) => ({
          id: t.id,
          contactId: t.contactId,
          amount: t.amount,
          type: t.type,
          status: t.status,
          createdAt: t.createdAt,
        }));
        return ok(`${transactions.length} transaction(s):\n\n${JSON.stringify(summary, null, 2)}`);
      } catch (e: any) {
        return err(e);
      }
    }
  );

  server.tool(
    "ghl_get_transaction",
    "Get a specific transaction.",
    {
      transactionId: z.string(),
      locationId: z.string().optional(),
    },
    async ({ transactionId, locationId }) => {
      try {
        const client = await resolveClient(env, locationId);
        const result = await client.payments.getTransaction(
          client.apiKey,
          transactionId,
          locationId || client.locationId,
          "location"
        );
        return ok(JSON.stringify(result, null, 2));
      } catch (e: any) {
        return err(e);
      }
    }
  );

  // ==========================================================
  // PAYMENTS - SUBSCRIPTIONS
  // ==========================================================

  server.tool(
    "ghl_list_subscriptions",
    "List active subscriptions with optional filters.",
    {
      contactId: z.string().optional().describe("Filter by contact ID"),
      search: z.string().optional().describe("Search text"),
      limit: z.string().optional().describe("Max results"),
      offset: z.string().optional().describe("Offset"),
      locationId: z.string().optional().describe("Target location"),
    },
    async ({ contactId, search, limit, offset, locationId }) => {
      try {
        const client = await resolveClient(env, locationId);
        const result = await client.payments.listSubscriptions({
          locationId,
          contactId,
          search,
          limit,
          offset,
        });
        const subs = result.data || [];
        const summary = subs.map((s: any) => ({
          id: s.id,
          contactId: s.contactId,
          productName: s.productName,
          status: s.status,
          nextBillingDate: s.nextBillingDate,
          createdAt: s.createdAt,
        }));
        return ok(`${subs.length} subscription(s):\n\n${JSON.stringify(summary, null, 2)}`);
      } catch (e: any) {
        return err(e);
      }
    }
  );

  server.tool(
    "ghl_get_subscription",
    "Get full details for a specific subscription.",
    {
      subscriptionId: z.string().describe("Subscription ID"),
      locationId: z.string().optional().describe("Target location"),
    },
    async ({ subscriptionId, locationId }) => {
      try {
        const client = await resolveClient(env, locationId);
        const result = await client.payments.getSubscription(subscriptionId, locationId);
        return ok(JSON.stringify(result, null, 2));
      } catch (e: any) {
        return err(e);
      }
    }
  );

  // ==========================================================
  // STORE / SHIPPING
  // ==========================================================

  server.tool(
    "ghl_get_store_settings",
    "Get store settings for a location.",
    {
      locationId: z.string().optional(),
    },
    async ({ locationId }) => {
      try {
        const client = await resolveClient(env, locationId);
        const result = await client.payments.getStoreSettings(
          client.apiKey,
          locationId || client.locationId,
          "location"
        );
        return ok(JSON.stringify(result, null, 2));
      } catch (e: any) {
        return err(e);
      }
    }
  );

  server.tool(
    "ghl_list_shipping_carriers",
    "List shipping carriers.",
    {
      locationId: z.string().optional(),
    },
    async ({ locationId }) => {
      try {
        const client = await resolveClient(env, locationId);
        const result = await client.payments.listShippingCarriers(
          client.apiKey,
          locationId || client.locationId,
          "location"
        );
        return ok(JSON.stringify(result, null, 2));
      } catch (e: any) {
        return err(e);
      }
    }
  );

  server.tool(
    "ghl_list_shipping_zones",
    "List shipping zones.",
    {
      locationId: z.string().optional(),
    },
    async ({ locationId }) => {
      try {
        const client = await resolveClient(env, locationId);
        const result = await client.payments.listShippingZones(
          client.apiKey,
          locationId || client.locationId,
          "location"
        );
        return ok(JSON.stringify(result, null, 2));
      } catch (e: any) {
        return err(e);
      }
    }
  );

  server.tool(
    "ghl_create_shipping_carrier",
    "Create a shipping carrier.",
    {
      body: z.record(z.any()),
    },
    async ({ body }) => {
      try {
        const client = await resolveClient(env);
        const result = await client.payments.createShippingCarrier(client.apiKey, body);
        return ok(`Shipping carrier created!\n\n${JSON.stringify(result, null, 2)}`);
      } catch (e: any) {
        return err(e);
      }
    }
  );

  server.tool(
    "ghl_create_shipping_zone",
    "Create a shipping zone.",
    {
      body: z.record(z.any()),
    },
    async ({ body }) => {
      try {
        const client = await resolveClient(env);
        const result = await client.payments.createShippingZone(client.apiKey, body);
        return ok(`Shipping zone created!\n\n${JSON.stringify(result, null, 2)}`);
      } catch (e: any) {
        return err(e);
      }
    }
  );

  server.tool(
    "ghl_update_store_settings",
    "Update store settings.",
    {
      body: z.record(z.any()),
    },
    async ({ body }) => {
      try {
        const client = await resolveClient(env);
        const result = await client.payments.updateStoreSettings(client.apiKey, body);
        return ok(`Store settings updated!\n\n${JSON.stringify(result, null, 2)}`);
      } catch (e: any) {
        return err(e);
      }
    }
  );

  server.tool(
    "ghl_list_shipping_rates",
    "List shipping rates for a zone.",
    {
      shippingZoneId: z.string(),
      locationId: z.string().optional(),
    },
    async ({ shippingZoneId, locationId }) => {
      try {
        const client = await resolveClient(env, locationId);
        const result = await client.payments.listShippingRates(
          client.apiKey,
          shippingZoneId,
          locationId || client.locationId,
          "location"
        );
        return ok(JSON.stringify(result, null, 2));
      } catch (e: any) {
        return err(e);
      }
    }
  );

  // ==========================================================
  // PAYMENT - COUPONS
  // ==========================================================

  server.tool(
    "ghl_list_coupons",
    "List payment coupons.",
    {
      locationId: z.string().optional(),
    },
    async ({ locationId }) => {
      try {
        const client = await resolveClient(env, locationId);
        const result = await client.payments.listCoupons(
          client.apiKey,
          locationId || client.locationId,
          "location"
        );
        return ok(JSON.stringify(result, null, 2));
      } catch (e: any) {
        return err(e);
      }
    }
  );

  server.tool(
    "ghl_create_coupon",
    "Create a payment coupon.",
    {
      body: z.record(z.any()),
    },
    async ({ body }) => {
      try {
        const client = await resolveClient(env);
        const result = await client.payments.createCoupon(client.apiKey, body);
        return ok(`Coupon created!\n\n${JSON.stringify(result, null, 2)}`);
      } catch (e: any) {
        return err(e);
      }
    }
  );
}
