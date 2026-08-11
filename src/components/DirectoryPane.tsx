import React, { useState, useEffect } from "react";
import {
  DriveItem,
  FolderPathSegment,
  SelectedFolderState,
  StorageLocationType,
  UserProfile,
} from "../types";
import { VirtualStorageManager } from "../lib/virtualStorage";
import {
  Folder,
  File,
  HardDrive,
  Cloud,
  FolderPlus,
  Upload,
  Search,
  ChevronRight,
  ArrowLeft,
  RefreshCw,
  Link as LinkIcon,
  CheckCircle,
  FileText,
  Image as ImageIcon,
  Table,
  FileCode,
  Loader2,
  FolderTree,
  X,
  ExternalLink,
} from "lucide-react";

import { signInWithGoogle } from "../lib/firebase";

interface DirectoryPaneProps {
  paneType: "source" | "target";
  user: UserProfile | null;
  setUser?: (user: UserProfile | null) => void;
  selectedFolder: SelectedFolderState | null;
  onSelectFolder: (folder: SelectedFolderState) => void;
  onClearSelection: () => void;
}

export const DirectoryPane: React.FC<DirectoryPaneProps> = ({
  paneType,
  user,
  setUser,
  selectedFolder,
  onSelectFolder,
  onClearSelection,
}) => {
  const [locationType, setLocationType] = useState<StorageLocationType>(
    user ? "google_drive" : "virtual_local"
  );
  const [currentFolderId, setCurrentFolderId] = useState<string>("root");
  const [currentFolderName, setCurrentFolderName] = useState<string>("Root Directory");
  const [breadcrumbs, setBreadcrumbs] = useState<FolderPathSegment[]>([
    { id: "root", name: "Root Directory" },
  ]);

  const [items, setItems] = useState<DriveItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // New folder dialog state
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [newFolderNameInput, setNewFolderNameInput] = useState("");

  // Paste Drive URL state
  const [pastedDriveUrl, setPastedDriveUrl] = useState("");
  const [isInspectingUrl, setIsInspectingUrl] = useState(false);

  const [checkedItemIds, setCheckedItemIds] = useState<string[]>([]);

  // Clear checked items when navigating or switching location
  useEffect(() => {
    setCheckedItemIds([]);
  }, [currentFolderId, locationType]);

  const toggleCheckItem = (e: React.MouseEvent, itemId: string) => {
    e.stopPropagation();
    setCheckedItemIds((prev) =>
      prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]
    );
  };

  const toggleSelectAll = () => {
    if (checkedItemIds.length === filteredItems.length) {
      setCheckedItemIds([]);
    } else {
      setCheckedItemIds(filteredItems.map((i) => i.id));
    }
  };

  // Load folder contents whenever locationType or currentFolderId changes
  useEffect(() => {
    fetchDirectoryContents(currentFolderId);
  }, [locationType, currentFolderId, user]);

  const fetchDirectoryContents = async (folderId: string) => {
    setErrorMessage(null);
    setIsLoading(true);

    try {
      if (locationType === "virtual_local") {
        const vData = VirtualStorageManager.getFolder(folderId);
        setItems(vData.items);
        setCurrentFolderName(vData.folderName || "Local Folder");
      } else if (locationType === "google_drive") {
        if (!user || !user.accessToken) {
          setItems([]);
          setErrorMessage("Please sign in with Google to access Google Drive files.");
          setIsLoading(false);
          return;
        }

        const res = await fetch(`/api/drive/folders?folderId=${encodeURIComponent(folderId)}`, {
          headers: {
            Authorization: `Bearer ${user.accessToken}`,
          },
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || "Failed to fetch Drive items");
        }

        const data = await res.json();
        setItems(data.items || []);
        setCurrentFolderName(data.currentFolder?.name || "Drive Folder");
      }
    } catch (err: any) {
      console.error("Directory fetch error:", err);
      setErrorMessage(err.message || "Error loading directory contents");
    } finally {
      setIsLoading(false);
    }
  };

  const handleNavigateIntoFolder = (folder: DriveItem) => {
    if (!folder.isFolder) return;
    setCurrentFolderId(folder.id);
    setCurrentFolderName(folder.name);
    setBreadcrumbs((prev) => [...prev, { id: folder.id, name: folder.name }]);
  };

  const handleBreadcrumbClick = (index: number) => {
    const targetSegment = breadcrumbs[index];
    const newPath = breadcrumbs.slice(0, index + 1);
    setBreadcrumbs(newPath);
    setCurrentFolderId(targetSegment.id);
    setCurrentFolderName(targetSegment.name);
  };

  const handleCreateNewFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderNameInput.trim()) return;

    try {
      setIsLoading(true);
      if (locationType === "virtual_local") {
        VirtualStorageManager.createFolder(currentFolderId, newFolderNameInput.trim());
        fetchDirectoryContents(currentFolderId);
      } else if (locationType === "google_drive" && user?.accessToken) {
        const res = await fetch("/api/drive/create-folder", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.accessToken}`,
          },
          body: JSON.stringify({
            name: newFolderNameInput.trim(),
            parentId: currentFolderId,
          }),
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || "Failed to create folder on Drive");
        }
        fetchDirectoryContents(currentFolderId);
      }
      setNewFolderNameInput("");
      setShowNewFolderModal(false);
    } catch (err: any) {
      alert("Folder creation failed: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (locationType === "virtual_local") {
      Array.from(files).forEach((file: File) => {
        VirtualStorageManager.addFile(currentFolderId, file);
      });
      fetchDirectoryContents(currentFolderId);
    } else {
      alert("Direct local file upload is enabled for Virtual Storage Vault. To transfer to Drive, copy the folder!");
    }
  };

  const handleInspectDriveUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pastedDriveUrl.trim() || !user?.accessToken) return;

    setIsInspectingUrl(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/drive/inspect", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.accessToken}`,
        },
        body: JSON.stringify({ folderUrlOrId: pastedDriveUrl }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Could not inspect Drive folder URL");
      }

      const data = await res.json();
      onSelectFolder({
        locationType: "google_drive",
        folderId: data.id,
        folderName: data.name,
        folderPath: [{ id: data.id, name: data.name }],
        driveUrl: data.webViewLink,
        totalFiles: data.directFiles,
        totalFolders: data.directFolders,
      });
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to resolve Google Drive link");
    } finally {
      setIsInspectingUrl(false);
    }
  };

  const handleSetCurrentAsSelected = () => {
    let chosenItems = items;
    if (checkedItemIds.length > 0) {
      chosenItems = items.filter((i) => checkedItemIds.includes(i.id));
    }

    const totalFoldersCount = chosenItems.filter((i) => i.isFolder).length;
    const totalFilesCount = chosenItems.length - totalFoldersCount;
    const totalSizeBytes = chosenItems.reduce((acc, curr) => acc + (curr.size || 0), 0);

    const accountEmail = user?.email || undefined;
    const accountLabel =
      locationType === "google_drive"
        ? (user ? `${user.email} (My Drive)` : "Google Account")
        : locationType === "drive_url"
        ? "Shared Drive Link / External"
        : "Local Vault Storage";

    onSelectFolder({
      locationType,
      folderId: currentFolderId,
      folderName: currentFolderName,
      folderPath: breadcrumbs,
      totalFiles: totalFilesCount,
      totalFolders: totalFoldersCount,
      totalSizeBytes,
      selectedItems: checkedItemIds.length > 0 ? chosenItems.map((i) => ({ id: i.id, name: i.name, isFolder: i.isFolder })) : undefined,
      accountEmail,
      accountLabel,
    });
  };

  const [sortBy, setSortBy] = useState<
    "name_asc" | "name_desc" | "date_desc" | "date_asc" | "size_desc" | "size_asc"
  >("name_asc");

  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedItems = [...filteredItems].sort((a, b) => {
    // Keep folders at top by default
    if (a.isFolder && !b.isFolder) return -1;
    if (!a.isFolder && b.isFolder) return 1;

    if (sortBy === "name_asc") {
      return a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: "base" });
    }
    if (sortBy === "name_desc") {
      return b.name.localeCompare(a.name, undefined, { numeric: true, sensitivity: "base" });
    }
    if (sortBy === "date_desc") {
      const timeA = a.modifiedTime ? new Date(a.modifiedTime).getTime() : 0;
      const timeB = b.modifiedTime ? new Date(b.modifiedTime).getTime() : 0;
      return timeB - timeA;
    }
    if (sortBy === "date_asc") {
      const timeA = a.modifiedTime ? new Date(a.modifiedTime).getTime() : 0;
      const timeB = b.modifiedTime ? new Date(b.modifiedTime).getTime() : 0;
      return timeA - timeB;
    }
    if (sortBy === "size_desc") {
      return (b.size || 0) - (a.size || 0);
    }
    if (sortBy === "size_asc") {
      return (a.size || 0) - (b.size || 0);
    }
    return 0;
  });

  const getFileIcon = (mimeType: string, isFolder: boolean) => {
    if (isFolder) return <Folder className="w-5 h-5 text-black fill-[#FFE66D]" />;
    if (mimeType.includes("pdf")) return <FileText className="w-5 h-5 text-black fill-[#FF6B6B]" />;
    if (mimeType.includes("image")) return <ImageIcon className="w-5 h-5 text-black fill-[#4ECDC4]" />;
    if (mimeType.includes("spreadsheet") || mimeType.includes("sheet") || mimeType.includes("csv"))
      return <Table className="w-5 h-5 text-black fill-[#4ECDC4]" />;
    if (mimeType.includes("json") || mimeType.includes("code") || mimeType.includes("script"))
      return <FileCode className="w-5 h-5 text-black fill-[#FFE66D]" />;
    return <File className="w-5 h-5 text-black fill-[#4ECDC4]" />;
  };

  const isSelected = selectedFolder?.folderId === currentFolderId;

  const shadowClass = paneType === "source" ? "shadow-[10px_10px_0px_0px_#4ECDC4]" : "shadow-[10px_10px_0px_0px_#FF6B6B]";

  return (
    <div className={`bg-white border-4 border-black rounded-[36px] flex flex-col h-[680px] ${shadowClass} overflow-hidden`}>
      {/* Pane Header */}
      <div className="p-4 border-b-2 border-black bg-[#FFF9F5] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className={`px-3 py-1 rounded-md text-xs font-black uppercase border border-black ${
            paneType === "source" ? "bg-[#FFE66D] text-black" : "bg-[#4ECDC4] text-white"
          }`}>
            {paneType === "source" ? "Source" : "Destination"}
          </span>
          <h2 className="text-base font-black tracking-tight text-black">
            {paneType === "source" ? "Source Folder" : "Target Folder"}
          </h2>
        </div>

        {/* Location Switcher */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              setLocationType("google_drive");
              setCurrentFolderId("root");
              setBreadcrumbs([{ id: "root", name: "My Drive" }]);
            }}
            className={`px-3 py-1.5 rounded-full text-xs font-black flex items-center gap-1.5 transition-all border-2 border-black cursor-pointer ${
              locationType === "google_drive"
                ? "bg-[#FFE66D] text-black shadow-[2px_2px_0px_0px_#000]"
                : "bg-white text-black hover:bg-slate-100"
            }`}
          >
            <Cloud className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Drive</span>
          </button>

          <button
            onClick={() => {
              setLocationType("virtual_local");
              setCurrentFolderId("root");
              setBreadcrumbs([{ id: "root", name: "Local Storage Vault" }]);
            }}
            className={`px-3 py-1.5 rounded-full text-xs font-black flex items-center gap-1.5 transition-all border-2 border-black cursor-pointer ${
              locationType === "virtual_local"
                ? "bg-[#4ECDC4] text-black shadow-[2px_2px_0px_0px_#000]"
                : "bg-white text-black hover:bg-slate-100"
            }`}
          >
            <HardDrive className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Local Vault</span>
          </button>

          <button
            onClick={() => {
              setLocationType("drive_url");
            }}
            className={`px-3 py-1.5 rounded-full text-xs font-black flex items-center gap-1.5 transition-all border-2 border-black cursor-pointer ${
              locationType === "drive_url"
                ? "bg-[#FF6B6B] text-white shadow-[2px_2px_0px_0px_#000]"
                : "bg-white text-black hover:bg-slate-100"
            }`}
          >
            <LinkIcon className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Link</span>
          </button>
        </div>
      </div>

      {locationType === "drive_url" ? (
        /* Direct Link Paste Mode */
        <div className="p-6 flex-1 flex flex-col justify-center items-center text-center bg-[#F7F7F7]">
          <div className="w-16 h-16 rounded-2xl bg-[#FFE66D] border-2 border-black text-black flex items-center justify-center mb-4 shadow-[4px_4px_0px_0px_#000]">
            <LinkIcon className="w-8 h-8 stroke-[2.5]" />
          </div>
          <h3 className="text-xl font-black text-black mb-1">
            Paste Drive Folder URL or ID
          </h3>
          <p className="text-xs font-bold text-gray-500 max-w-sm mb-6">
            Directly target any Google Drive folder by pasting its share link or folder ID below.
          </p>

          <form onSubmit={handleInspectDriveUrl} className="w-full max-w-md space-y-3">
            <div className="relative">
              <input
                type="text"
                value={pastedDriveUrl}
                onChange={(e) => setPastedDriveUrl(e.target.value)}
                placeholder="https://drive.google.com/drive/folders/1A2b3C4..."
                className="w-full bg-white border-2 border-black rounded-2xl px-4 py-3 text-xs font-bold text-black placeholder-gray-400 shadow-[3px_3px_0px_0px_#000] focus:outline-none focus:ring-2 focus:ring-[#FF6B6B]"
              />
            </div>
            <button
              type="submit"
              disabled={isInspectingUrl || !pastedDriveUrl.trim() || !user}
              className="w-full bg-[#FF6B6B] text-white font-black py-3 rounded-2xl text-xs flex items-center justify-center gap-2 border-2 border-black shadow-[4px_4px_0px_0px_#000] hover:bg-[#ff5252] disabled:opacity-50 cursor-pointer transition-all"
            >
              {isInspectingUrl ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Inspecting Link...</span>
                </>
              ) : (
                <>
                  <FolderTree className="w-4 h-4 stroke-[2.5]" />
                  <span>Validate & Set Folder</span>
                </>
              )}
            </button>
          </form>

          {!user && (
            <p className="text-xs font-black text-black mt-4 bg-[#FFE66D] border-2 border-black px-4 py-2 rounded-xl shadow-[2px_2px_0px_0px_#000]">
              Sign in with Google required to inspect Drive URLs
            </p>
          )}
        </div>
      ) : (
        /* Explorer Mode */
        <>
          {/* Drive Scope Quick Selector & Account Context */}
          {locationType === "google_drive" && (
            <div className="px-3 py-2 bg-[#F7F7F7] border-b-2 border-black flex flex-wrap items-center justify-between gap-1.5 text-[11px] font-black">
              <div className="flex items-center gap-1.5 overflow-x-auto">
                <span className="text-gray-500 uppercase tracking-wider text-[9px] mr-1">Scope:</span>
                <button
                  type="button"
                  onClick={() => {
                    setCurrentFolderId("root");
                    setBreadcrumbs([{ id: "root", name: "My Drive" }]);
                  }}
                  className={`px-2.5 py-1 rounded-xl border-2 border-black cursor-pointer transition-all ${
                    breadcrumbs[0]?.id === "root"
                      ? "bg-[#FFE66D] text-black shadow-[2px_2px_0px_0px_#000]"
                      : "bg-white text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  📁 My Drive
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCurrentFolderId("shared");
                    setBreadcrumbs([{ id: "shared", name: "Shared With Me" }]);
                  }}
                  className={`px-2.5 py-1 rounded-xl border-2 border-black cursor-pointer transition-all ${
                    breadcrumbs[0]?.id === "shared"
                      ? "bg-[#4ECDC4] text-black shadow-[2px_2px_0px_0px_#000]"
                      : "bg-white text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  🤝 Shared With Me
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCurrentFolderId("starred");
                    setBreadcrumbs([{ id: "starred", name: "Starred" }]);
                  }}
                  className={`px-2.5 py-1 rounded-xl border-2 border-black cursor-pointer transition-all ${
                    breadcrumbs[0]?.id === "starred"
                      ? "bg-[#FF6B6B] text-white shadow-[2px_2px_0px_0px_#000]"
                      : "bg-white text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  ⭐ Starred
                </button>
              </div>

              {user?.email && (
                <div className="flex items-center gap-1">
                  <div className="text-[10px] font-bold text-gray-600 bg-white px-2 py-0.5 rounded-lg border border-black truncate max-w-[180px]" title={user.email}>
                    Active: <span className="text-black font-black">{user.email}</span>
                  </div>
                  {setUser && (
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          setIsLoading(true);
                          const profile = await signInWithGoogle(true);
                          setUser(profile);
                        } catch (err: any) {
                          alert("Account switch failed: " + (err.message || "Unknown error"));
                        } finally {
                          setIsLoading(false);
                        }
                      }}
                      title="Switch active Google Account"
                      className="px-1.5 py-0.5 bg-[#FFE66D] text-black text-[9px] font-black rounded border border-black hover:bg-[#ffd633] cursor-pointer"
                    >
                      Switch
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Breadcrumb Navigation & Toolbar */}
          <div className="p-3 bg-white border-b-2 border-black flex items-center justify-between gap-2 overflow-x-auto">
            <div className="flex items-center gap-1 text-xs text-black overflow-x-auto py-1">
              {breadcrumbs.map((segment, idx) => (
                <React.Fragment key={segment.id}>
                  {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0 stroke-[2.5]" />}
                  <button
                    onClick={() => handleBreadcrumbClick(idx)}
                    className={`hover:underline cursor-pointer whitespace-nowrap font-black ${
                      idx === breadcrumbs.length - 1 ? "text-black underline decoration-2 decoration-[#FF6B6B]" : "text-gray-500"
                    }`}
                  >
                    {segment.name}
                  </button>
                </React.Fragment>
              ))}
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => fetchDirectoryContents(currentFolderId)}
                title="Refresh"
                className="p-1.5 text-black hover:bg-[#FFE66D] border-2 border-black rounded-xl transition-colors cursor-pointer shadow-[2px_2px_0px_0px_#000]"
              >
                <RefreshCw className={`w-3.5 h-3.5 stroke-[2.5] ${isLoading ? "animate-spin" : ""}`} />
              </button>

              <button
                onClick={() => setShowNewFolderModal(true)}
                title="Create New Folder"
                className="p-1.5 text-black hover:bg-[#4ECDC4] hover:text-white border-2 border-black rounded-xl transition-colors cursor-pointer shadow-[2px_2px_0px_0px_#000]"
              >
                <FolderPlus className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>

              {locationType === "virtual_local" && (
                <label
                  title="Upload file to local storage"
                  className="p-1.5 text-black hover:bg-[#FF6B6B] hover:text-white border-2 border-black rounded-xl transition-colors cursor-pointer shadow-[2px_2px_0px_0px_#000]"
                >
                  <Upload className="w-3.5 h-3.5 stroke-[2.5]" />
                  <input type="file" multiple className="hidden" onChange={handleFileUpload} />
                </label>
              )}
            </div>
          </div>

          {/* Search bar & Sorting / Selection Toolbar */}
          <div className="p-3 border-b-2 border-black bg-[#F7F7F7] flex flex-wrap items-center justify-between gap-2">
            <div className="relative flex-1 min-w-[150px]">
              <Search className="w-4 h-4 text-gray-500 absolute left-3 top-2.5 stroke-[2.5]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search items..."
                className="w-full bg-white border-2 border-black rounded-xl pl-9 pr-3 py-1.5 text-xs font-bold text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4ECDC4]"
              />
            </div>

            {/* Sort Control Dropdown */}
            <div className="flex items-center gap-1 shrink-0">
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-wider hidden sm:inline">Sort:</span>
              <select
                value={sortBy}
                onChange={(e: any) => setSortBy(e.target.value)}
                className="bg-white text-black border-2 border-black rounded-xl px-2 py-1.5 text-xs font-black shadow-[1px_1px_0px_0px_#000] focus:outline-none cursor-pointer"
              >
                <option value="name_asc">🔤 Name (A → Z)</option>
                <option value="name_desc">🔤 Name (Z → A)</option>
                <option value="date_desc">📅 Newest First</option>
                <option value="date_asc">📅 Oldest First</option>
                <option value="size_desc">📦 Size (Largest)</option>
                <option value="size_asc">📦 Size (Smallest)</option>
              </select>
            </div>

            {paneType === "source" && filteredItems.length > 0 && (
              <button
                type="button"
                onClick={toggleSelectAll}
                className="px-3 py-1.5 bg-[#FFE66D] text-black border-2 border-black rounded-xl text-xs font-black shadow-[2px_2px_0px_0px_#000] hover:bg-[#ffd633] cursor-pointer whitespace-nowrap"
              >
                {checkedItemIds.length === filteredItems.length ? "Deselect All" : "Select All"}
              </button>
            )}
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="m-3 p-3 rounded-2xl bg-[#FF6B6B] text-white border-2 border-black text-xs font-black flex items-center justify-between shadow-[3px_3px_0px_0px_#000]">
              <span>{errorMessage}</span>
              <button onClick={() => setErrorMessage(null)} className="text-white hover:text-black">
                <X className="w-4 h-4 stroke-[3]" />
              </button>
            </div>
          )}

          {/* Items Explorer List */}
          <div className="flex-1 overflow-y-auto p-3 bg-[#F7F7F7] space-y-2">
            {isLoading ? (
              <div className="h-full flex flex-col items-center justify-center text-black gap-2">
                <Loader2 className="w-8 h-8 animate-spin text-[#FF6B6B]" />
                <span className="text-xs font-black">Loading contents...</span>
              </div>
            ) : sortedItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-2 p-6">
                <Folder className="w-10 h-10 stroke-[2]" />
                <span className="text-xs font-black text-gray-400">Folder is empty or no matching items found.</span>
              </div>
            ) : (
              sortedItems.map((item) => {
                const isChecked = checkedItemIds.includes(item.id);
                return (
                  <div
                    key={item.id}
                    onClick={() => item.isFolder && handleNavigateIntoFolder(item)}
                    className={`flex items-center justify-between p-3 border-2 border-black rounded-2xl transition-all ${
                      isChecked
                        ? "bg-[#FFE66D]/40 border-black shadow-[4px_4px_0px_0px_#000]"
                        : "bg-white shadow-[3px_3px_0px_0px_rgba(0,0,0,0.1)]"
                    } ${
                      item.isFolder
                        ? "hover:bg-[#FFE66D]/30 hover:shadow-[4px_4px_0px_0px_#000] cursor-pointer"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {paneType === "source" && (
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          onClick={(e) => toggleCheckItem(e, item.id)}
                          className="w-4 h-4 accent-black border-2 border-black rounded cursor-pointer shrink-0"
                        />
                      )}
                      <div className="p-2 rounded-xl bg-[#FFF9F5] border-2 border-black shrink-0">
                        {getFileIcon(item.mimeType, item.isFolder)}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-black text-black truncate">
                          {item.name}
                        </div>
                        <div className="text-[10px] font-bold text-gray-500 flex items-center gap-2">
                          <span>{item.isFolder ? "FOLDER" : item.formattedSize}</span>
                          {item.modifiedTime && (
                            <span>
                              • {new Date(item.modifiedTime).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {item.isFolder && (
                      <ChevronRight className="w-4 h-4 text-black shrink-0 stroke-[3]" />
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Selected Status Bar Footer */}
          <div className="p-4 bg-white border-t-2 border-black flex items-center justify-between">
            <div>
              <div className="text-xs font-black text-black">
                Current: <span className="text-[#FF6B6B]">{currentFolderName}</span>
              </div>
              <div className="text-[10px] font-bold text-gray-500">
                {items.filter((i) => i.isFolder).length} folders •{" "}
                {items.filter((i) => !i.isFolder).length} files
              </div>
            </div>

            {isSelected ? (
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-black flex items-center gap-1 bg-[#4ECDC4] text-white px-3 py-1.5 rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_#000]">
                  <CheckCircle className="w-4 h-4 stroke-[3]" /> Selected
                </span>
                <button
                  onClick={onClearSelection}
                  className="p-1 text-black hover:text-[#FF6B6B] transition-colors cursor-pointer"
                  title="Clear Selection"
                >
                  <X className="w-5 h-5 stroke-[3]" />
                </button>
              </div>
            ) : (
              <button
                onClick={handleSetCurrentAsSelected}
                className={`px-4 py-2 rounded-2xl text-xs font-black text-white border-2 border-black shadow-[3px_3px_0px_0px_#000] hover:translate-y-[-1px] transition-all cursor-pointer ${
                  paneType === "source"
                    ? "bg-[#FF6B6B] hover:bg-[#ff5252]"
                    : "bg-[#4ECDC4] text-black hover:bg-[#3dbcb3]"
                }`}
              >
                Use as {paneType === "source" ? "Source" : "Target"}
              </button>
            )}
          </div>
        </>
      )}

      {/* New Folder Modal */}
      {showNewFolderModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FFF9F5] border-4 border-black rounded-[32px] w-full max-w-sm p-6 shadow-[10px_10px_0px_0px_#000]">
            <h3 className="text-lg font-black text-black mb-1">Create New Folder</h3>
            <p className="text-xs font-bold text-gray-500 mb-4">
              Creating inside <span className="text-[#FF6B6B] font-black">{currentFolderName}</span>
            </p>

            <form onSubmit={handleCreateNewFolder} className="space-y-4">
              <input
                type="text"
                autoFocus
                value={newFolderNameInput}
                onChange={(e) => setNewFolderNameInput(e.target.value)}
                placeholder="Folder Name (e.g., Marketing Assets)"
                className="w-full bg-white border-2 border-black rounded-2xl px-4 py-2.5 text-xs font-bold text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FFE66D]"
              />

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewFolderModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-black text-black hover:bg-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newFolderNameInput.trim()}
                  className="px-5 py-2 rounded-xl text-xs font-black bg-[#FFE66D] text-black border-2 border-black shadow-[3px_3px_0px_0px_#000] hover:bg-[#ffd633] cursor-pointer disabled:opacity-50"
                >
                  Create Folder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
