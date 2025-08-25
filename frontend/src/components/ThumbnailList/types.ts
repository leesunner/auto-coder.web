export interface ThumbnailItem {
  file: File;
  path: string;
}

export interface ThumbnailListProps {
  onDelete?: (index: number) => void;
  onChange?: (files: ThumbnailItem[]) => void;
  ref?: any;
}
