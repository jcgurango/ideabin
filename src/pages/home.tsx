"use client";
import CreateNote from "@/components/create-note";
import NoteList from "@/components/note-list";
import { useDb } from "@/providers/database-provider";
import { useEffect, useState } from "react";

export default function Home() {
  const db = useDb();
  const [resetter, setResetter] = useState(() => Math.random());

  useEffect(() => {
    return db.onCreate(() => {
      setResetter(Math.random());
    });
  }, [db]);

  console.log(resetter);

  return (
    <div>
      <div className="sticky x-0 top-0 m-2 z-1">
        <CreateNote />
      </div>
      <NoteList key={resetter} />
    </div>
  );
}
