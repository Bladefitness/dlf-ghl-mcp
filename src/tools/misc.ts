import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { Env } from "../types";
import { ok, err, resolveClient } from "./_helpers";

export function registerMiscTools(server: McpServer, env: Env) {
  // ========== ASSOCIATIONS ==========

  server.tool(
    "ghl_list_associations",
    "List associations.",
    {
      locationId: z.string().optional(),
      skip: z.string().optional(),
      limit: z.string().optional(),
    },
    async ({ locationId, skip, limit }) => {
      try {
        const client = await resolveClient(env, locationId);
        const result = await client.misc.listAssociations(locationId || client.locationId, skip, limit);
        return ok(JSON.stringify(result, null, 2));
      } catch (e: any) {
        return err(e);
      }
    }
  );

  server.tool(
    "ghl_get_association",
    "Get an association by ID.",
    {
      associationId: z.string(),
    },
    async ({ associationId }) => {
      try {
        const client = await resolveClient(env);
        const result = await client.misc.getAssociation(associationId);
        return ok(JSON.stringify(result, null, 2));
      } catch (e: any) {
        return err(e);
      }
    }
  );

  server.tool(
    "ghl_get_association_by_key",
    "Get an association by key name.",
    {
      keyName: z.string(),
      locationId: z.string().optional(),
    },
    async ({ keyName, locationId }) => {
      try {
        const client = await resolveClient(env, locationId);
        const result = await client.misc.getAssociationByKey(keyName, locationId || client.locationId);
        return ok(JSON.stringify(result, null, 2));
      } catch (e: any) {
        return err(e);
      }
    }
  );

  server.tool(
    "ghl_create_association",
    "Create an association.",
    {
      data: z.record(z.any()),
    },
    async ({ data }) => {
      try {
        const client = await resolveClient(env);
        const result = await client.misc.createAssociation(data);
        return ok(`Association created!\n\n${JSON.stringify(result, null, 2)}`);
      } catch (e: any) {
        return err(e);
      }
    }
  );

  server.tool(
    "ghl_update_association",
    "Update an association.",
    {
      associationId: z.string(),
      data: z.record(z.any()),
    },
    async ({ associationId, data }) => {
      try {
        const client = await resolveClient(env);
        const result = await client.misc.updateAssociation(associationId, data);
        return ok(`Association updated!\n\n${JSON.stringify(result, null, 2)}`);
      } catch (e: any) {
        return err(e);
      }
    }
  );

  server.tool(
    "ghl_delete_association",
    "Delete an association.",
    {
      associationId: z.string(),
    },
    async ({ associationId }) => {
      try {
        const client = await resolveClient(env);
        await client.misc.deleteAssociation(associationId);
        return ok(`Association ${associationId} deleted.`);
      } catch (e: any) {
        return err(e);
      }
    }
  );

  // ========== COMPANIES ==========

  server.tool(
    "ghl_list_companies",
    "List companies.",
    {
      locationId: z.string().optional(),
    },
    async ({ locationId }) => {
      try {
        const client = await resolveClient(env, locationId);
        const result = await client.misc.listCompanies(locationId || client.locationId);
        return ok(JSON.stringify(result, null, 2));
      } catch (e: any) {
        return err(e);
      }
    }
  );

  server.tool(
    "ghl_get_company",
    "Get company details.",
    {
      companyId: z.string(),
    },
    async ({ companyId }) => {
      try {
        const client = await resolveClient(env);
        const result = await client.misc.getCompany(companyId);
        return ok(JSON.stringify(result, null, 2));
      } catch (e: any) {
        return err(e);
      }
    }
  );

  server.tool(
    "ghl_create_company",
    "Create a new company.",
    {
      data: z.record(z.any()),
    },
    async ({ data }) => {
      try {
        const client = await resolveClient(env);
        const result = await client.misc.createCompany(data);
        return ok(`Company created!\n\n${JSON.stringify(result, null, 2)}`);
      } catch (e: any) {
        return err(e);
      }
    }
  );

  server.tool(
    "ghl_update_company",
    "Update a company.",
    {
      companyId: z.string(),
      data: z.record(z.any()),
    },
    async ({ companyId, data }) => {
      try {
        const client = await resolveClient(env);
        const result = await client.misc.updateCompany(companyId, data);
        return ok(`Company updated!\n\n${JSON.stringify(result, null, 2)}`);
      } catch (e: any) {
        return err(e);
      }
    }
  );

  server.tool(
    "ghl_delete_company",
    "Delete a company.",
    {
      companyId: z.string(),
    },
    async ({ companyId }) => {
      try {
        const client = await resolveClient(env);
        await client.misc.deleteCompany(companyId);
        return ok(`Company ${companyId} deleted.`);
      } catch (e: any) {
        return err(e);
      }
    }
  );

  // ========== PHONE SYSTEM ==========

  server.tool(
    "ghl_list_number_pools",
    "List phone number pools.",
    {
      locationId: z.string().optional(),
    },
    async ({ locationId }) => {
      try {
        const client = await resolveClient(env, locationId);
        const result = await client.misc.listNumberPools(locationId || client.locationId);
        return ok(JSON.stringify(result, null, 2));
      } catch (e: any) {
        return err(e);
      }
    }
  );

  server.tool(
    "ghl_list_active_numbers",
    "List active phone numbers for a location.",
    {
      locationId: z.string().optional(),
      pageSize: z.number().optional(),
      page: z.number().optional(),
      searchFilter: z.string().optional(),
    },
    async ({ locationId, pageSize, page, searchFilter }) => {
      try {
        const client = await resolveClient(env, locationId);
        const result = await client.misc.listActiveNumbers(locationId || client.locationId, { pageSize, page, searchFilter });
        return ok(JSON.stringify(result, null, 2));
      } catch (e: any) {
        return err(e);
      }
    }
  );

  server.tool(
    "ghl_list_phone_numbers",
    "List phone numbers.",
    {
      locationId: z.string().optional(),
    },
    async ({ locationId }) => {
      try {
        const client = await resolveClient(env, locationId);
        const result = await client.misc.listPhoneNumbers(locationId || client.locationId);
        return ok(JSON.stringify(result, null, 2));
      } catch (e: any) {
        return err(e);
      }
    }
  );

  server.tool(
    "ghl_get_phone_number",
    "Get a phone number by ID.",
    {
      phoneNumberId: z.string(),
    },
    async ({ phoneNumberId }) => {
      try {
        const client = await resolveClient(env);
        const result = await client.misc.getPhoneNumber(phoneNumberId);
        return ok(JSON.stringify(result, null, 2));
      } catch (e: any) {
        return err(e);
      }
    }
  );

  server.tool(
    "ghl_purchase_phone_number",
    "Purchase a phone number.",
    {
      data: z.record(z.any()),
    },
    async ({ data }) => {
      try {
        const client = await resolveClient(env);
        const result = await client.misc.purchasePhoneNumber(data);
        return ok(`Phone number purchased!\n\n${JSON.stringify(result, null, 2)}`);
      } catch (e: any) {
        return err(e);
      }
    }
  );

  server.tool(
    "ghl_update_phone_number",
    "Update a phone number.",
    {
      phoneNumberId: z.string(),
      data: z.record(z.any()),
    },
    async ({ phoneNumberId, data }) => {
      try {
        const client = await resolveClient(env);
        const result = await client.misc.updatePhoneNumber(phoneNumberId, data);
        return ok(`Phone number updated!\n\n${JSON.stringify(result, null, 2)}`);
      } catch (e: any) {
        return err(e);
      }
    }
  );

  server.tool(
    "ghl_release_phone_number",
    "Release a phone number.",
    {
      phoneNumberId: z.string(),
    },
    async ({ phoneNumberId }) => {
      try {
        const client = await resolveClient(env);
        await client.misc.releasePhoneNumber(phoneNumberId);
        return ok(`Phone number ${phoneNumberId} released.`);
      } catch (e: any) {
        return err(e);
      }
    }
  );

  // ========== PRODUCTS ==========

  server.tool(
    "ghl_list_products",
    "List products for a location.",
    {
      locationId: z.string().optional(),
      limit: z.number().optional(),
      skip: z.number().optional(),
      status: z.string().optional(),
    },
    async ({ locationId, limit, skip, status }) => {
      try {
        const client = await resolveClient(env, locationId);
        const result = await client.misc.listProducts(locationId || client.locationId, { limit, skip, status });
        return ok(JSON.stringify(result, null, 2));
      } catch (e: any) {
        return err(e);
      }
    }
  );

  server.tool(
    "ghl_get_product",
    "Get a product by ID.",
    {
      productId: z.string(),
    },
    async ({ productId }) => {
      try {
        const client = await resolveClient(env);
        const result = await client.misc.getProduct(productId);
        return ok(JSON.stringify(result, null, 2));
      } catch (e: any) {
        return err(e);
      }
    }
  );

  server.tool(
    "ghl_create_product",
    "Create a new product.",
    {
      data: z.record(z.any()),
    },
    async ({ data }) => {
      try {
        const client = await resolveClient(env);
        const result = await client.misc.createProduct(data);
        return ok(`Product created!\n\n${JSON.stringify(result, null, 2)}`);
      } catch (e: any) {
        return err(e);
      }
    }
  );

  server.tool(
    "ghl_update_product",
    "Update a product.",
    {
      productId: z.string(),
      data: z.record(z.any()),
    },
    async ({ productId, data }) => {
      try {
        const client = await resolveClient(env);
        const result = await client.misc.updateProduct(productId, data);
        return ok(`Product updated!\n\n${JSON.stringify(result, null, 2)}`);
      } catch (e: any) {
        return err(e);
      }
    }
  );

  server.tool(
    "ghl_delete_product",
    "Delete a product.",
    {
      productId: z.string(),
    },
    async ({ productId }) => {
      try {
        const client = await resolveClient(env);
        await client.misc.deleteProduct(productId);
        return ok(`Product ${productId} deleted.`);
      } catch (e: any) {
        return err(e);
      }
    }
  );

  server.tool(
    "ghl_delete_product_price",
    "Delete a product price.",
    {
      productId: z.string(),
      priceId: z.string(),
    },
    async ({ productId, priceId }) => {
      try {
        const client = await resolveClient(env);
        await client.misc.deleteProductPrice(productId, priceId);
        return ok(`Product price ${priceId} deleted.`);
      } catch (e: any) {
        return err(e);
      }
    }
  );

  server.tool(
    "ghl_list_product_collections",
    "List product collections.",
    {
      locationId: z.string().optional(),
    },
    async ({ locationId }) => {
      try {
        const client = await resolveClient(env, locationId);
        const result = await client.misc.listProductCollections(locationId || client.locationId);
        return ok(JSON.stringify(result, null, 2));
      } catch (e: any) {
        return err(e);
      }
    }
  );

  server.tool(
    "ghl_create_product_collection",
    "Create a product collection.",
    {
      body: z.record(z.any()),
    },
    async ({ body }) => {
      try {
        const client = await resolveClient(env);
        const result = await client.misc.createProductCollection(body);
        return ok(`Product collection created!\n\n${JSON.stringify(result, null, 2)}`);
      } catch (e: any) {
        return err(e);
      }
    }
  );

  server.tool(
    "ghl_delete_product_collection",
    "Delete a product collection.",
    {
      collectionId: z.string(),
    },
    async ({ collectionId }) => {
      try {
        const client = await resolveClient(env);
        await client.misc.deleteProductCollection(collectionId);
        return ok(`Product collection ${collectionId} deleted.`);
      } catch (e: any) {
        return err(e);
      }
    }
  );

  server.tool(
    "ghl_list_product_reviews",
    "List product reviews.",
    {
      locationId: z.string().optional(),
    },
    async ({ locationId }) => {
      try {
        const client = await resolveClient(env, locationId);
        const result = await client.misc.listProductReviews(locationId || client.locationId);
        return ok(JSON.stringify(result, null, 2));
      } catch (e: any) {
        return err(e);
      }
    }
  );

  server.tool(
    "ghl_get_product_inventory",
    "Get product inventory.",
    {
      locationId: z.string().optional(),
    },
    async ({ locationId }) => {
      try {
        const client = await resolveClient(env, locationId);
        const result = await client.misc.getProductInventory(locationId || client.locationId);
        return ok(JSON.stringify(result, null, 2));
      } catch (e: any) {
        return err(e);
      }
    }
  );

  // ========== CUSTOM OBJECTS ==========

  server.tool(
    "ghl_get_object_record",
    "Get a custom object record.",
    {
      schemaKey: z.string(),
      recordId: z.string(),
    },
    async ({ schemaKey, recordId }) => {
      try {
        const client = await resolveClient(env);
        const result = await client.misc.getObjectRecord(schemaKey, recordId);
        return ok(JSON.stringify(result, null, 2));
      } catch (e: any) {
        return err(e);
      }
    }
  );

  server.tool(
    "ghl_create_object_record",
    "Create a custom object record.",
    {
      schemaKey: z.string(),
      data: z.record(z.any()),
    },
    async ({ schemaKey, data }) => {
      try {
        const client = await resolveClient(env);
        const result = await client.misc.createObjectRecord(schemaKey, data);
        return ok(`Object record created!\n\n${JSON.stringify(result, null, 2)}`);
      } catch (e: any) {
        return err(e);
      }
    }
  );

  server.tool(
    "ghl_update_object_record",
    "Update a custom object record.",
    {
      schemaKey: z.string(),
      recordId: z.string(),
      data: z.record(z.any()),
    },
    async ({ schemaKey, recordId, data }) => {
      try {
        const client = await resolveClient(env);
        const result = await client.misc.updateObjectRecord(schemaKey, recordId, data);
        return ok(`Object record updated!\n\n${JSON.stringify(result, null, 2)}`);
      } catch (e: any) {
        return err(e);
      }
    }
  );

  server.tool(
    "ghl_delete_object_record",
    "Delete a custom object record.",
    {
      schemaKey: z.string(),
      recordId: z.string(),
    },
    async ({ schemaKey, recordId }) => {
      try {
        const client = await resolveClient(env);
        await client.misc.deleteObjectRecord(schemaKey, recordId);
        return ok(`Object record ${recordId} deleted.`);
      } catch (e: any) {
        return err(e);
      }
    }
  );

  server.tool(
    "ghl_search_object_records",
    "Search custom object records.",
    {
      schemaKey: z.string(),
      locationId: z.string().optional(),
      page: z.number().default(1),
      pageLimit: z.number().default(20),
      query: z.string(),
    },
    async ({ schemaKey, locationId, page, pageLimit, query }) => {
      try {
        const client = await resolveClient(env, locationId);
        const result = await client.misc.searchObjectRecords(schemaKey, { locationId: locationId || client.locationId, page, pageLimit, query, searchAfter: [] });
        return ok(JSON.stringify(result, null, 2));
      } catch (e: any) {
        return err(e);
      }
    }
  );

  // ========== CONVERSATIONS ==========

  server.tool(
    "ghl_delete_conversation",
    "Delete a conversation.",
    {
      conversationId: z.string(),
    },
    async ({ conversationId }) => {
      try {
        const client = await resolveClient(env);
        await client.misc.deleteConversation(conversationId);
        return ok(`Conversation ${conversationId} deleted.`);
      } catch (e: any) {
        return err(e);
      }
    }
  );

  server.tool(
    "ghl_add_inbound_message",
    "Add an inbound message to a conversation.",
    {
      body: z.record(z.any()),
    },
    async ({ body }) => {
      try {
        const client = await resolveClient(env);
        const result = await client.misc.addInboundMessage(body);
        return ok(`Message added!\n\n${JSON.stringify(result, null, 2)}`);
      } catch (e: any) {
        return err(e);
      }
    }
  );

  server.tool(
    "ghl_get_email_message",
    "Get an email message by ID.",
    {
      emailId: z.string(),
    },
    async ({ emailId }) => {
      try {
        const client = await resolveClient(env);
        const result = await client.misc.getEmailMessage(emailId);
        return ok(JSON.stringify(result, null, 2));
      } catch (e: any) {
        return err(e);
      }
    }
  );

  server.tool(
    "ghl_update_message_status",
    "Update the status of a message.",
    {
      messageId: z.string(),
      body: z.record(z.any()),
    },
    async ({ messageId, body }) => {
      try {
        const client = await resolveClient(env);
        const result = await client.misc.updateMessageStatus(messageId, body);
        return ok(`Message status updated!\n\n${JSON.stringify(result, null, 2)}`);
      } catch (e: any) {
        return err(e);
      }
    }
  );

  // ========== PAYMENTS & ORDERS ==========

  server.tool(
    "ghl_list_coupons",
    "List payment coupons.",
    {
      locationId: z.string().optional(),
    },
    async ({ locationId }) => {
      try {
        const client = await resolveClient(env, locationId);
        const result = await client.misc.listCoupons(locationId || client.locationId);
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
        const result = await client.misc.createCoupon(body);
        return ok(`Coupon created!\n\n${JSON.stringify(result, null, 2)}`);
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
        const result = await client.misc.getOrderFulfillments(orderId, locationId || client.locationId);
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
        const result = await client.misc.createOrderFulfillment(orderId, body);
        return ok(`Order fulfillment created!\n\n${JSON.stringify(result, null, 2)}`);
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
        const result = await client.misc.getTransaction(transactionId, locationId || client.locationId);
        return ok(JSON.stringify(result, null, 2));
      } catch (e: any) {
        return err(e);
      }
    }
  );

  // ========== STORE & SHIPPING ==========

  server.tool(
    "ghl_get_store_settings",
    "Get store settings for a location.",
    {
      locationId: z.string().optional(),
    },
    async ({ locationId }) => {
      try {
        const client = await resolveClient(env, locationId);
        const result = await client.misc.getStoreSettings(locationId || client.locationId);
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
        const result = await client.misc.listShippingCarriers(locationId || client.locationId);
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
        const result = await client.misc.listShippingZones(locationId || client.locationId);
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
        const result = await client.misc.createShippingCarrier(body);
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
        const result = await client.misc.createShippingZone(body);
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
        const result = await client.misc.updateStoreSettings(body);
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
        const result = await client.misc.listShippingRates(shippingZoneId, locationId || client.locationId);
        return ok(JSON.stringify(result, null, 2));
      } catch (e: any) {
        return err(e);
      }
    }
  );

  // ========== INVOICES & ESTIMATES ==========

  server.tool(
    "ghl_generate_invoice_number",
    "Generate a new invoice number.",
    {
      locationId: z.string().optional(),
    },
    async ({ locationId }) => {
      try {
        const client = await resolveClient(env, locationId);
        const result = await client.misc.generateInvoiceNumber(locationId || client.locationId);
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
        const result = await client.misc.createEstimate(body);
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
        const result = await client.misc.listEstimates(locationId || client.locationId, { limit, offset });
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
        const result = await client.misc.sendEstimate(estimateId, body);
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
        const result = await client.misc.listInvoiceSchedules(locationId || client.locationId);
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
        const result = await client.misc.createInvoiceSchedule(body);
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
        const result = await client.misc.listInvoiceTemplates(locationId || client.locationId);
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
        const result = await client.misc.createText2Pay(body);
        return ok(`Text-to-pay invoice created!\n\n${JSON.stringify(result, null, 2)}`);
      } catch (e: any) {
        return err(e);
      }
    }
  );

  // ========== FUNNEL REDIRECTS ==========

  server.tool(
    "ghl_list_redirects",
    "List funnel redirects.",
    {
      locationId: z.string().optional(),
    },
    async ({ locationId }) => {
      try {
        const client = await resolveClient(env, locationId);
        const result = await client.misc.listRedirects(locationId || client.locationId);
        return ok(JSON.stringify(result, null, 2));
      } catch (e: any) {
        return err(e);
      }
    }
  );

  server.tool(
    "ghl_create_redirect",
    "Create a funnel redirect.",
    {
      body: z.record(z.any()),
    },
    async ({ body }) => {
      try {
        const client = await resolveClient(env);
        const result = await client.misc.createRedirect(body);
        return ok(`Redirect created!\n\n${JSON.stringify(result, null, 2)}`);
      } catch (e: any) {
        return err(e);
      }
    }
  );

  server.tool(
    "ghl_delete_redirect",
    "Delete a funnel redirect.",
    {
      redirectId: z.string(),
    },
    async ({ redirectId }) => {
      try {
        const client = await resolveClient(env);
        await client.misc.deleteRedirect(redirectId);
        return ok(`Redirect ${redirectId} deleted.`);
      } catch (e: any) {
        return err(e);
      }
    }
  );

  // ========== SOCIAL MEDIA ==========

  server.tool(
    "ghl_get_social_post",
    "Get a specific social media post.",
    {
      locationId: z.string().optional(),
      postId: z.string(),
    },
    async ({ locationId, postId }) => {
      try {
        const client = await resolveClient(env, locationId);
        const result = await client.misc.getSocialPost(locationId || client.locationId, postId);
        return ok(JSON.stringify(result, null, 2));
      } catch (e: any) {
        return err(e);
      }
    }
  );

  server.tool(
    "ghl_edit_social_post",
    "Edit a social media post.",
    {
      locationId: z.string().optional(),
      postId: z.string(),
      body: z.record(z.any()),
    },
    async ({ locationId, postId, body }) => {
      try {
        const client = await resolveClient(env, locationId);
        const result = await client.misc.editSocialPost(locationId || client.locationId, postId, body);
        return ok(`Social post edited!\n\n${JSON.stringify(result, null, 2)}`);
      } catch (e: any) {
        return err(e);
      }
    }
  );

  server.tool(
    "ghl_get_social_categories",
    "Get social media categories.",
    {
      locationId: z.string().optional(),
    },
    async ({ locationId }) => {
      try {
        const client = await resolveClient(env, locationId);
        const result = await client.misc.getSocialCategories(locationId || client.locationId);
        return ok(JSON.stringify(result, null, 2));
      } catch (e: any) {
        return err(e);
      }
    }
  );

  server.tool(
    "ghl_get_social_statistics",
    "Get social media statistics.",
    {
      body: z.record(z.any()),
    },
    async ({ body }) => {
      try {
        const client = await resolveClient(env);
        const result = await client.misc.getSocialStatistics(body);
        return ok(JSON.stringify(result, null, 2));
      } catch (e: any) {
        return err(e);
      }
    }
  );
}
