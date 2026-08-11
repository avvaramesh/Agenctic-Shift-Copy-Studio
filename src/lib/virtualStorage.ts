import { DriveItem } from "../types";

export interface VirtualFolder {
  id: string;
  name: string;
  parentId: string | null;
  items: DriveItem[];
}

const STORAGE_KEY = "folder_copy_studio_virtual_fs_v1";

const DEFAULT_VIRTUAL_FS: Record<string, VirtualFolder> = {
  root: {
    id: "root",
    name: "Local Storage Vault",
    parentId: null,
    items: [
      {
        id: "v_folder_1",
        name: "Project Work & Designs",
        isFolder: true,
        mimeType: "application/vnd.google-apps.folder",
        size: 0,
        formattedSize: "-",
        modifiedTime: new Date(Date.now() - 86400000 * 2).toISOString(),
      },
      {
        id: "v_folder_2",
        name: "Financial Reports 2026",
        isFolder: true,
        mimeType: "application/vnd.google-apps.folder",
        size: 0,
        formattedSize: "-",
        modifiedTime: new Date(Date.now() - 86400000 * 5).toISOString(),
      },
      {
        id: "v_folder_3",
        name: "Media & Photographs",
        isFolder: true,
        mimeType: "application/vnd.google-apps.folder",
        size: 0,
        formattedSize: "-",
        modifiedTime: new Date(Date.now() - 86400000 * 10).toISOString(),
      },
      {
        id: "v_file_101",
        name: "Project_Summary.pdf",
        isFolder: false,
        mimeType: "application/pdf",
        size: 2450000,
        formattedSize: "2.45 MB",
        modifiedTime: new Date().toISOString(),
      },
      {
        id: "v_file_102",
        name: "Architecture_Diagram.png",
        isFolder: false,
        mimeType: "image/png",
        size: 1820000,
        formattedSize: "1.82 MB",
        modifiedTime: new Date().toISOString(),
      },
    ],
  },
  v_folder_1: {
    id: "v_folder_1",
    name: "Project Work & Designs",
    parentId: "root",
    items: [
      {
        id: "v_folder_1_sub1",
        name: "Assets & Icons",
        isFolder: true,
        mimeType: "application/vnd.google-apps.folder",
        size: 0,
        formattedSize: "-",
        modifiedTime: new Date().toISOString(),
      },
      {
        id: "v_file_201",
        name: "App_UI_Design_V2.fig",
        isFolder: false,
        mimeType: "application/octet-stream",
        size: 14500000,
        formattedSize: "14.5 MB",
        modifiedTime: new Date().toISOString(),
      },
      {
        id: "v_file_202",
        name: "Client_Presentation_Deck.pptx",
        isFolder: false,
        mimeType: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        size: 8900000,
        formattedSize: "8.90 MB",
        modifiedTime: new Date().toISOString(),
      },
      {
        id: "v_file_203",
        name: "Sprint_Tasks_Tracker.xlsx",
        isFolder: false,
        mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        size: 640000,
        formattedSize: "640 KB",
        modifiedTime: new Date().toISOString(),
      },
    ],
  },
  v_folder_1_sub1: {
    id: "v_folder_1_sub1",
    name: "Assets & Icons",
    parentId: "v_folder_1",
    items: [
      {
        id: "v_file_301",
        name: "logo_colored.svg",
        isFolder: false,
        mimeType: "image/svg+xml",
        size: 42000,
        formattedSize: "42 KB",
        modifiedTime: new Date().toISOString(),
      },
      {
        id: "v_file_302",
        name: "hero_background.jpg",
        isFolder: false,
        mimeType: "image/jpeg",
        size: 3100000,
        formattedSize: "3.10 MB",
        modifiedTime: new Date().toISOString(),
      },
    ],
  },
  v_folder_2: {
    id: "v_folder_2",
    name: "Financial Reports 2026",
    parentId: "root",
    items: [
      {
        id: "v_file_401",
        name: "Q1_Budget_Statement.pdf",
        isFolder: false,
        mimeType: "application/pdf",
        size: 1200000,
        formattedSize: "1.20 MB",
        modifiedTime: new Date().toISOString(),
      },
      {
        id: "v_file_402",
        name: "Audit_Expenses_2026.csv",
        isFolder: false,
        mimeType: "text/csv",
        size: 310000,
        formattedSize: "310 KB",
        modifiedTime: new Date().toISOString(),
      },
    ],
  },
  v_folder_3: {
    id: "v_folder_3",
    name: "Media & Photographs",
    parentId: "root",
    items: [
      {
        id: "v_file_501",
        name: "Team_Offsite_2026.jpg",
        isFolder: false,
        mimeType: "image/jpeg",
        size: 4800000,
        formattedSize: "4.80 MB",
        modifiedTime: new Date().toISOString(),
      },
    ],
  },
};

export class VirtualStorageManager {
  private static getFS(): Record<string, VirtualFolder> {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_VIRTUAL_FS));
      return DEFAULT_VIRTUAL_FS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return DEFAULT_VIRTUAL_FS;
    }
  }

  private static saveFS(fs: Record<string, VirtualFolder>): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fs));
  }

  public static getFolder(folderId: string): { folderName: string; parentId: string | null; items: DriveItem[] } {
    const fs = this.getFS();
    const folder = fs[folderId] || {
      id: folderId,
      name: "Local Folder",
      parentId: "root",
      items: [],
    };
    return {
      folderName: folder.name,
      parentId: folder.parentId,
      items: folder.items,
    };
  }

  public static createFolder(parentId: string, folderName: string): VirtualFolder {
    const fs = this.getFS();
    const newId = "v_folder_" + Date.now();
    const parent = fs[parentId] || fs["root"];

    const newFolder: VirtualFolder = {
      id: newId,
      name: folderName,
      parentId: parent.id,
      items: [],
    };

    fs[newId] = newFolder;

    // Add folder item to parent's items list
    parent.items.unshift({
      id: newId,
      name: folderName,
      isFolder: true,
      mimeType: "application/vnd.google-apps.folder",
      size: 0,
      formattedSize: "-",
      modifiedTime: new Date().toISOString(),
    });

    this.saveFS(fs);
    return newFolder;
  }

  public static addFile(folderId: string, file: File): DriveItem {
    const fs = this.getFS();
    const folder = fs[folderId] || fs["root"];
    const newId = "v_file_" + Date.now();

    const formattedSize = file.size > 1024 * 1024
      ? `${(file.size / (1024 * 1024)).toFixed(2)} MB`
      : `${Math.round(file.size / 1024)} KB`;

    const newItem: DriveItem = {
      id: newId,
      name: file.name,
      isFolder: false,
      mimeType: file.type || "application/octet-stream",
      size: file.size,
      formattedSize,
      modifiedTime: new Date().toISOString(),
    };

    folder.items.unshift(newItem);
    this.saveFS(fs);
    return newItem;
  }

  public static copyVirtualFolder(
    sourceFolderId: string,
    targetFolderId: string,
    options: {
      folderNameStrategy: string;
      customFolderName?: string;
      includeSubfolders: boolean;
    },
    onProgress: (copied: number, total: number, currentFileName: string) => void
  ): { createdFolderId: string; createdFolderName: string; totalCopied: number } {
    const fs = this.getFS();
    const sourceFolder = fs[sourceFolderId];
    if (!sourceFolder) {
      throw new Error("Source virtual folder not found");
    }

    let newFolderName = sourceFolder.name;
    if (options.folderNameStrategy === "copy_suffix") {
      newFolderName = `${sourceFolder.name} (Copy)`;
    } else if (options.folderNameStrategy === "custom" && options.customFolderName) {
      newFolderName = options.customFolderName;
    }

    // Create target copied folder
    const created = this.createFolder(targetFolderId, newFolderName);

    let totalCopied = 0;

    function deepCopyItems(srcId: string, destId: string) {
      const src = fs[srcId];
      if (!src) return;

      for (const item of src.items) {
        if (item.isFolder) {
          if (options.includeSubfolders) {
            const newSub = VirtualStorageManager.createFolder(destId, item.name);
            deepCopyItems(item.id, newSub.id);
          }
        } else {
          // Copy file
          const dest = fs[destId];
          if (dest) {
            dest.items.push({
              ...item,
              id: "v_copy_" + Date.now() + "_" + Math.random().toString(36).substring(2, 5),
              modifiedTime: new Date().toISOString(),
            });
            totalCopied++;
            onProgress(totalCopied, totalCopied + 5, item.name);
          }
        }
      }
    }

    deepCopyItems(sourceFolderId, created.id);
    this.saveFS(fs);

    return {
      createdFolderId: created.id,
      createdFolderName: newFolderName,
      totalCopied,
    };
  }
}
