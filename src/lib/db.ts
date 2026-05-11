import Database from "better-sqlite3";
import fs from "fs";
import path from "path";

const dbPath = path.resolve(process.env.DB_PATH ?? "./data/diary.db");

fs.mkdirSync(path.dirname(dbPath), { recursive: true });

const db = new Database(dbPath);

db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS entries (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    date       TEXT    NOT NULL UNIQUE,
    content    TEXT    NOT NULL DEFAULT '',
    mood       TEXT,
    created_at TEXT    NOT NULL DEFAULT (datetime('now','localtime')),
    updated_at TEXT    NOT NULL DEFAULT (datetime('now','localtime'))
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS comments (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    date       TEXT    NOT NULL,
    content    TEXT    NOT NULL DEFAULT '',
    created_at TEXT    NOT NULL DEFAULT (datetime('now','localtime')),
    updated_at TEXT    NOT NULL DEFAULT (datetime('now','localtime'))
  )
`);

try {
  db.exec("ALTER TABLE entries ADD COLUMN mood TEXT");
} catch {
  // mood 컬럼이 이미 존재하면 무시
}

export interface Entry {
  id: number;
  date: string;
  content: string;
  mood: string | null;
  created_at: string;
  updated_at: string;
}

export interface Comment {
  id: number;
  date: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export function getEntry(date: string): Entry | null {
  return (
    (db.prepare("SELECT * FROM entries WHERE date = ?").get(date) as Entry) ??
    null
  );
}

export function upsertMood(date: string, mood: string | null): void {
  db.prepare(
    `INSERT INTO entries (date, mood)
     VALUES (?, ?)
     ON CONFLICT(date) DO UPDATE SET
       mood       = excluded.mood,
       updated_at = datetime('now','localtime')`
  ).run(date, mood);
}

export function deleteEntry(date: string): void {
  db.prepare("DELETE FROM entries WHERE date = ?").run(date);
}

export function getMonthEntries(year: string, month: string): Map<string, string | null> {
  const prefix = `${year}-${month.padStart(2, "0")}-`;

  const entryRows = db
    .prepare("SELECT date, mood FROM entries WHERE date LIKE ? AND mood IS NOT NULL")
    .all(`${prefix}%`) as { date: string; mood: string }[];

  const commentRows = db
    .prepare("SELECT DISTINCT date FROM comments WHERE date LIKE ?")
    .all(`${prefix}%`) as { date: string }[];

  const result = new Map<string, string | null>();

  for (const row of entryRows) {
    result.set(row.date, row.mood);
  }
  for (const row of commentRows) {
    if (!result.has(row.date)) {
      result.set(row.date, null);
    }
  }

  return result;
}

export function getComments(date: string): Comment[] {
  return db
    .prepare("SELECT * FROM comments WHERE date = ? ORDER BY created_at ASC")
    .all(date) as Comment[];
}

export function addComment(date: string, content: string): Comment {
  const result = db
    .prepare("INSERT INTO comments (date, content) VALUES (?, ?)")
    .run(date, content);
  return db
    .prepare("SELECT * FROM comments WHERE id = ?")
    .get(result.lastInsertRowid) as Comment;
}

export function updateComment(id: number, content: string): Comment {
  db.prepare(
    "UPDATE comments SET content = ?, updated_at = datetime('now','localtime') WHERE id = ?"
  ).run(content, id);
  return db.prepare("SELECT * FROM comments WHERE id = ?").get(id) as Comment;
}

export function deleteComment(id: number): void {
  db.prepare("DELETE FROM comments WHERE id = ?").run(id);
}
