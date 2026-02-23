import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { Env } from "../types";
import { ok, err, resolveClient } from "./_helpers";

export function registerLocationTools(server: McpServer, env: Env) {
  // ========== LOCATION CREATION & DELETION ==========

  server.tool(
    "ghl_create_location",
    "Create a new sub-account/location.",
    {
      body: z.record(z.any()),
    },
    async ({ body }) => {
      try {
        const client = await resolveClient(env);
        const result = await client.locations.createLocation(body);
        return ok(`Location created!\n\n${JSON.stringify(result, null, 2)}`);
      } catch (e: any) {
        return err(e);
      }
    }
  );

  server.tool(
    "ghl_delete_location",
    "Delete a sub-account/location.",
    {
      locationId: z.string(),
    },
    async ({ locationId }) => {
      try {
        const client = await resolveClient(env, locationId);
        await client.locations.deleteLocation(locationId);
        return ok(`Location ${locationId} deleted.`);
      } catch (e: any) {
        return err(e);
      }
    }
  );

  server.tool(
    "ghl_get_location_timezones",
    "Get available timezones for a location.",
    {
      locationId: z.string().optional(),
    },
    async ({ locationId }) => {
      try {
        const client = await resolveClient(env, locationId);
        const result = await client.locations.getLocationTimezones(locationId || client.locationId);
        return ok(JSON.stringify(result, null, 2));
      } catch (e: any) {
        return err(e);
      }
    }
  );

  server.tool(
    "ghl_search_location_tasks",
    "Search tasks for a location.",
    {
      locationId: z.string().optional(),
      body: z.record(z.any()),
    },
    async ({ locationId, body }) => {
      try {
        const client = await resolveClient(env, locationId);
        const result = await client.locations.searchLocationTasks(locationId || client.locationId, body);
        return ok(JSON.stringify(result, null, 2));
      } catch (e: any) {
        return err(e);
      }
    }
  );

  // ========== LOCATION TAGS ==========

  server.tool(
    "ghl_list_location_tags",
    "List tags for a location.",
    {
      locationId: z.string().optional(),
    },
    async ({ locationId }) => {
      try {
        const client = await resolveClient(env, locationId);
        const result = await client.locations.listLocationTags(locationId || client.locationId);
        return ok(JSON.stringify(result, null, 2));
      } catch (e: any) {
        return err(e);
      }
    }
  );

  server.tool(
    "ghl_create_tag",
    "Create a tag for a location.",
    {
      name: z.string(),
      locationId: z.string().optional(),
    },
    async ({ name, locationId }) => {
      try {
        const client = await resolveClient(env, locationId);
        const result = await client.locations.createTag(name, locationId || client.locationId);
        return ok(`Tag created!\n\n${JSON.stringify(result, null, 2)}`);
      } catch (e: any) {
        return err(e);
      }
    }
  );

  server.tool(
    "ghl_update_tag",
    "Update a tag.",
    {
      tagId: z.string(),
      name: z.string(),
      locationId: z.string().optional(),
    },
    async ({ tagId, name, locationId }) => {
      try {
        const client = await resolveClient(env, locationId);
        const result = await client.locations.updateTag(tagId, name, locationId || client.locationId);
        return ok(`Tag updated!\n\n${JSON.stringify(result, null, 2)}`);
      } catch (e: any) {
        return err(e);
      }
    }
  );

  server.tool(
    "ghl_delete_tag",
    "Delete a tag.",
    {
      tagId: z.string(),
      locationId: z.string().optional(),
    },
    async ({ tagId, locationId }) => {
      try {
        const client = await resolveClient(env, locationId);
        await client.locations.deleteTag(tagId, locationId || client.locationId);
        return ok(`Tag ${tagId} deleted.`);
      } catch (e: any) {
        return err(e);
      }
    }
  );

  // ========== CUSTOM FIELDS ==========

  server.tool(
    "ghl_get_location_custom_fields",
    "Get custom fields for a location.",
    {
      locationId: z.string().optional(),
    },
    async ({ locationId }) => {
      try {
        const client = await resolveClient(env, locationId);
        const result = await client.locations.getLocationCustomFields(locationId || client.locationId);
        return ok(JSON.stringify(result, null, 2));
      } catch (e: any) {
        return err(e);
      }
    }
  );

  server.tool(
    "ghl_create_location_custom_field",
    "Create a custom field for a location.",
    {
      data: z.record(z.any()),
      locationId: z.string().optional(),
    },
    async ({ data, locationId }) => {
      try {
        const client = await resolveClient(env, locationId);
        const result = await client.locations.createLocationCustomField(data, locationId || client.locationId);
        return ok(`Custom field created!\n\n${JSON.stringify(result, null, 2)}`);
      } catch (e: any) {
        return err(e);
      }
    }
  );

  server.tool(
    "ghl_update_location_custom_field",
    "Update a custom field for a location.",
    {
      fieldId: z.string(),
      data: z.record(z.any()),
      locationId: z.string().optional(),
    },
    async ({ fieldId, data, locationId }) => {
      try {
        const client = await resolveClient(env, locationId);
        const result = await client.locations.updateLocationCustomField(fieldId, data, locationId || client.locationId);
        return ok(`Custom field updated!\n\n${JSON.stringify(result, null, 2)}`);
      } catch (e: any) {
        return err(e);
      }
    }
  );

  server.tool(
    "ghl_delete_location_custom_field",
    "Delete a custom field for a location.",
    {
      fieldId: z.string(),
      locationId: z.string().optional(),
    },
    async ({ fieldId, locationId }) => {
      try {
        const client = await resolveClient(env, locationId);
        await client.locations.deleteLocationCustomField(fieldId, locationId || client.locationId);
        return ok(`Custom field ${fieldId} deleted.`);
      } catch (e: any) {
        return err(e);
      }
    }
  );

  server.tool(
    "ghl_list_custom_fields_v2",
    "List custom fields by object key.",
    {
      objectKey: z.string(),
      locationId: z.string().optional(),
    },
    async ({ objectKey, locationId }) => {
      try {
        const client = await resolveClient(env, locationId);
        const result = await client.locations.listCustomFieldsV2(objectKey, locationId || client.locationId);
        return ok(JSON.stringify(result, null, 2));
      } catch (e: any) {
        return err(e);
      }
    }
  );

  server.tool(
    "ghl_get_custom_field",
    "Get a custom field by ID.",
    {
      id: z.string(),
    },
    async ({ id }) => {
      try {
        const client = await resolveClient(env);
        const result = await client.locations.getCustomField(id);
        return ok(JSON.stringify(result, null, 2));
      } catch (e: any) {
        return err(e);
      }
    }
  );

  server.tool(
    "ghl_create_custom_field",
    "Create a custom field.",
    {
      data: z.record(z.any()),
    },
    async ({ data }) => {
      try {
        const client = await resolveClient(env);
        const result = await client.locations.createCustomField(data);
        return ok(`Custom field created!\n\n${JSON.stringify(result, null, 2)}`);
      } catch (e: any) {
        return err(e);
      }
    }
  );

  server.tool(
    "ghl_update_custom_field",
    "Update a custom field.",
    {
      id: z.string(),
      data: z.record(z.any()),
    },
    async ({ id, data }) => {
      try {
        const client = await resolveClient(env);
        const result = await client.locations.updateCustomField(id, data);
        return ok(`Custom field updated!\n\n${JSON.stringify(result, null, 2)}`);
      } catch (e: any) {
        return err(e);
      }
    }
  );

  server.tool(
    "ghl_delete_custom_field",
    "Delete a custom field.",
    {
      id: z.string(),
    },
    async ({ id }) => {
      try {
        const client = await resolveClient(env);
        await client.locations.deleteCustomField(id);
        return ok(`Custom field ${id} deleted.`);
      } catch (e: any) {
        return err(e);
      }
    }
  );

  // ========== CUSTOM VALUES ==========

  server.tool(
    "ghl_list_custom_values",
    "List custom values.",
    {
      fieldId: z.string(),
      limit: z.number().optional(),
      skip: z.number().optional(),
    },
    async ({ fieldId, limit, skip }) => {
      try {
        const client = await resolveClient(env);
        const result = await client.locations.listCustomValues(fieldId, { limit, skip });
        return ok(JSON.stringify(result, null, 2));
      } catch (e: any) {
        return err(e);
      }
    }
  );

  server.tool(
    "ghl_create_custom_value",
    "Create a custom value.",
    {
      fieldId: z.string(),
      value: z.string(),
      displayOrder: z.number().optional(),
    },
    async ({ fieldId, value, displayOrder }) => {
      try {
        const client = await resolveClient(env);
        const result = await client.locations.createCustomValue(fieldId, { value, displayOrder });
        return ok(`Custom value created!\n\n${JSON.stringify(result, null, 2)}`);
      } catch (e: any) {
        return err(e);
      }
    }
  );

  server.tool(
    "ghl_update_custom_value",
    "Update a custom value.",
    {
      fieldId: z.string(),
      valueId: z.string(),
      data: z.record(z.any()),
    },
    async ({ fieldId, valueId, data }) => {
      try {
        const client = await resolveClient(env);
        const result = await client.locations.updateCustomValue(fieldId, valueId, data);
        return ok(`Custom value updated!\n\n${JSON.stringify(result, null, 2)}`);
      } catch (e: any) {
        return err(e);
      }
    }
  );

  server.tool(
    "ghl_delete_custom_value",
    "Delete a custom value.",
    {
      fieldId: z.string(),
      valueId: z.string(),
    },
    async ({ fieldId, valueId }) => {
      try {
        const client = await resolveClient(env);
        await client.locations.deleteCustomValue(fieldId, valueId);
        return ok(`Custom value ${valueId} deleted.`);
      } catch (e: any) {
        return err(e);
      }
    }
  );

  // ========== BUSINESS PROFILE ==========

  server.tool(
    "ghl_get_location_business",
    "Get business details for a location.",
    {
      locationId: z.string().optional(),
    },
    async ({ locationId }) => {
      try {
        const client = await resolveClient(env, locationId);
        const result = await client.locations.getLocationBusiness(locationId || client.locationId);
        return ok(JSON.stringify(result, null, 2));
      } catch (e: any) {
        return err(e);
      }
    }
  );

  server.tool(
    "ghl_update_location_business",
    "Update business details for a location.",
    {
      locationId: z.string().optional(),
      data: z.record(z.any()),
    },
    async ({ locationId, data }) => {
      try {
        const client = await resolveClient(env, locationId);
        const result = await client.locations.updateLocationBusiness(locationId || client.locationId, data);
        return ok(`Business updated!\n\n${JSON.stringify(result, null, 2)}`);
      } catch (e: any) {
        return err(e);
      }
    }
  );

  // ========== USERS (location-based) ==========

  server.tool(
    "ghl_create_user",
    "Create a new user.",
    {
      body: z.record(z.any()),
    },
    async ({ body }) => {
      try {
        const client = await resolveClient(env);
        const result = await client.locations.createUser(body);
        return ok(`User created!\n\n${JSON.stringify(result, null, 2)}`);
      } catch (e: any) {
        return err(e);
      }
    }
  );

  server.tool(
    "ghl_search_users",
    "Search users.",
    {
      companyId: z.string(),
      query: z.string().optional(),
      role: z.string().optional(),
      locationId: z.string().optional(),
    },
    async ({ companyId, query, role, locationId }) => {
      try {
        const client = await resolveClient(env, locationId);
        const result = await client.locations.searchUsers(companyId, { query, role, locationId });
        return ok(JSON.stringify(result, null, 2));
      } catch (e: any) {
        return err(e);
      }
    }
  );

  server.tool(
    "ghl_update_user",
    "Update a user.",
    {
      userId: z.string(),
      body: z.record(z.any()),
    },
    async ({ userId, body }) => {
      try {
        const client = await resolveClient(env);
        const result = await client.locations.updateUser(userId, body);
        return ok(`User updated!\n\n${JSON.stringify(result, null, 2)}`);
      } catch (e: any) {
        return err(e);
      }
    }
  );

  server.tool(
    "ghl_delete_user",
    "Delete a user.",
    {
      userId: z.string(),
    },
    async ({ userId }) => {
      try {
        const client = await resolveClient(env);
        await client.locations.deleteUser(userId);
        return ok(`User ${userId} deleted.`);
      } catch (e: any) {
        return err(e);
      }
    }
  );
}
