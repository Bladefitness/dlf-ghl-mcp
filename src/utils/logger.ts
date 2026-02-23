import { CONFIG } from "../config";

function redact(obj: any): any {
  if (!obj || typeof obj !== "object") return obj;
  const out: any = Array.isArray(obj) ? [...obj] : { ...obj };
  for (const key of Object.keys(out)) {
    if (CONFIG.LOGGING.REDACT_KEYS.some((k) => key.toLowerCase().includes(k))) {
      out[key] = "[REDACTED]";
    } else if (typeof out[key] === "object") {
      out[key] = redact(out[key]);
    }
  }
  return out;
}

export class Logger {
  constructor(private context: string) {}

  info(msg: string, data?: any) {
    console.log(JSON.stringify({ ts: new Date().toISOString(), lvl: "info", ctx: this.context, msg, ...(data ? { data: redact(data) } : {}) }));
  }

  warn(msg: string, data?: any) {
    console.warn(JSON.stringify({ ts: new Date().toISOString(), lvl: "warn", ctx: this.context, msg, ...(data ? { data: redact(data) } : {}) }));
  }

  error(msg: string, error?: Error, data?: any) {
    console.error(JSON.stringify({ ts: new Date().toISOString(), lvl: "error", ctx: this.context, msg, err: error?.message, stack: error?.stack, ...(data ? { data: redact(data) } : {}) }));
  }
}
