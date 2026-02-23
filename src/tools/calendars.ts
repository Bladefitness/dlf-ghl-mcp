import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { Env } from "../types";
import { ok, err, resolveClient } from "./_helpers";

export function registerCalendarsTools(server: McpServer, env: Env) {
  server.tool(
    "ghl_list_calendars",
    "List all calendars in a GHL location. Shows name, ID, type, and status.",
    { locationId: z.string().optional().describe("Target location (uses default if omitted)") },
    async ({ locationId }) => {
      try {
        const client = await resolveClient(env, locationId);
        const result = await client.calendars.listCalendars(locationId);
        const summary = (result.calendars || []).map((c: any) => ({
          id: c.id,
          name: c.name,
          calendarType: c.calendarType,
          eventType: c.eventType,
          isActive: c.isActive,
          slotDuration: `${c.slotDuration} ${c.slotDurationUnit}`,
        }));
        return ok(`${summary.length} calendar(s):\n\n${JSON.stringify(summary, null, 2)}`);
      } catch (e: any) {
        return err(e);
      }
    }
  );

  server.tool(
    "ghl_get_calendar",
    "Get full details for a specific calendar by ID.",
    { calendarId: z.string().describe("Calendar ID") },
    async ({ calendarId }) => {
      try {
        const client = await resolveClient(env);
        const result = await client.calendars.getCalendar(calendarId);
        return ok(JSON.stringify(result, null, 2));
      } catch (e: any) {
        return err(e);
      }
    }
  );

  server.tool(
    "ghl_get_calendar_free_slots",
    "Get available booking slots for a calendar in a date range.",
    {
      calendarId: z.string().describe("Calendar ID"),
      startDate: z.string().describe("Start date (YYYY-MM-DD)"),
      endDate: z.string().describe("End date (YYYY-MM-DD)"),
      timezone: z.string().optional().describe("Timezone (e.g. America/New_York)"),
    },
    async ({ calendarId, startDate, endDate, timezone }) => {
      try {
        const client = await resolveClient(env);
        const result = await client.calendars.getCalendarFreeSlots(calendarId, startDate, endDate, timezone);
        return ok(JSON.stringify(result, null, 2));
      } catch (e: any) {
        return err(e);
      }
    }
  );

  server.tool(
    "ghl_list_calendar_events",
    "List appointments/events for a calendar within a date range. Provide dates as ISO 8601 strings — they are converted to epoch millis automatically.",
    {
      calendarId: z.string().describe("Calendar ID"),
      startTime: z.string().describe("Start time (ISO 8601 e.g. 2026-02-13T00:00:00Z, or epoch millis)"),
      endTime: z.string().describe("End time (ISO 8601 e.g. 2026-02-20T23:59:59Z, or epoch millis)"),
      locationId: z.string().optional().describe("Target location"),
    },
    async ({ calendarId, startTime, endTime, locationId }) => {
      try {
        const client = await resolveClient(env, locationId);
        // Convert ISO dates to epoch millis if needed (GHL requires millis)
        const toMillis = (t: string) => {
          if (/^\d+$/.test(t)) return t; // already millis
          return String(new Date(t).getTime());
        };
        const result = await client.calendars.listCalendarEvents(
          calendarId,
          toMillis(startTime),
          toMillis(endTime),
          locationId
        );
        const events = result.events || [];
        if (events.length === 0) return ok("No events found in this date range.");
        const summary = events.map((e: any) => ({
          id: e.id,
          title: e.title,
          startTime: e.startTime,
          endTime: e.endTime,
          status: e.appointmentStatus,
          contactId: e.contactId,
          calendarId: e.calendarId,
          assignedUserId: e.assignedUserId,
          address: e.address,
          notes: e.notes,
        }));
        return ok(`${events.length} event(s):\n\n${JSON.stringify(summary, null, 2)}`);
      } catch (e: any) {
        return err(e);
      }
    }
  );

  server.tool(
    "ghl_get_appointment",
    "Get full details for a specific appointment by ID.",
    { eventId: z.string().describe("Appointment/event ID") },
    async ({ eventId }) => {
      try {
        const client = await resolveClient(env);
        const result = await client.calendars.getAppointment(eventId);
        return ok(JSON.stringify(result, null, 2));
      } catch (e: any) {
        return err(e);
      }
    }
  );

  server.tool(
    "ghl_create_appointment",
    "Book a new appointment on a calendar for a contact.",
    {
      calendarId: z.string().describe("Calendar ID to book on"),
      contactId: z.string().describe("Contact ID for the appointment"),
      startTime: z.string().describe("Start time (ISO 8601)"),
      endTime: z.string().describe("End time (ISO 8601)"),
      title: z.string().optional().describe("Appointment title"),
      appointmentStatus: z
        .enum(["confirmed", "new", "showed", "noshow", "cancelled", "invalid"])
        .optional()
        .describe("Status"),
      assignedUserId: z.string().optional().describe("Assign to a team member user ID"),
      address: z.string().optional().describe("Address for the appointment"),
      toNotify: z.boolean().optional().describe("Send notification to assignee"),
      locationId: z.string().optional().describe("Target location"),
    },
    async (args) => {
      try {
        const client = await resolveClient(env, args.locationId);
        const result = await client.calendars.createAppointment(args);
        return ok(`Appointment created!\n\n${JSON.stringify(result, null, 2)}`);
      } catch (e: any) {
        return err(e);
      }
    }
  );

  server.tool(
    "ghl_update_appointment",
    "Update an existing appointment (status, time, title, etc.).",
    {
      eventId: z.string().describe("Appointment ID to update"),
      startTime: z.string().optional().describe("New start time"),
      endTime: z.string().optional().describe("New end time"),
      title: z.string().optional().describe("New title"),
      appointmentStatus: z
        .enum(["confirmed", "new", "showed", "noshow", "cancelled", "invalid"])
        .optional()
        .describe("New status"),
      address: z.string().optional().describe("New address"),
      assignedUserId: z.string().optional().describe("Reassign to user"),
    },
    async ({ eventId, ...data }) => {
      try {
        const client = await resolveClient(env);
        const result = await client.calendars.updateAppointment(eventId, data);
        return ok(`Appointment updated!\n\n${JSON.stringify(result, null, 2)}`);
      } catch (e: any) {
        return err(e);
      }
    }
  );

  server.tool(
    "ghl_delete_appointment",
    "Delete/cancel an appointment by ID.",
    { eventId: z.string().describe("Appointment ID to delete") },
    async ({ eventId }) => {
      try {
        const client = await resolveClient(env);
        await client.calendars.deleteAppointment(eventId);
        return ok(`Appointment ${eventId} deleted.`);
      } catch (e: any) {
        return err(e);
      }
    }
  );

  server.tool(
    "ghl_list_blocked_slots",
    "List blocked time slots on a calendar in a date range. Dates auto-convert to epoch millis.",
    {
      calendarId: z.string().describe("Calendar ID"),
      startTime: z.string().describe("Start time (ISO 8601 or epoch millis)"),
      endTime: z.string().describe("End time (ISO 8601 or epoch millis)"),
      locationId: z.string().optional().describe("Target location"),
    },
    async ({ calendarId, startTime, endTime, locationId }) => {
      try {
        const client = await resolveClient(env, locationId);
        const toMillis = (t: string) => {
          if (/^\d+$/.test(t)) return t;
          return String(new Date(t).getTime());
        };
        const result = await client.calendars.listBlockedSlots(
          calendarId,
          toMillis(startTime),
          toMillis(endTime),
          locationId
        );
        return ok(JSON.stringify(result, null, 2));
      } catch (e: any) {
        return err(e);
      }
    }
  );

  server.tool(
    "ghl_create_blocked_slot",
    "Block a time slot on a calendar.",
    {
      calendarId: z.string().describe("Calendar ID"),
      startTime: z.string().describe("Block start (ISO 8601)"),
      endTime: z.string().describe("Block end (ISO 8601)"),
      title: z.string().optional().describe("Reason/title for the block"),
      locationId: z.string().optional().describe("Target location"),
    },
    async (args) => {
      try {
        const client = await resolveClient(env, args.locationId);
        const result = await client.calendars.createBlockedSlot(args);
        return ok(`Blocked slot created!\n\n${JSON.stringify(result, null, 2)}`);
      } catch (e: any) {
        return err(e);
      }
    }
  );

  server.tool(
    "ghl_delete_blocked_slot",
    "Remove a blocked slot from a calendar.",
    { slotId: z.string().describe("Blocked slot ID") },
    async ({ slotId }) => {
      try {
        const client = await resolveClient(env);
        await client.calendars.deleteBlockedSlot(slotId);
        return ok(`Blocked slot ${slotId} deleted.`);
      } catch (e: any) {
        return err(e);
      }
    }
  );
}
