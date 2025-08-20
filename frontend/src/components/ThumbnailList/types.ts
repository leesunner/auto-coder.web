
export interface ThumbnailItem {
  file: File;
  path: string;
}

export interface ThumbnailListProps {
  items: ThumbnailItem[];
  onDelete: (index: number) => void;
}

export interface ThumbnailPreviewProps {
  isOpen: boolean;
  currentIndex: number;
  items: ThumbnailItem[];
  onClose: () => void;
  onPrevious: () => void;
  onNext: () => void;
}

