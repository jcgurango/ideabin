import { openDB } from "idb";
import { Note } from "./types";

export interface IdeaBinDatabase {
  createNote(note: Note): Promise<string>;
}

export default async function getDb(): Promise<IdeaBinDatabase> {
  const db = await openDB<{
    notes: Note;
  }>("notes", 1, {
    upgrade(db) {
      const store = db.createObjectStore("notes", {
        keyPath: "id",
        autoIncrement: true,
      });
      store.createIndex("tags", "tags", { multiEntry: true });
      store.createIndex("createdAt", "createdAt");
      store.createIndex("updatedAt", "updatedAt");
    },
  });

  return {
    createNote: async ({ id, ...note }: Note) => {
      const now = new Date().toISOString();

      const key = await db.add("notes", {
        ...note,
        createdAt: now,
        updatedAt: now,
      });

      return key.toString();
    },
  };
}
