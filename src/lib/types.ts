interface Note {
  text: string;
  tags: string[];
  file?: string;
  fileType?: 'audio' | 'image' | 'video' | 'text';
}
