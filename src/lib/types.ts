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
  hasRevisions?: boolean;
}

export type NoteQuery = {
  sortOrder?: SortOrder;
} & (
  | {
      startDate?: Date;
      endDate: Date;
    }
  | {
      startDate: Date;
      endDate?: Date;
    }
  | {
      parentId: number;
    }
  | {
      tag: string;
    }
);
