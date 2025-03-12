import { FileType } from "@/lib/types";
import AudioPlayer from "./audio-player";
import { PhotoProvider, PhotoView } from "react-photo-view";
import { useEffect, useState } from "react";
import { File } from "lucide-react";
import { Button } from "./ui/button";
import { getAmplitudeDataFromFile } from "@/lib/audio";

export default function FilePreview({
  file,
  filename,
  fileType,
  audioAmplitudeData,
}: {
  file: Blob;
  filename: string;
  fileType: FileType;
  audioAmplitudeData?: number[];
}) {
  const [fileUrl, setFileUrl] = useState<string>();
  const [generatedAmplitudeData, setGeneratedAmplitudeData] = useState<number[]>([]);

  useEffect(() => {
    setFileUrl(URL.createObjectURL(file));

    if (fileType === 'audio') {
      setGeneratedAmplitudeData([]);
      let cancelled = false;
      
      (async () => {
        const rms = await getAmplitudeDataFromFile(file);
        setGeneratedAmplitudeData(rms);
      })();

      return () => {
        cancelled = true;
      };
    }
  }, [file, fileType]);

  return (
    <>
      {fileType === "audio" && fileUrl ? (
        <AudioPlayer amplitudeData={audioAmplitudeData || generatedAmplitudeData} audioUrl={fileUrl} />
      ) : null}
      {fileType === "image" ? (
        <PhotoProvider>
          <PhotoView src={fileUrl}>
            <img
              src={fileUrl}
              alt="Uploaded file"
              className="max-h-50 ml-auto mr-auto"
            />
          </PhotoView>
        </PhotoProvider>
      ) : null}
      {fileType === "video" ? (
        <video className="max-h-50 bg-black w-full" controls>
          <source src={fileUrl} />
        </video>
      ) : null}
      {fileType === "blob" ? (
        <Button
          variant="secondary"
          onClick={() => {
            window.open(fileUrl, "_blank");
          }}
        >
          <File /> {filename}
        </Button>
      ) : null}
    </>
  );
}
