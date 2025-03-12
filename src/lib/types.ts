type FileType = "audio" | "image" | "video" | "blob";

interface Note {
  text: string;
  tags: string[];
  file?: string;
  filename?: string;
  fileType?: FileType;
}
