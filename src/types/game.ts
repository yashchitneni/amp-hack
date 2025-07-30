export interface Item {
  name: string;
  overlayPath: string;
  promptFragment: string;
}

export interface GameState {
  completedItems: string[];
  currentItemIndex: number;
  capturedPhotos: { [itemName: string]: string };
  isComplete: boolean;
}

export interface ValidationResult {
  success: boolean;
  confidence?: number;
  message?: string;
}
