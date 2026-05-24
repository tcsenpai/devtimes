import path from "node:path";
import { mkdirSync } from "node:fs";

type DBLetter = {
  id: number;
  pen_name: string;
  body: string;
  created_at: number;
  approved: number;
};

export type Letter = {
  id: number;
  penName: string;
  body: string;
  createdAt: number;
};

interface SqliteDB {
  exec(sql: string): void;
  prepare(sql: string): {
    run(...args: unknown[]): { lastInsertRowid: number | bigint };
    all(...args: unknown[]): unknown[];
  };
}

let db: SqliteDB | null = null;

async function getDB(): Promise<SqliteDB> {
  if (db) return db;
  const dir = path.join(process.cwd(), "data");
  try {
    mkdirSync(dir, { recursive: true });
  } catch {
    /* ignore */
  }
  const file = path.join(dir, "letters.db");

  // prefer bun:sqlite under Bun, fall back to better-sqlite3 under Node
  const isBun = typeof (globalThis as { Bun?: unknown }).Bun !== "undefined";
  if (isBun) {
    const mod = (await import("bun:sqlite" as string)) as {
      Database: new (file: string) => SqliteDB & { exec(sql: string): void };
    };
    const inst = new mod.Database(file);
    inst.exec("PRAGMA journal_mode = WAL;");
    inst.exec(`
      CREATE TABLE IF NOT EXISTS letters (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        pen_name TEXT NOT NULL,
        body TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        approved INTEGER NOT NULL DEFAULT 1
      );
      CREATE INDEX IF NOT EXISTS idx_letters_recent ON letters(created_at DESC);
    `);
    db = inst;
  } else {
    const mod = (await import("better-sqlite3")) as unknown as {
      default: new (file: string) => SqliteDB & { pragma(p: string): void };
    };
    const inst = new mod.default(file);
    inst.pragma("journal_mode = WAL");
    inst.exec(`
      CREATE TABLE IF NOT EXISTS letters (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        pen_name TEXT NOT NULL,
        body TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        approved INTEGER NOT NULL DEFAULT 1
      );
      CREATE INDEX IF NOT EXISTS idx_letters_recent ON letters(created_at DESC);
    `);
    db = inst;
  }
  return db;
}

const NAME_MAX = 40;
const BODY_MAX = 360;
const BODY_MIN = 8;

function clamp(s: string, max: number) {
  return s.slice(0, max);
}

function sanitize(s: string): string {
  return s
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export async function insertLetter(
  penNameRaw: string,
  bodyRaw: string
): Promise<{ ok: true; letter: Letter } | { ok: false; error: string }> {
  const penName = clamp(sanitize(penNameRaw || "Anonymous"), NAME_MAX) || "Anonymous";
  const body = clamp(sanitize(bodyRaw), BODY_MAX);
  if (body.length < BODY_MIN) return { ok: false, error: "letter too short" };
  const now = Date.now();
  const dbInst = await getDB();
  const info = dbInst
    .prepare("INSERT INTO letters (pen_name, body, created_at, approved) VALUES (?, ?, ?, 1)")
    .run(penName, body, now);
  const id = Number(info.lastInsertRowid);
  return { ok: true, letter: { id, penName, body, createdAt: now } };
}

export async function listLetters(limit = 20): Promise<Letter[]> {
  const dbInst = await getDB();
  const rows = dbInst
    .prepare(
      "SELECT id, pen_name, body, created_at, approved FROM letters WHERE approved = 1 ORDER BY created_at DESC LIMIT ?"
    )
    .all(limit) as DBLetter[];
  return rows.map((r) => ({
    id: r.id,
    penName: r.pen_name,
    body: r.body,
    createdAt: r.created_at,
  }));
}
