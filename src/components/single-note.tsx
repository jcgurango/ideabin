import { Note } from "@/lib/types";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import FilePreview from "./file-preview";
import { Button } from "./ui/button";
import { Edit, Trash } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog";

export default function SingleNote({
  note,
  onDelete,
}: {
  note: Note;
  onDelete?: () => void;
}) {
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
      <CardFooter className="text-sm justify-between items-center">
        <div className="grid grid-cols-2 gap-2">
          {onDelete ? (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <Trash />
                  <span className="hidden md:inline">Delete</span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This note will be deleted permanently.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => onDelete()}>
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          ) : null}
          <Button variant="secondary" size="sm">
            <Edit />
            <span className="hidden md:inline">Edit</span>
          </Button>
        </div>
        <div>
          {note.createdAt?.toLocaleDateString()}
          &nbsp;
          {note.createdAt?.toLocaleTimeString()}
        </div>
      </CardFooter>
    </Card>
  );
}
