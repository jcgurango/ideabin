"use client";
import CreateNote from "@/components/create-note";
import NoteList from "@/components/note-list";
import SingleNote from "@/components/single-note";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Note } from "@/lib/types";
import { useDb } from "@/providers/database-provider";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Home() {
  const db = useDb();
  const [resetter, setResetter] = useState(() => Math.random());
  const [initialNote, setInitialNote] = useState<Note>();
  const [revisionsParent, setRevisionsParent] = useState<Note>();

  useEffect(() => {
    return db.onCreate(() => {
      setResetter(Math.random());
    });
  }, [db]);

  return (
    <div>
      <div className="sticky x-0 top-0 m-2 z-1">
        <CreateNote initialNote={initialNote} />
      </div>
      <Link href="/scale-matcher">Scales</Link>
      <NoteList
        key={resetter}
        onDelete={async (note) => {
          await db.deleteNote(note.id!);
          setResetter(Math.random());
        }}
        onEdit={({ id, version, createdAt, updatedAt, parentId, ...note }) => {
          setInitialNote({
            ...note,
            version: version + 1,
            parentId: parentId || id,
          });
        }}
        onViewRevisions={async (noteId) => {
          const note = await db.getNote(noteId);

          if (note) {
            setRevisionsParent(note);
          }
        }}
      />
      <Drawer
        open={!!revisionsParent}
        onClose={() => setRevisionsParent(undefined)}
      >
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Note Revisions</DrawerTitle>
          </DrawerHeader>
          <div className="h-auto overflow-y-auto">
            {revisionsParent ? (
              <>
                <div className="sticky p-2">
                  <SingleNote note={revisionsParent} />
                </div>
                <NoteList
                  key={resetter}
                  query={{
                    parentId: revisionsParent.id!,
                  }}
                />
              </>
            ) : null}
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
