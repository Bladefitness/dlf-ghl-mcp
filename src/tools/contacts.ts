import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { Env } from "../types";
import { ok, err, resolveClient } from "./_helpers";

export function registerContactsTools(server: McpServer, env: Env) {
  server.tool(
    "ghl_search_contacts",
    "Search contacts in a location by name, email, phone, or any text. Returns matching contacts with details.",
    {
      query: z.string().describe("Search query (name, email, phone, etc.)"),
      locationId: z.string().optional().describe("Target location"),
      limit: z.number().optional().describe("Max results (default 20, max 100)"),
    },
    async ({ query, locationId, limit }) => {
      try {
        const client = await resolveClient(env, locationId);
        const result = await client.contacts.searchContacts(query, locationId, limit);
        const contacts = result.contacts || [];
        if (contacts.length === 0) return ok("No contacts found matching that query.");
        const summary = contacts.map((c: any) => ({
          id: c.id,
          name: `${c.firstName || ""} ${c.lastName || ""}`.trim() || c.name || "N/A",
          email: c.email || "N/A",
          phone: c.phone || "N/A",
          tags: c.tags || [],
          dateAdded: c.dateAdded,
        }));
        return ok(`${contacts.length} contact(s):\n\n${JSON.stringify(summary, null, 2)}`);
      } catch (e: any) {
        return err(e);
      }
    }
  );

  server.tool(
    "ghl_get_contact",
    "Get full details for a specific contact by ID.",
    { contactId: z.string().describe("Contact ID") },
    async ({ contactId }) => {
      try {
        const client = await resolveClient(env);
        const result = await client.contacts.getContact(contactId);
        return ok(JSON.stringify(result, null, 2));
      } catch (e: any) {
        return err(e);
      }
    }
  );

  server.tool(
    "ghl_create_contact",
    "Create a new contact in GHL.",
    {
      firstName: z.string().optional().describe("First name"),
      lastName: z.string().optional().describe("Last name"),
      name: z.string().optional().describe("Full name (alternative to first/last)"),
      email: z.string().optional().describe("Email address"),
      phone: z.string().optional().describe("Phone number"),
      address1: z.string().optional().describe("Street address"),
      city: z.string().optional().describe("City"),
      state: z.string().optional().describe("State/Province"),
      postalCode: z.string().optional().describe("ZIP/Postal code"),
      website: z.string().optional().describe("Website URL"),
      timezone: z.string().optional().describe("Timezone"),
      tags: z.array(z.string()).optional().describe("Tags to apply"),
      source: z.string().optional().describe("Lead source"),
      locationId: z.string().optional().describe("Target location"),
    },
    async (args) => {
      try {
        const client = await resolveClient(env, args.locationId);
        const result = await client.contacts.createContact(args);
        return ok(`Contact created!\n\n${JSON.stringify(result, null, 2)}`);
      } catch (e: any) {
        return err(e);
      }
    }
  );

  server.tool(
    "ghl_update_contact",
    "Update an existing contact's information.",
    {
      contactId: z.string().describe("Contact ID to update"),
      firstName: z.string().optional(),
      lastName: z.string().optional(),
      email: z.string().optional(),
      phone: z.string().optional(),
      address1: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      postalCode: z.string().optional(),
      website: z.string().optional(),
      timezone: z.string().optional(),
      tags: z.array(z.string()).optional(),
      dnd: z.boolean().optional().describe("Do Not Disturb flag"),
    },
    async ({ contactId, ...data }) => {
      try {
        const client = await resolveClient(env);
        const result = await client.contacts.updateContact(contactId, data);
        return ok(`Contact updated!\n\n${JSON.stringify(result, null, 2)}`);
      } catch (e: any) {
        return err(e);
      }
    }
  );

  server.tool(
    "ghl_delete_contact",
    "Permanently delete a contact. WARNING: This cannot be undone.",
    { contactId: z.string().describe("Contact ID to delete") },
    async ({ contactId }) => {
      try {
        const client = await resolveClient(env);
        await client.contacts.deleteContact(contactId);
        return ok(`Contact ${contactId} deleted.`);
      } catch (e: any) {
        return err(e);
      }
    }
  );

  server.tool(
    "ghl_upsert_contact",
    "Create or update a contact. Matches by email or phone. If found, updates; if not, creates.",
    {
      firstName: z.string().optional(),
      lastName: z.string().optional(),
      name: z.string().optional(),
      email: z.string().optional(),
      phone: z.string().optional(),
      address1: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      postalCode: z.string().optional(),
      tags: z.array(z.string()).optional(),
      source: z.string().optional(),
      locationId: z.string().optional(),
    },
    async (args) => {
      try {
        const client = await resolveClient(env, args.locationId);
        const result = await client.contacts.upsertContact(args);
        return ok(`Contact upserted!\n\n${JSON.stringify(result, null, 2)}`);
      } catch (e: any) {
        return err(e);
      }
    }
  );

  server.tool(
    "ghl_add_contact_tags",
    "Add tags to a contact.",
    {
      contactId: z.string().describe("Contact ID"),
      tags: z.array(z.string()).describe("Tags to add"),
    },
    async ({ contactId, tags }) => {
      try {
        const client = await resolveClient(env);
        const result = await client.contacts.addContactTags(contactId, tags);
        return ok(`Tags added!\n\n${JSON.stringify(result, null, 2)}`);
      } catch (e: any) {
        return err(e);
      }
    }
  );

  server.tool(
    "ghl_remove_contact_tags",
    "Remove tags from a contact.",
    {
      contactId: z.string().describe("Contact ID"),
      tags: z.array(z.string()).describe("Tags to remove"),
    },
    async ({ contactId, tags }) => {
      try {
        const client = await resolveClient(env);
        const result = await client.contacts.removeContactTags(contactId, tags);
        return ok(`Tags removed!\n\n${JSON.stringify(result, null, 2)}`);
      } catch (e: any) {
        return err(e);
      }
    }
  );

  server.tool(
    "ghl_add_contact_to_workflow",
    "Enroll a contact in a GHL workflow/automation.",
    {
      contactId: z.string().describe("Contact ID"),
      workflowId: z.string().describe("Workflow ID to enroll in"),
    },
    async ({ contactId, workflowId }) => {
      try {
        const client = await resolveClient(env);
        const result = await client.contacts.addContactToWorkflow(contactId, workflowId);
        return ok(`Contact enrolled in workflow!\n\n${JSON.stringify(result, null, 2)}`);
      } catch (e: any) {
        return err(e);
      }
    }
  );

  server.tool(
    "ghl_remove_contact_from_workflow",
    "Remove a contact from a workflow.",
    {
      contactId: z.string().describe("Contact ID"),
      workflowId: z.string().describe("Workflow ID"),
    },
    async ({ contactId, workflowId }) => {
      try {
        const client = await resolveClient(env);
        const result = await client.contacts.removeContactFromWorkflow(contactId, workflowId);
        return ok(`Contact removed from workflow.\n\n${JSON.stringify(result, null, 2)}`);
      } catch (e: any) {
        return err(e);
      }
    }
  );

  server.tool(
    "ghl_get_contact_appointments",
    "Get all appointments for a specific contact.",
    { contactId: z.string().describe("Contact ID") },
    async ({ contactId }) => {
      try {
        const client = await resolveClient(env);
        const result = await client.contacts.getContactAppointments(contactId);
        return ok(JSON.stringify(result, null, 2));
      } catch (e: any) {
        return err(e);
      }
    }
  );

  server.tool(
    "ghl_get_contact_notes",
    "Get all notes for a contact.",
    { contactId: z.string().describe("Contact ID") },
    async ({ contactId }) => {
      try {
        const client = await resolveClient(env);
        const result = await client.contacts.getContactNotes(contactId);
        return ok(JSON.stringify(result, null, 2));
      } catch (e: any) {
        return err(e);
      }
    }
  );

  server.tool(
    "ghl_create_contact_note",
    "Add a note to a contact.",
    {
      contactId: z.string().describe("Contact ID"),
      body: z.string().describe("Note content"),
    },
    async ({ contactId, body }) => {
      try {
        const client = await resolveClient(env);
        const result = await client.contacts.createContactNote(contactId, body);
        return ok(`Note created!\n\n${JSON.stringify(result, null, 2)}`);
      } catch (e: any) {
        return err(e);
      }
    }
  );

  server.tool(
    "ghl_update_contact_note",
    "Update an existing note on a contact.",
    {
      contactId: z.string().describe("Contact ID"),
      noteId: z.string().describe("Note ID"),
      body: z.string().describe("Updated note content"),
    },
    async ({ contactId, noteId, body }) => {
      try {
        const client = await resolveClient(env);
        const result = await client.contacts.updateContactNote(contactId, noteId, body);
        return ok(`Note updated!\n\n${JSON.stringify(result, null, 2)}`);
      } catch (e: any) {
        return err(e);
      }
    }
  );

  server.tool(
    "ghl_delete_contact_note",
    "Delete a note from a contact.",
    {
      contactId: z.string().describe("Contact ID"),
      noteId: z.string().describe("Note ID"),
    },
    async ({ contactId, noteId }) => {
      try {
        const client = await resolveClient(env);
        await client.contacts.deleteContactNote(contactId, noteId);
        return ok(`Note ${noteId} deleted.`);
      } catch (e: any) {
        return err(e);
      }
    }
  );

  server.tool(
    "ghl_get_contact_tasks",
    "Get all tasks for a contact.",
    { contactId: z.string().describe("Contact ID") },
    async ({ contactId }) => {
      try {
        const client = await resolveClient(env);
        const result = await client.contacts.getContactTasks(contactId);
        return ok(JSON.stringify(result, null, 2));
      } catch (e: any) {
        return err(e);
      }
    }
  );

  server.tool(
    "ghl_create_contact_task",
    "Create a task for a contact.",
    {
      contactId: z.string().describe("Contact ID"),
      title: z.string().describe("Task title"),
      body: z.string().optional().describe("Task description"),
      dueDate: z.string().optional().describe("Due date (ISO 8601)"),
      completed: z.boolean().optional().describe("Mark as completed"),
      assignedTo: z.string().optional().describe("Assign to user ID"),
    },
    async ({ contactId, ...data }) => {
      try {
        const client = await resolveClient(env);
        const result = await client.contacts.createContactTask(contactId, data);
        return ok(`Task created!\n\n${JSON.stringify(result, null, 2)}`);
      } catch (e: any) {
        return err(e);
      }
    }
  );

  server.tool(
    "ghl_update_contact_task",
    "Update a task on a contact.",
    {
      contactId: z.string().describe("Contact ID"),
      taskId: z.string().describe("Task ID"),
      title: z.string().optional(),
      body: z.string().optional(),
      dueDate: z.string().optional(),
      completed: z.boolean().optional(),
      assignedTo: z.string().optional(),
    },
    async ({ contactId, taskId, ...data }) => {
      try {
        const client = await resolveClient(env);
        const result = await client.contacts.updateContactTask(contactId, taskId, data);
        return ok(`Task updated!\n\n${JSON.stringify(result, null, 2)}`);
      } catch (e: any) {
        return err(e);
      }
    }
  );

  server.tool(
    "ghl_delete_contact_task",
    "Delete a task from a contact.",
    {
      contactId: z.string().describe("Contact ID"),
      taskId: z.string().describe("Task ID"),
    },
    async ({ contactId, taskId }) => {
      try {
        const client = await resolveClient(env);
        await client.contacts.deleteContactTask(contactId, taskId);
        return ok(`Task ${taskId} deleted.`);
      } catch (e: any) {
        return err(e);
      }
    }
  );
}
