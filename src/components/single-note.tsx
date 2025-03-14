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
  onEdit,
  onViewRevisions,
}: {
  note: Note;
  onDelete?: () => void;
  onEdit?: () => void;
  onViewRevisions?: () => void;
}) {
  return (
    <Card>
      {note.text ? (
        <CardHeader>
          <CardTitle className="whitespace-pre-wrap">{note.text}</CardTitle>
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
        <div className="flex">
          {onDelete ? (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" className="mr-2">
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
          {onEdit ? (
            <Button
              variant="secondary"
              size="sm"
              onClick={onEdit}
              className="mr-2"
            >
              <Edit />
              <span className="hidden md:inline">Edit</span>
            </Button>
          ) : null}
          {note.version > 1 || note.hasRevisions ? (
            <Button
              variant="outline"
              size="sm"
              onClick={onViewRevisions ? () => onViewRevisions() : undefined}
              disabled={!onViewRevisions}
            >
              v{note.version}
            </Button>
          ) : null}
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
