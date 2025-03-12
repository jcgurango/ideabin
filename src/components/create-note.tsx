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
import { Camera, Disc, Paperclip } from "lucide-react";
import AudioRecorder from "../components/audio-recorder";
import { useEffect, useState } from "react";
import { useWakeLock } from "react-screen-wake-lock";
import AudioPlayer from "./audio-player";

export default function CreateNote() {
  const [audioAmplitudeData, setAudioAmplitudeData] = useState<number[]>([]);
  const [note, setNote] = useState<Note>({
    text: '',
    tags: [],
  });
  const [record, setRecord] = useState(false);
  const {
    isSupported,
    released,
    request: requestWakeLock,
    release: releaseWakeLock,
  } = useWakeLock({
    onRequest: () => console.log("Screen Wake Lock: requested!"),
    onError: (e) => console.log("An error happened 💥", e),
    onRelease: () => console.log("Screen Wake Lock: released!"),
  });

  useEffect(() => {
    if (record && isSupported) {
      requestWakeLock();
    } else if (!released) {
      releaseWakeLock();
    }
  }, [isSupported, released, record]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Note</CardTitle>
      </CardHeader>
      <CardContent>
        <Textarea placeholder="Tip: Use #tags to make notes more searchable." />
      </CardContent>
      <CardFooter className="flex flex-col items-stretch">
        <div className="flex justify-start">
          <Button
            variant="destructive"
            className="mr-2"
            onClick={() => setRecord((rec) => !rec)}
          >
            <Disc />
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
          <Button className="ml-auto" variant="ghost">
            Cancel
          </Button>
        </div>
        {note.fileType === "audio" && audioAmplitudeData ? (
          <AudioPlayer
            amplitudeData={audioAmplitudeData}
            audioUrl={note.file!}
          />
        ) : (
          <AudioRecorder
            recording={record}
            onRecorded={(url, amplitude) => {
              setNote((note) => ({
                ...note,
                file: url,
                fileType: 'audio',
              }));
              setAudioAmplitudeData(amplitude);
            }}
          />
        )}
      </CardFooter>
    </Card>
  );
}
