export const EMPTY_NOTE: Note = {
  text: "",
  tags: [],
  version: 1,
};

export type FileType = "audio" | "image" | "video" | "blob";
export type SortOrder = "asc" | "desc";

export interface Note {
  id?: number;
  text: string;
  tags: string[];
  file?: Blob;
  filename?: string;
  fileType?: FileType;
  version: number;
  parentId?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface NoteQuery {
  startDate?: Date;
  endDate?: Date;
  sortOrder: SortOrder;
}
