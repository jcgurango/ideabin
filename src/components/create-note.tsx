"use client";
import { Textarea } from "../components/ui/textarea";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Camera, Disc, Paperclip, StopCircle, Trash2 } from "lucide-react";
import AudioRecorder from "../components/audio-recorder";
import { useState } from "react";
import AudioPlayer from "./audio-player";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";

function getTags(text: string) {
  // Based on the Twitter Text parsing library.
  const matchRegex =
    /(?:^|[^&\w])#([\p{L}\p{M}\p{Nd}_]*[\p{L}\p{M}]+[\p{L}\p{M}\p{Nd}_]*)/gu;
  const tags: string[] = [];
  let match;

  while ((match = matchRegex.exec(text))) {
    if (!tags.includes(match[1])) {
      tags.push(match[1]);
    }
  }

  return tags;
}

export default function CreateNote() {
  const [audioAmplitudeData, setAudioAmplitudeData] = useState<number[]>([]);
  const [note, setNote] = useState<Note>({
    text: "",
    tags: [],
  });
  const [record, setRecord] = useState(false);
  const [showRecorder, setShowRecorder] = useState(false);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Note</CardTitle>
      </CardHeader>
      <CardContent>
        <Textarea
          placeholder="Tip: Use #tags to make notes more searchable."
          onChange={(e) => {
            setNote((note) => ({
              ...note,
              text: e.target.value,
              tags: getTags(e.target.value),
            }));
          }}
        />
        {note.tags.length ? (
          <div className="text-gray-600 mt-2 text-sm">
            Tags: {note.tags.map((tag) => `#${tag}`).join(", ")}
          </div>
        ) : null}
      </CardContent>
      <CardFooter className="flex flex-col items-stretch">
        <div className="flex justify-start">
          {note.file ? (
            <Dialog>
              <DialogTrigger>
                <Button variant="destructive" className="mr-2">
                  <Trash2 />
                  <span className="hidden md:inline">Remove File</span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogTitle>Are you sure?</DialogTitle>
                <DialogDescription>
                  This will discard any file attached to the note. This action
                  cannot be undone.
                </DialogDescription>
                <DialogFooter>
                  <Button
                    variant="destructive"
                    type="submit"
                    onClick={() =>
                      setNote((note) => ({
                        ...note,
                        file: undefined,
                        fileType: undefined,
                      }))
                    }
                  >
                    Delete
                  </Button>
                  <Button variant="ghost" type="submit">
                    Cancel
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          ) : (
            <>
              <Button
                variant="destructive"
                className="mr-2"
                onClick={() => {
                  setRecord((rec) => !rec);
                  setShowRecorder(true);
                }}
              >
                {record ? <StopCircle /> : <Disc />}
                <span className="hidden md:inline">
                  {record ? "Stop Recording" : "Record Audio"}
                </span>
              </Button>
              <Button variant="outline" className="mr-2">
                <Camera />
                <span className="hidden md:inline">Take a Photo/Video</span>
              </Button>
              <Button variant="secondary" className="mr-2">
                <Paperclip />
                <span className="hidden md:inline">Attach File</span>
              </Button>
            </>
          )}
          <Button className="ml-auto" variant="ghost">
            Cancel
          </Button>
        </div>
        {/* File preview (if available) */}
        <div className="mt-2">
          {note.fileType === "audio" && audioAmplitudeData ? (
            <AudioPlayer
              amplitudeData={audioAmplitudeData}
              audioUrl={note.file!}
            />
          ) : showRecorder ? (
            <AudioRecorder
              recording={record}
              onRecorded={(url, amplitude) => {
                setNote((note) => ({
                  ...note,
                  file: url,
                  fileType: "audio",
                }));
                setAudioAmplitudeData(amplitude);
                setShowRecorder(false);
              }}
            />
          ) : null}
        </div>
      </CardFooter>
    </Card>
  );
}
