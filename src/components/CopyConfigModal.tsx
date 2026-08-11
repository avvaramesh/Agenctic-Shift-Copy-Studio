import React, { useState } from "react";
import { CopyOptions, SelectedFolderState } from "../types";
import {
  FolderSync,
  ArrowRight,
  Folder,
  SlidersHorizontal,
  Layers,
  FileCheck,
  Tag,
  CheckCircle2,
  X,
  Play,
  Sparkles,
} from "lucide-react";

interface CopyConfigModalProps {
  sourceFolder: SelectedFolderState;
  targetFolder: SelectedFolderState;
  isOpen: boolean;
  onClose: () => void;
  onStartCopy: (options: CopyOptions) => void;
}

export const CopyConfigModal: React.FC<CopyConfigModalProps> = ({
  sourceFolder,
  targetFolder,
  isOpen,
  onClose,
  onStartCopy,
}) => {
  const [folderNameStrategy, setFolderNameStrategy] = useState<
    "same" | "copy_suffix" | "custom"
  >("same");
  const [customFolderName, setCustomFolderName] = useState(
    `${sourceFolder.folderName} (Copied)`
  );
  const [includeSubfolders, setIncludeSubfolders] = useState(true);
  const [duplicateHandling, setDuplicateHandling] = useState<
    "overwrite" | "skip" | "rename"
  >("rename");

  // Extension filters
  const [extensionFilterInput, setExtensionFilterInput] = useState("");
  const [selectedExtensions, setSelectedExtensions] = useState<string[]>([]);

  if (!isOpen) return null;

  const handleAddExtension = (ext: string) => {
    const cleaned = ext.trim().toLowerCase().replace(/^\./, "");
    if (!cleaned) return;
    if (!selectedExtensions.includes("." + cleaned)) {
      setSelectedExtensions((prev) => [...prev, "." + cleaned]);
    }
  };

  const handleRemoveExtension = (ext: string) => {
    setSelectedExtensions((prev) => prev.filter((e) => e !== ext));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onStartCopy({
      folderNameStrategy,
      customFolderName,
      includeSubfolders,
      filterExtensions: selectedExtensions,
      duplicateHandling,
      selectedItemIds: sourceFolder.selectedItems?.map((i) => i.id),
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#FFF9F5] border-4 border-black rounded-[36px] w-full max-w-xl p-8 shadow-[12px_12px_0px_0px_#000] space-y-6 my-8">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b-2 border-black pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#FFE66D] text-black border-2 border-black shadow-[3px_3px_0px_0px_#000] flex items-center justify-center">
              <SlidersHorizontal className="w-6 h-6 stroke-[3]" />
            </div>
            <div>
              <h2 className="text-xl font-black text-black flex items-center gap-2">
                Configure Copy Job
              </h2>
              <p className="text-xs font-bold text-gray-600">
                Set path options, subfolder options & file extension filters
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-black hover:bg-[#FF6B6B] hover:text-white rounded-2xl border-2 border-black transition-colors cursor-pointer"
          >
            <X className="w-5 h-5 stroke-[3]" />
          </button>
        </div>

        {/* Transfer Mode Detection Indicator */}
        {(() => {
          const bothDrive =
            sourceFolder.locationType === "google_drive" &&
            targetFolder.locationType === "google_drive";
          const distinctAccounts =
            bothDrive &&
            sourceFolder.accountEmail &&
            targetFolder.accountEmail &&
            sourceFolder.accountEmail !== targetFolder.accountEmail;

          const isSameAccount = bothDrive && !distinctAccounts;

          return (
            <div
              className={`p-3 rounded-2xl border-2 border-black font-black text-xs flex flex-wrap items-center justify-between gap-2 shadow-[3px_3px_0px_0px_#000] ${
                distinctAccounts
                  ? "bg-[#FFE66D] text-black"
                  : isSameAccount
                  ? "bg-[#4ECDC4] text-black"
                  : "bg-white text-black"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-black shrink-0" />
                <span>
                  TRANSFER MODE:{" "}
                  {distinctAccounts
                    ? `Cross-Account Bridge (${sourceFolder.accountEmail} → ${targetFolder.accountEmail})`
                    : isSameAccount
                    ? `Single Account (${sourceFolder.accountEmail || "Google Drive"})`
                    : "Hybrid Local / External Transfer"}
                </span>
              </div>
              <span className="text-[10px] bg-black text-white px-2 py-0.5 rounded-full font-bold">
                {distinctAccounts
                  ? "Dual-Auth Stream Copy"
                  : isSameAccount
                  ? "Direct Server API"
                  : "Bridge Stream"}
              </span>
            </div>
          );
        })()}

        {/* Offline Access & Token Auto-Refresh Security Banner */}
        <div className="bg-[#E0F7FA] border-2 border-black p-3 rounded-2xl flex items-center justify-between gap-2 shadow-[2px_2px_0px_0px_#000]">
          <div className="flex items-center gap-2">
            <span className="text-sm">🔄</span>
            <div>
              <p className="text-[11px] font-black text-black">
                Background Token Auto-Refresh Active
              </p>
              <p className="text-[10px] font-bold text-slate-700">
                OAuth Refresh Tokens attached. Multi-hour/200GB transfers will automatically renew 60-min access tokens seamlessly without failing.
              </p>
            </div>
          </div>
          <span className="bg-emerald-600 text-white font-black text-[9px] uppercase px-2 py-1 rounded-lg border border-black shrink-0">
            Offline Access Ready
          </span>
        </div>

        {/* Source -> Target Visual Diagram */}
        <div className="bg-white p-4 rounded-3xl border-2 border-black shadow-[4px_4px_0px_0px_#000] flex items-center justify-between gap-3">
          {/* Source Box */}
          <div className="flex-1 min-w-0 bg-[#F7F7F7] p-3 rounded-2xl border-2 border-black">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#FF6B6B]">
                Source Folder
              </span>
              {sourceFolder.selectedItems && sourceFolder.selectedItems.length > 0 && (
                <span className="text-[9px] font-black bg-[#FFE66D] text-black px-1.5 py-0.5 rounded border border-black">
                  {sourceFolder.selectedItems.length} items chosen
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 min-w-0">
              <Folder className="w-4 h-4 text-black fill-[#FFE66D] shrink-0" />
              <span className="text-xs font-black text-black truncate">
                {sourceFolder.folderName}
              </span>
            </div>
            <div className="text-[10px] font-bold text-gray-600 mt-1 truncate">
              Context: {sourceFolder.accountLabel || sourceFolder.locationType.toUpperCase()}
            </div>
          </div>

          <ArrowRight className="w-6 h-6 text-black shrink-0 stroke-[3]" />

          {/* Target Box */}
          <div className="flex-1 min-w-0 bg-[#F7F7F7] p-3 rounded-2xl border-2 border-black">
            <div className="text-[10px] font-black uppercase tracking-wider text-[#4ECDC4] mb-1">
              Target Folder
            </div>
            <div className="flex items-center gap-2 min-w-0">
              <Folder className="w-4 h-4 text-black fill-[#4ECDC4] shrink-0" />
              <span className="text-xs font-black text-black truncate">
                {targetFolder.folderName}
              </span>
            </div>
            <div className="text-[10px] font-bold text-gray-600 mt-1 truncate">
              Context: {targetFolder.accountLabel || targetFolder.locationType.toUpperCase()}
            </div>
          </div>
        </div>

        {/* Configuration Options Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Destination Folder Naming Rule */}
          <div className="space-y-2">
            <label className="text-xs font-black text-black flex items-center gap-2 uppercase tracking-wide">
              <FolderSync className="w-4 h-4 text-black stroke-[2.5]" />
              Destination Folder Name
            </label>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setFolderNameStrategy("same")}
                className={`p-3 rounded-2xl text-xs font-black border-2 border-black text-left transition-all cursor-pointer ${
                  folderNameStrategy === "same"
                    ? "bg-[#FFE66D] text-black shadow-[3px_3px_0px_0px_#000]"
                    : "bg-white text-black hover:bg-slate-100"
                }`}
              >
                <div>Keep Same</div>
                <div className="text-[10px] font-bold text-gray-600 truncate">{sourceFolder.folderName}</div>
              </button>

              <button
                type="button"
                onClick={() => setFolderNameStrategy("copy_suffix")}
                className={`p-3 rounded-2xl text-xs font-black border-2 border-black text-left transition-all cursor-pointer ${
                  folderNameStrategy === "copy_suffix"
                    ? "bg-[#FFE66D] text-black shadow-[3px_3px_0px_0px_#000]"
                    : "bg-white text-black hover:bg-slate-100"
                }`}
              >
                <div>Add (Copy)</div>
                <div className="text-[10px] font-bold text-gray-600 truncate">
                  {sourceFolder.folderName} (Copy)
                </div>
              </button>

              <button
                type="button"
                onClick={() => setFolderNameStrategy("custom")}
                className={`p-3 rounded-2xl text-xs font-black border-2 border-black text-left transition-all cursor-pointer ${
                  folderNameStrategy === "custom"
                    ? "bg-[#FFE66D] text-black shadow-[3px_3px_0px_0px_#000]"
                    : "bg-white text-black hover:bg-slate-100"
                }`}
              >
                <div>Custom Name</div>
                <div className="text-[10px] font-bold text-gray-600 truncate">Specified below</div>
              </button>
            </div>

            {folderNameStrategy === "custom" && (
              <input
                type="text"
                value={customFolderName}
                onChange={(e) => setCustomFolderName(e.target.value)}
                placeholder="Custom Folder Name"
                className="w-full bg-white border-2 border-black rounded-2xl px-4 py-2.5 text-xs font-bold text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF6B6B]"
              />
            )}
          </div>

          {/* Subfolder Recursion Toggle */}
          <div className="flex items-center justify-between bg-white p-4 rounded-2xl border-2 border-black shadow-[3px_3px_0px_0px_#000]">
            <div className="flex items-center gap-3">
              <Layers className="w-5 h-5 text-black stroke-[2.5]" />
              <div>
                <div className="text-xs font-black text-black">
                  Recursive Copy (Subfolders)
                </div>
                <div className="text-[10px] font-bold text-gray-500">
                  Include all nested child folders and files
                </div>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={includeSubfolders}
                onChange={(e) => setIncludeSubfolders(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 border-2 border-black peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-black after:border-black after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#4ECDC4]"></div>
            </label>
          </div>

          {/* Extension Filters */}
          <div className="space-y-2">
            <label className="text-xs font-black text-black flex items-center gap-2 uppercase tracking-wide">
              <Tag className="w-4 h-4 text-black stroke-[2.5]" />
              File Extension Filters (Optional)
            </label>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={extensionFilterInput}
                onChange={(e) => setExtensionFilterInput(e.target.value)}
                placeholder="e.g. .pdf, .jpg, .docx"
                className="flex-1 bg-white border-2 border-black rounded-2xl px-4 py-2 text-xs font-bold text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4ECDC4]"
              />
              <button
                type="button"
                onClick={() => {
                  handleAddExtension(extensionFilterInput);
                  setExtensionFilterInput("");
                }}
                className="px-4 py-2 bg-[#4ECDC4] hover:bg-[#3dbcb3] text-black border-2 border-black rounded-2xl text-xs font-black shadow-[2px_2px_0px_0px_#000] cursor-pointer"
              >
                Add Filter
              </button>
            </div>

            {/* Common quick badges */}
            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              <span className="text-[10px] font-black text-gray-500">Quick Filters:</span>
              {["pdf", "png", "jpg", "docx", "xlsx", "zip"].map((ext) => (
                <button
                  key={ext}
                  type="button"
                  onClick={() => handleAddExtension("." + ext)}
                  className="px-2.5 py-1 rounded-xl bg-white border-2 border-black text-[10px] font-black text-black hover:bg-[#FFE66D] shadow-[1px_1px_0px_0px_#000] transition-colors cursor-pointer"
                >
                  +.{ext}
                </button>
              ))}
            </div>

            {selectedExtensions.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap pt-1">
                {selectedExtensions.map((ext) => (
                  <span
                    key={ext}
                    className="inline-flex items-center gap-1 bg-[#FFE66D] text-black border-2 border-black px-3 py-1 rounded-xl text-xs font-black shadow-[2px_2px_0px_0px_#000]"
                  >
                    {ext}
                    <button
                      type="button"
                      onClick={() => handleRemoveExtension(ext)}
                      className="hover:text-[#FF6B6B] cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5 stroke-[3]" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Submit Action */}
          <div className="pt-4 border-t-2 border-black flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3 rounded-2xl text-xs font-black text-black hover:bg-slate-200 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-8 py-3.5 rounded-2xl text-sm font-black bg-[#FF6B6B] text-white border-2 border-black shadow-[6px_6px_0px_0px_#000] hover:bg-[#ff5252] hover:translate-y-[-1px] flex items-center gap-2 cursor-pointer transition-all"
            >
              <Play className="w-4 h-4 fill-white stroke-[2.5]" />
              <span>START COPYING</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
