import Database from "@tauri-apps/plugin-sql";

export interface Note {
  id: number;
  title: string;
  body: string;
  pinned: number;
  created_at: number;
  updated_at: number;
}

let dbPromise: Promise<Database> | null = null;

// SQLite file lives in the app's data folder on this device, so everything works offline.
function getDb() {
  if (!dbPromise) {
    dbPromise = Database.load("sqlite:netsom_note.db").then(async (db) => {
      await db.execute(
        `CREATE TABLE IF NOT EXISTS notes (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL DEFAULT '',
          body TEXT NOT NULL DEFAULT '',
          pinned INTEGER NOT NULL DEFAULT 0,
          created_at INTEGER NOT NULL,
          updated_at INTEGER NOT NULL
        )`,
      );
      return db;
    });
  }
  return dbPromise;
}

export async function listNotes(): Promise<Note[]> {
  const db = await getDb();
  return db.select<Note[]>(
    "SELECT * FROM notes ORDER BY pinned DESC, updated_at DESC",
  );
}

export async function createNote(): Promise<Note> {
  const db = await getDb();
  const now = Date.now();
  const res = await db.execute(
    "INSERT INTO notes (title, body, pinned, created_at, updated_at) VALUES ('', '', 0, $1, $1)",
    [now],
  );
  return {
    id: res.lastInsertId as number,
    title: "",
    body: "",
    pinned: 0,
    created_at: now,
    updated_at: now,
  };
}

export async function saveNote(id: number, title: string, body: string) {
  const db = await getDb();
  const now = Date.now();
  await db.execute(
    "UPDATE notes SET title = $1, body = $2, updated_at = $3 WHERE id = $4",
    [title, body, now, id],
  );
  return now;
}

export async function setPinned(id: number, pinned: boolean) {
  const db = await getDb();
  await db.execute("UPDATE notes SET pinned = $1 WHERE id = $2", [
    pinned ? 1 : 0,
    id,
  ]);
}

export async function deleteNote(id: number) {
  const db = await getDb();
  await db.execute("DELETE FROM notes WHERE id = $1", [id]);
}
