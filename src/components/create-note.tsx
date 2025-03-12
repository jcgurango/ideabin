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
  Paperclip,
  StopCircle,
  Trash2,
} from "lucide-react";
import AudioRecorder from "../components/audio-recorder";
import { ChangeEvent, useRef, useState } from "react";
import AudioPlayer from "./audio-player";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { PhotoProvider, PhotoView } from "react-photo-view";

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

export default function CreateNote() {
  const [audioAmplitudeData, setAudioAmplitudeData] = useState<number[]>([]);
  const [note, setNote] = useState<Note>({
    text: "",
    tags: [],
  });
  const [record, setRecord] = useState(false);
  const [showRecorder, setShowRecorder] = useState(false);
  const cameraPickerRef = useRef<HTMLInputElement>(null);
  const filePickerRef = useRef<HTMLInputElement>(null);

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
      const fileUrl = URL.createObjectURL(file);
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

        // STUB: Read amplitude data.
        if (file.size < 1024 * 1024 * 20) {
        } else {
          // Refuse to read process data for files > 20 MB.
          setAudioAmplitudeData([]);
        }
      }

      setNote((note) => ({
        ...note,
        file: fileUrl,
        filename,
        fileType,
      }));
    }
  }

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
            <Dialog>
              <DialogTrigger asChild>
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
          ) : null}
          {note.fileType === "image" ? (
            <PhotoProvider>
              <PhotoView src={note.file}>
                <img
                  src={note.file}
                  alt="Uploaded file"
                  className="max-h-50 ml-auto mr-auto"
                />
              </PhotoView>
            </PhotoProvider>
          ) : null}
          {note.fileType === "video" ? (
            <video className="max-h-50 bg-black w-full" controls>
              <source src={note.file} />
            </video>
          ) : null}
          {note.fileType === "blob" ? (
            <Button
              variant="secondary"
              onClick={() => {
                window.open(note.file, "_blank");
              }}
            >
              <File /> {note.filename}
            </Button>
          ) : null}
          {showRecorder ? (
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
          ) : null}
        </div>
      </CardFooter>
    </Card>
  );
}
