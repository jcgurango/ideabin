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
import {
  Camera,
  Disc,
  File,
  FileX,
  Paperclip,
  StopCircle,
  Trash2,
} from "lucide-react";
import AudioRecorder from "../components/audio-recorder";
import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import { EMPTY_NOTE, FileType, Note } from "@/lib/types";
import AsyncButton from "./ui/async-button";
import { useDb } from "@/providers/database-provider";
import FilePreview from "./file-preview";

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

function formatDate(date: Date) {
  const pad = (num: number) => String(num).padStart(2, "0");

  const YYYY = date.getFullYear();
  const MM = pad(date.getMonth() + 1); // Months are 0-based
  const DD = pad(date.getDate());
  const HH = pad(date.getHours());
  const mm = pad(date.getMinutes());
  const SS = pad(date.getSeconds());

  return `${YYYY}${MM}${DD}-${HH}_${mm}_${SS}`;
}

export default function CreateNote({ initialNote }: { initialNote?: Note }) {
  const db = useDb();
  const [audioAmplitudeData, setAudioAmplitudeData] = useState<number[]>();
  const [note, setNote] = useState<Note>(EMPTY_NOTE);
  const [record, setRecord] = useState(false);
  const [showRecorder, setShowRecorder] = useState(false);
  const cameraPickerRef = useRef<HTMLInputElement>(null);
  const filePickerRef = useRef<HTMLInputElement>(null);
  const fileUrl = useMemo(() => {
    if (note.file) {
      return URL.createObjectURL(note.file);
    }
  }, [note.file]);

  useEffect(() => {
    if (initialNote) {
      setNote(initialNote);
    }
  }, [initialNote]);

  function requestCamera() {
    if (cameraPickerRef.current) {
      cameraPickerRef.current.files = null;
      cameraPickerRef.current.click();
    }
  }

  function requestFile() {
    if (filePickerRef.current) {
      filePickerRef.current.files = null;
      filePickerRef.current.click();
    }
  }

  function handleFileChanged(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];

    if (file) {
      const filename = file.name;
      let fileType: FileType = "blob";

      // Determine type.
      if (file.type.startsWith("image/")) {
        // Image
        fileType = "image";
      } else if (file.type.startsWith("video/")) {
        // Video
        fileType = "video";
      } else if (file.type.startsWith("audio/")) {
        // Audio
        fileType = "audio";
      }

      setNote((note) => ({
        ...note,
        file,
        filename,
        fileType,
      }));
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>{note.parentId ? "Create Revision" : "Create New Note"}</span>
          {note.parentId ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setNote(EMPTY_NOTE)}
            >
              <FileX />
            </Button>
          ) : null}
        </CardTitle>
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
          value={note.text}
        />
        {note.tags.length ? (
          <div className="text-gray-600 mt-2 text-sm">
            Tags: {note.tags.map((tag) => `#${tag}`).join(", ")}
          </div>
        ) : null}
      </CardContent>
      <CardFooter className="flex flex-col items-stretch">
        <div className="hidden">
          <input
            type="file"
            accept="image/*, video/*"
            capture="environment"
            ref={cameraPickerRef}
            onChange={handleFileChanged}
          />
          <input type="file" ref={filePickerRef} onChange={handleFileChanged} />
        </div>
        <div className="flex justify-start">
          {note.file ? (
            <Button
              variant="destructive"
              className="mr-2"
              onClick={() =>
                setNote((note) => ({
                  ...note,
                  file: undefined,
                  fileType: undefined,
                }))
              }
            >
              <Trash2 />
              <span className="hidden md:inline">Remove File</span>
            </Button>
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
              <Button
                variant="outline"
                className="mr-2"
                onClick={requestCamera}
              >
                <Camera />
                <span className="hidden md:inline">Take a Photo/Video</span>
              </Button>
              <Button
                variant="secondary"
                className="mr-2"
                onClick={requestFile}
              >
                <Paperclip />
                <span className="hidden md:inline">Attach File</span>
              </Button>
            </>
          )}
          <AsyncButton
            className="ml-auto"
            disabled={!note.text && !note.file}
            onClick={async () => {
              await db.createNote(note);
              setNote(EMPTY_NOTE);
            }}
            onError={(e) => {
              alert("Oof it didn't work.");
              console.error(e);
            }}
          >
            Save
          </AsyncButton>
        </div>
        {fileUrl ? (
          <div className="mt-2">
            <FilePreview
              file={note.file!}
              filename={note.filename!}
              fileType={note.fileType!}
              audioAmplitudeData={audioAmplitudeData}
            />
          </div>
        ) : null}
        {showRecorder ? (
          <div className="mt-2">
            <AudioRecorder
              recording={record}
              onRecorded={(url, amplitude) => {
                setNote((note) => ({
                  ...note,
                  file: url,
                  filename: formatDate(new Date()) + ".wav",
                  fileType: "audio",
                }));
                setAudioAmplitudeData(amplitude);
                setShowRecorder(false);
              }}
              onRecordFailed={() => {
                setRecord(false);
                setShowRecorder(false);
                alert("Media devices not available.");
              }}
            />
          </div>
        ) : null}
      </CardFooter>
    </Card>
  );
}
