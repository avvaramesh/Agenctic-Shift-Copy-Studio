export interface DriveItem {
  id: string;
  name: string;
  isFolder: boolean;
  mimeType: string;
  size: number;
  formattedSize: string;
  modifiedTime?: string;
  thumbnailLink?: string;
  webViewLink?: string;
  iconLink?: string;
}

export interface FolderPathSegment {
  id: string;
  name: string;
}

export type StorageLocationType = "google_drive" | "virtual_local" | "drive_url";

export interface SelectedFolderState {
  locationType: StorageLocationType;
  folderId: string;
  folderName: string;
  folderPath: FolderPathSegment[];
  driveUrl?: string;
  totalFiles?: number;
  totalFolders?: number;
  totalSizeBytes?: number;
  selectedItems?: { id: string; name: string; isFolder: boolean }[];
  accountEmail?: string;
  accountLabel?: string;
  accessToken?: string;
  refreshToken?: string;
  tokenExpiry?: number;
  provider?: "google" | "microsoft";
}

export interface CopyOptions {
  folderNameStrategy: "same" | "copy_suffix" | "custom";
  customFolderName?: string;
  includeSubfolders: boolean;
  filterExtensions: string[]; // e.g. ['.pdf', '.png']
  duplicateHandling: "overwrite" | "skip" | "rename";
  preserveTimestamps?: boolean;
  selectedItemIds?: string[];
}

export interface CopyJobLog {
  id: string;
  timestamp: string;
  type: "info" | "success" | "warning" | "error";
  message: string;
}

export interface CopyJob {
  id: string;
  sourceFolderId: string;
  sourceFolderName: string;
  sourceLocation: StorageLocationType;
  targetFolderId: string;
  targetFolderName: string;
  targetLocation: StorageLocationType;
  createdTargetFolderId?: string;
  createdTargetFolderUrl?: string;
  status: "idle" | "in_progress" | "paused" | "completed" | "failed" | "cancelled";
  progressPercentage: number;
  filesTotal: number;
  filesCopied: number;
  filesFailed: number;
  currentFile?: string;
  speedFilesPerSec: number;
  startTime?: number;
  endTime?: number;
  options: CopyOptions;
  logs: CopyJobLog[];
  sourceRefreshToken?: string;
  sourceTokenExpiry?: number;
  targetRefreshToken?: string;
  targetTokenExpiry?: number;
}

export interface UserProfile {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  accessToken: string | null;
  refreshToken?: string | null;
  tokenExpiry?: number | null;
  provider?: "google" | "microsoft";
}
