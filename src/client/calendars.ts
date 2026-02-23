import { BaseGHLClient } from "./base";

export function calendarMethods(client: BaseGHLClient) {
  return {
    async listCalendars(locationId?: string) {
      return client.request<{ calendars: any[] }>("GET", `/calendars/`, {
        query: { locationId: locationId || client.locationId },
        version: "2021-07-28",
      });
    },

    async getCalendar(calendarId: string) {
      return client.request<{ calendar: any }>("GET", `/calendars/${calendarId}`, {
        version: "2021-07-28",
      });
    },

    async createCalendar(data: any) {
      return client.request<{ calendar: any }>("POST", `/calendars/`, {
        body: { ...data, locationId: data.locationId || client.locationId },
        version: "2021-07-28",
      });
    },

    async updateCalendar(calendarId: string, data: any) {
      return client.request<{ calendar: any }>("PUT", `/calendars/${calendarId}`, {
        body: data,
        version: "2021-07-28",
      });
    },

    async deleteCalendar(calendarId: string) {
      return client.request<any>("DELETE", `/calendars/${calendarId}`, {
        version: "2021-07-28",
      });
    },

    async getCalendarFreeSlots(calendarId: string, startDate: string, endDate: string, timezone?: string) {
      const query: Record<string, string> = { startDate, endDate };
      if (timezone) query.timezone = timezone;
      return client.request<any>("GET", `/calendars/${calendarId}/free-slots`, {
        query,
        version: "2021-07-28",
      });
    },

    async listCalendarEvents(calendarId: string, startTime: string, endTime: string, locationId?: string) {
      return client.request<{ events: any[] }>("GET", `/calendars/events`, {
        query: { calendarId, startTime, endTime, locationId: locationId || client.locationId },
        version: "2021-04-15",
      });
    },

    async getAppointment(eventId: string) {
      return client.request<any>("GET", `/calendars/events/appointments/${eventId}`, {
        version: "2021-04-15",
      });
    },

    async createAppointment(data: any) {
      return client.request<any>("POST", `/calendars/events/appointments`, {
        body: { ...data, locationId: data.locationId || client.locationId },
        version: "2021-04-15",
      });
    },

    async updateAppointment(eventId: string, data: any) {
      return client.request<any>("PUT", `/calendars/events/appointments/${eventId}`, {
        body: data,
        version: "2021-04-15",
      });
    },

    async deleteAppointment(eventId: string) {
      return client.request<any>("DELETE", `/calendars/events/appointments/${eventId}`, {
        version: "2021-04-15",
      });
    },

    async listBlockedSlots(calendarId: string, startTime: string, endTime: string, locationId?: string) {
      return client.request<any>("GET", `/calendars/blocked-slots`, {
        query: { calendarId, startTime, endTime, locationId: locationId || client.locationId },
        version: "2021-04-15",
      });
    },

    async createBlockedSlot(data: any) {
      return client.request<any>("POST", `/calendars/blocked-slots`, {
        body: { ...data, locationId: data.locationId || client.locationId },
        version: "2021-04-15",
      });
    },

    async updateBlockedSlot(slotId: string, data: any) {
      return client.request<any>("PUT", `/calendars/blocked-slots/${slotId}`, {
        body: data,
        version: "2021-04-15",
      });
    },

    async deleteBlockedSlot(slotId: string) {
      return client.request<any>("DELETE", `/calendars/blocked-slots/${slotId}`, {
        version: "2021-04-15",
      });
    },

    async listCalendarGroups(locationId?: string) {
      return client.request<any>("GET", `/calendars/groups`, {
        query: { locationId: locationId || client.locationId },
        version: "2021-04-15",
      });
    },

    async getCalendarGroup(groupId: string) {
      return client.request<any>("GET", `/calendars/groups/${groupId}`, {
        version: "2021-04-15",
      });
    },

    async createCalendarGroup(data: any) {
      return client.request<any>("POST", `/calendars/groups`, {
        body: data,
        version: "2021-04-15",
      });
    },

    async updateCalendarGroup(groupId: string, data: any) {
      return client.request<any>("PUT", `/calendars/groups/${groupId}`, {
        body: data,
        version: "2021-04-15",
      });
    },

    async deleteCalendarGroup(groupId: string) {
      return client.request<any>("DELETE", `/calendars/groups/${groupId}`, {
        version: "2021-04-15",
      });
    },

    async validateGroupSlug(data: any) {
      return client.request<any>("POST", `/calendars/groups/validate-slug`, {
        body: data,
        version: "2021-04-15",
      });
    },
  };
}
