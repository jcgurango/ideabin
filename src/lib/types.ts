export const EMPTY_NOTE: Note = {
  text: "",
  tags: [],
  version: 1,
};

export type FileType = "audio" | "image" | "video" | "blob";

export interface Note {
  id?: number;
  text: string;
  tags: string[];
  file?: Blob;
  filename?: string;
  fileType?: FileType;
  version: number;
  parentNote?: number;
  createdAt?: Date;
  updatedAt?: Date;
}
