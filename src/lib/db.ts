import { IDBPObjectStore, openDB } from "idb";
import { Note, NoteQuery } from "./types";

export type CreateNoteSubscriber = (newNote: Note) => void;

export interface IdeaBinDatabase {
  createNote(note: Note): Promise<Note>;
  getNote(noteId: number): Promise<Note | null>;
  updateNote(note: Partial<Note>): Promise<void>;
  deleteNote(noteId: number): Promise<void>;
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

  async function updateNote(note: Partial<Note>) {
    if (note.id) {
      const retrievedNote = await db.get("notes", note.id);

      if (retrievedNote) {
        await db.put("notes", {
          ...retrievedNote,
          ...note,
        });
      }
    }
  }

  async function getCursorForQuery(
    store: IDBPObjectStore<
      {
        notes: Note;
      },
      ["notes"],
      "notes",
      "readonly"
    >,
    query?: NoteQuery
  ) {
    if (query) {
      if ("parentId" in query) {
        const index = store.index("parentId");

        return index.openCursor(
          query.parentId,
          query?.sortOrder === "asc" ? undefined : "prev"
        );
      }
    }

    const index = store.index("createdAt");

    return index.openCursor(
      null,
      query?.sortOrder === "asc" ? undefined : "prev"
    );
  }

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

      if (note.parentId) {
        await updateNote({
          id: note.parentId,
          hasRevisions: true,
        });
      }

      createSubscribers.forEach((subscriber) => subscriber(hydratedNote));

      return hydratedNote;
    },
    async getNote(id) {
      const rawNote = await db.get("notes", id);

      if (rawNote) {
        return transform(rawNote);
      }

      return null;
    },
    updateNote,
    async deleteNote(id) {
      await db.delete("notes", id);
    },
    async queryNotes(query, offset = 0, limit = 10) {
      const tx = db.transaction("notes");
      const store = tx.objectStore("notes");
      let cursor = await getCursorForQuery(store, query);

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
