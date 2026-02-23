import type { SubAccount } from "../types";

export async function initDb(db: D1Database) {
  await db
    .prepare(
      `CREATE TABLE IF NOT EXISTS sub_accounts (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    api_key TEXT NOT NULL,
    account_type TEXT DEFAULT 'sub_account',
    is_default INTEGER DEFAULT 0,
    notes TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  )`
    )
    .run();
}

export async function getDefaultAccount(db: D1Database): Promise<SubAccount | null> {
  return db
    .prepare("SELECT * FROM sub_accounts WHERE is_default = 1 LIMIT 1")
    .first<SubAccount>();
}

export async function getAccountById(db: D1Database, locationId: string): Promise<SubAccount | null> {
  return db
    .prepare("SELECT * FROM sub_accounts WHERE id = ?")
    .bind(locationId)
    .first<SubAccount>();
}

export async function getAccountByName(db: D1Database, name: string): Promise<SubAccount | null> {
  return db
    .prepare("SELECT * FROM sub_accounts WHERE LOWER(name) LIKE LOWER(?)")
    .bind(`%${name}%`)
    .first<SubAccount>();
}
