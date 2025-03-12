"use client";
import { NoteQuery, Note } from "@/lib/types";
import { useDb } from "@/providers/database-provider";
import { Loader2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import SingleNote from "./single-note";

export default function NoteList({ query }: { query?: NoteQuery }) {
  const db = useDb();
  const [notes, setNotes] = useState<Note[]>([]);
  const [scrollAtEnd, setScrollAtEnd] = useState(false);
  const [reachedEnd, setReachedEnd] = useState(false);
  const observer = useRef<IntersectionObserver>(null);

  useEffect(() => {
    setNotes([]);
  }, [query, db]);

  useEffect(() => {
    if ((!notes.length && !reachedEnd) || scrollAtEnd) {
      let cancelled = false;

      (async () => {
        const nextNotes = await db.queryNotes(query, notes.length);

        if (!cancelled) {
          if (nextNotes.length) {
            setNotes((notes) => notes.concat(...nextNotes));
          } else {
            setReachedEnd(true);
          }

          setScrollAtEnd(false);
        }
      })();

      return () => {
        cancelled = true;
      };
    }
  }, [query, db, scrollAtEnd, reachedEnd, notes]);

  const lastNoteRef = useCallback((node: HTMLElement | null) => {
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setScrollAtEnd(true);
      }
    });

    if (node) observer.current.observe(node);
  }, []);

  return (
    <div className="grid gap-y-2">
      {notes.map((note, i) => {
        return (
          <div ref={i === notes.length - 1 ? lastNoteRef : null} key={note.id} className="p-2">
            <SingleNote note={note} />
          </div>
        );
      })}
      <div className="text-sm flex p-4 items-center">
        {!reachedEnd ? (
          <>
            <Loader2 className="animate-spin mr-2" />
            Loading, probably...
          </>
        ) : (
          "You've reached the end."
        )}
      </div>
    </div>
  );
}
