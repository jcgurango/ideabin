import { openDB } from "idb";
import { Note, NoteQuery } from "./types";

export type CreateNoteSubscriber = (newNote: Note) => void;

export interface IdeaBinDatabase {
  createNote(note: Note): Promise<Note>;
  queryNotes(
    query?: NoteQuery,
    offset?: number,
    limit?: number
  ): Promise<Note[]>;
  onCreate(callback: CreateNoteSubscriber): () => void;
}

function transform(note: any): Note {
  return {
    ...note,
    createdAt: note.createdAt ? new Date(note.createdAt) : note.createdAt,
    updatedAt: note.updatedAt ? new Date(note.updatedAt) : note.updatedAt,
  };
}

export default async function getDb(): Promise<IdeaBinDatabase> {
  const createSubscribers: CreateNoteSubscriber[] = [];
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
      store.createIndex("parentId", "parentId");
    },
  });

  return {
    async createNote({ id, ...note }) {
      const now = new Date().toISOString();
      const newNote = {
        ...note,
        createdAt: now,
        updatedAt: now,
      };
      const key = await db.add("notes", newNote);
      const noteId = key.toString();
      const hydratedNote = transform({
        id: noteId,
        ...newNote,
      });

      createSubscribers.forEach((subscriber) => subscriber(hydratedNote));

      return hydratedNote;
    },
    async queryNotes(query, offset = 0, limit = 10) {
      const tx = db.transaction("notes");
      const store = tx.objectStore("notes");
      const index = store.index("createdAt");
      let cursor = await index.openCursor(
        null,
        query?.sortOrder === "asc" ? undefined : "prev"
      );

      if (cursor) {
        if (offset > 0) {
          cursor = await cursor.advance(offset);
        }

        const notes: Note[] = [];
        let taken = 0;

        while (taken < limit) {
          if (!cursor?.value) {
            break;
          }

          notes.push(transform(cursor.value));
          taken++;

          cursor = await cursor.continue();
        }

        return notes;
      }

      return [];
    },
    onCreate(callback) {
      createSubscribers.push(callback);

      return () => {
        createSubscribers.splice(createSubscribers.indexOf(callback), 1);
      };
    },
  };
}
