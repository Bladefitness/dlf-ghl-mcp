import { BaseGHLClient } from "./base";
import { calendarMethods } from "./calendars";
import { contactMethods } from "./contacts";
import { conversationMethods } from "./conversations";
import { opportunityMethods } from "./opportunities";
import { paymentMethods } from "./payments";
import { marketingMethods } from "./marketing";
import { automationMethods } from "./automation";
import { aiAgentMethods } from "./ai-agents";
import { locationMethods } from "./locations";
import { contentMethods } from "./content";
import { miscMethods } from "./misc";
import type { GHLClientConfig } from "../types";

export class GHLClient extends BaseGHLClient {
  calendars: ReturnType<typeof calendarMethods>;
  contacts: ReturnType<typeof contactMethods>;
  conversations: ReturnType<typeof conversationMethods>;
  opportunities: ReturnType<typeof opportunityMethods>;
  payments: ReturnType<typeof paymentMethods>;
  marketing: ReturnType<typeof marketingMethods>;
  automation: ReturnType<typeof automationMethods>;
  aiAgents: ReturnType<typeof aiAgentMethods>;
  locations: ReturnType<typeof locationMethods>;
  content: ReturnType<typeof contentMethods>;
  misc: ReturnType<typeof miscMethods>;

  constructor(config: GHLClientConfig) {
    super(config);
    this.calendars = calendarMethods(this);
    this.contacts = contactMethods(this);
    this.conversations = conversationMethods(this);
    this.opportunities = opportunityMethods(this);
    this.payments = paymentMethods(this);
    this.marketing = marketingMethods(this);
    this.automation = automationMethods(this);
    this.aiAgents = aiAgentMethods(this);
    this.locations = locationMethods(this);
    this.content = contentMethods(this);
    this.misc = miscMethods(this);
  }
}

export { BaseGHLClient };
export * from "./calendars";
export * from "./contacts";
export * from "./conversations";
export * from "./opportunities";
export * from "./payments";
export * from "./marketing";
export * from "./automation";
export * from "./ai-agents";
export * from "./locations";
export * from "./content";
export * from "./misc";
