import { Note } from "@/lib/types";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card";
import FilePreview from "./file-preview";

export default function SingleNote({ note }: { note: Note }) {
  return (
    <Card>
      {note.text ? (
        <CardHeader>
          <CardTitle className="whitespace-pre">{note.text}</CardTitle>
          {note.tags.length ? (
            <div className="text-gray-600 mt-2 text-sm">
              Tags: {note.tags.map((tag) => `#${tag}`).join(", ")}
            </div>
          ) : null}
        </CardHeader>
      ) : null}
      {note.file ? (
        <CardContent>
          <FilePreview
            file={note.file}
            fileType={note.fileType!}
            filename={note.filename!}
          />
        </CardContent>
      ) : null}
      <CardFooter className="text-sm justify-end">
        <span>
          {note.createdAt?.toLocaleDateString()}
          &nbsp;
          {note.createdAt?.toLocaleTimeString()}
        </span>
      </CardFooter>
    </Card>
  );
}
