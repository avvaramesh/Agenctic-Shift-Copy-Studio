import React, { useState } from "react";
import {
  Binary,
  CheckCircle2,
  Trash2,
  ArrowRight,
  ShieldCheck,
  Zap,
  Image as ImageIcon,
  FileText,
  Copy,
  Layers,
  Sparkles,
  RefreshCw,
  HardDrive,
  Info,
  Maximize2,
  Sliders,
  Check,
  X,
  Eye,
  SlidersHorizontal,
  Flame,
  ShieldAlert,
} from "lucide-react";

interface DeduplicationPair {
  id: string;
  fileName: string;
  category: "exact_crypto" | "perceptual_photo" | "folder_clone";
  sizeBytes: number;
  googleDrivePath: string;
  oneDrivePath: string;
  matchType: "MD5 / SHA-256 Exact" | "pHash Media (99.8%)" | "xxHash Stream";
  hashGoogle: string;
  hashOneDrive: string;
  bandwidthSavedBytes: number;
  // Metadata for Inspector Drawer
  googleMetadata: {
    dimensions: string;
    format: string;
    bitrate: string;
    modifiedDate: string;
    sizeFormatted: string;
    qualityScore: number; // e.g. 100 for original
    previewImg?: string;
  };
  oneDriveMetadata: {
    dimensions: string;
    format: string;
    bitrate: string;
    modifiedDate: string;
    sizeFormatted: string;
    qualityScore: number; // e.g. 80 for compressed WebP
    previewImg?: string;
  };
}

interface DeduplicationMatrixProps {
  onExecuteDeduplication?: (pairIds: string[]) => void;
}

export const DeduplicationMatrix: React.FC<DeduplicationMatrixProps> = ({
  onExecuteDeduplication,
}) => {
  const [selectedPairIds, setSelectedPairIds] = useState<Set<string>>(
    new Set(["p1", "p2", "p3"])
  );
  const [resolutionPreset, setResolutionPreset] = useState<
    "keep_best_quality" | "keep_gdrive_master" | "quarantine_first" | "custom"
  >("keep_best_quality");
  const [isExecuting, setIsExecuting] = useState(false);
  const [hasExecuted, setHasExecuted] = useState(false);

  // Inspector Drawer state
  const [inspectingPair, setInspectingPair] = useState<DeduplicationPair | null>(null);
  const [showDiffHeatmap, setShowDiffHeatmap] = useState(false);

  const deduplicationPairs: DeduplicationPair[] = [
    {
      id: "p1",
      fileName: "CS_Final_Project_Dataset_Backup.zip",
      category: "exact_crypto",
      sizeBytes: 2_800_000_000, // 2.8 GB
      googleDrivePath: "/CS_Projects/Archives/CS_Final_Project_Dataset_Backup.zip",
      oneDrivePath: "/University_Backups/CS_Final_Project_Dataset_Backup.zip",
      matchType: "MD5 / SHA-256 Exact",
      hashGoogle: "4f83796d1920803fb2f002221665a396",
      hashOneDrive: "4f83796d1920803fb2f002221665a396",
      bandwidthSavedBytes: 2_800_000_000,
      googleMetadata: {
        dimensions: "N/A (Zip Vault)",
        format: "ZIP Archive",
        bitrate: "Store (Deflate)",
        modifiedDate: "2024-05-12 14:20",
        sizeFormatted: "2.8 GB",
        qualityScore: 100,
      },
      oneDriveMetadata: {
        dimensions: "N/A (Zip Vault)",
        format: "ZIP Archive",
        bitrate: "Store (Deflate)",
        modifiedDate: "2024-05-12 14:21",
        sizeFormatted: "2.8 GB",
        qualityScore: 100,
      },
    },
    {
      id: "p2",
      fileName: "Campus_Graduation_RAW_Collection.zip",
      category: "exact_crypto",
      sizeBytes: 1_400_000_000, // 1.4 GB
      googleDrivePath: "/School/Media/Campus_Graduation_RAW_Collection.zip",
      oneDrivePath: "/OneDrive/Photos/Campus_Graduation_RAW_Collection.zip",
      matchType: "xxHash Stream",
      hashGoogle: "82a87b7a8d56a7d9",
      hashOneDrive: "82a87b7a8d56a7d9",
      bandwidthSavedBytes: 1_400_000_000,
      googleMetadata: {
        dimensions: "N/A (Archive)",
        format: "ZIP Archive",
        bitrate: "xxHash Stream Verified",
        modifiedDate: "2024-06-01 09:15",
        sizeFormatted: "1.4 GB",
        qualityScore: 100,
      },
      oneDriveMetadata: {
        dimensions: "N/A (Archive)",
        format: "ZIP Archive",
        bitrate: "xxHash Stream Verified",
        modifiedDate: "2024-06-01 09:18",
        sizeFormatted: "1.4 GB",
        qualityScore: 100,
      },
    },
    {
      id: "p3",
      fileName: "Campus_Event_Photos_HighRes.jpg (vs. WebP)",
      category: "perceptual_photo",
      sizeBytes: 950_000_000, // 950 MB
      googleDrivePath: "/Photos/2024/Campus_Event_Photos_HighRes.jpg",
      oneDrivePath: "/OneDrive/CameraRoll/Campus_Event_Photos_Resized.webp",
      matchType: "pHash Media (99.8%)",
      hashGoogle: "phash:110010111001",
      hashOneDrive: "phash:110010111010",
      bandwidthSavedBytes: 950_000_000,
      googleMetadata: {
        dimensions: "3840 x 2160 (4K Uncompressed)",
        format: "JPEG (sRGB)",
        bitrate: "12.4 Mbps (Full Quality Master)",
        modifiedDate: "2024-04-18 11:30",
        sizeFormatted: "950 MB",
        qualityScore: 100,
        previewImg: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=600&auto=format&fit=crop",
      },
      oneDriveMetadata: {
        dimensions: "1920 x 1080 (1080p Downscaled)",
        format: "WebP (Lossy 80%)",
        bitrate: "2.1 Mbps (Web Optimized)",
        modifiedDate: "2024-04-20 16:45",
        sizeFormatted: "180 MB",
        qualityScore: 65,
        previewImg: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=600&auto=format&fit=crop&q=40",
      },
    },
    {
      id: "p4",
      fileName: "Research_Paper_Datasets_v2.pdf",
      category: "exact_crypto",
      sizeBytes: 650_000_000, // 650 MB
      googleDrivePath: "/Research/Papers/Research_Paper_Datasets_v2.pdf",
      oneDrivePath: "/OneDrive/Documents/Research_Paper_Datasets_v2.pdf",
      matchType: "MD5 / SHA-256 Exact",
      hashGoogle: "a4c28f642d9f4a0a",
      hashOneDrive: "a4c28f642d9f4a0a",
      bandwidthSavedBytes: 650_000_000,
      googleMetadata: {
        dimensions: "Document PDF",
        format: "PDF v1.7",
        bitrate: "Vectors & Embedded Data",
        modifiedDate: "2023-11-05 18:00",
        sizeFormatted: "650 MB",
        qualityScore: 100,
      },
      oneDriveMetadata: {
        dimensions: "Document PDF",
        format: "PDF v1.7",
        bitrate: "Vectors & Embedded Data",
        modifiedDate: "2023-11-05 18:01",
        sizeFormatted: "650 MB",
        qualityScore: 100,
      },
    },
  ];

  const formatSize = (bytes: number) => {
    if (bytes >= 1_000_000_000) {
      return (bytes / 1_000_000_000).toFixed(1) + " GB";
    }
    return (bytes / 1_000_000).toFixed(0) + " MB";
  };

  const totalSelectedVolumeBytes = deduplicationPairs
    .filter((p) => selectedPairIds.has(p.id))
    .reduce((acc, curr) => acc + curr.sizeBytes, 0);

  const toggleSelectPair = (id: string) => {
    const next = new Set(selectedPairIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedPairIds(next);
  };

  const handleApplyPresetRule = (
    rule: "keep_best_quality" | "keep_gdrive_master" | "quarantine_first"
  ) => {
    setResolutionPreset(rule);
    // Auto-select all matching items for purge
    setSelectedPairIds(new Set(deduplicationPairs.map((p) => p.id)));
  };

  const handleRunDeduplication = () => {
    setIsExecuting(true);
    setTimeout(() => {
      setIsExecuting(false);
      setHasExecuted(true);
      if (onExecuteDeduplication) {
        onExecuteDeduplication(Array.from(selectedPairIds));
      }
    }, 1200);
  };

  return (
    <div className="bg-white border-4 border-black rounded-[36px] p-6 shadow-[8px_8px_0px_0px_#000] space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b-2 border-black pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 bg-[#4ECDC4] text-black px-3 py-1 rounded-full text-xs font-black border-2 border-black shadow-[2px_2px_0px_0px_#000] mb-2">
            <Binary className="w-3.5 h-3.5 stroke-[3]" /> ZERO-TRANSFER CRYPTOGRAPHIC & PERCEPTUAL MATCHING
          </div>
          <h3 className="text-xl font-black text-black italic">
            Cross-Drive Deduplication Matrix & Visual Diff Inspector
          </h3>
          <p className="text-xs font-bold text-gray-600 max-w-xl">
            Compares Google Drive <code className="bg-slate-100 px-1 py-0.5 rounded border border-black font-mono">md5Checksum</code> against OneDrive <code className="bg-slate-100 px-1 py-0.5 rounded border border-black font-mono">sha1Hash</code>, <code className="bg-slate-100 px-1 py-0.5 rounded border border-black font-mono">quickXorHash</code>, and perceptual <code className="bg-slate-100 px-1 py-0.5 rounded border border-black font-mono">pHash</code> media fingerprinting.
          </p>
        </div>

        <button
          onClick={handleRunDeduplication}
          disabled={isExecuting || selectedPairIds.size === 0}
          className="px-6 py-3.5 bg-[#FF6B6B] hover:bg-[#e05555] text-white font-black text-xs rounded-2xl border-2 border-black shadow-[4px_4px_0px_0px_#000] transition-all cursor-pointer flex items-center gap-2 shrink-0 active:translate-y-1 disabled:opacity-50"
        >
          {isExecuting ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>
                {resolutionPreset === "quarantine_first"
                  ? "Moving Duplicates to Quarantine..."
                  : "Purging Redundant Copies..."}
              </span>
            </>
          ) : (
            <>
              <Trash2 className="w-4 h-4 stroke-[2.5]" />
              <span>
                {resolutionPreset === "quarantine_first" ? "Quarantine" : "Purge"}{" "}
                {formatSize(totalSelectedVolumeBytes)} Duplicates
              </span>
            </>
          )}
        </button>
      </div>

      {/* AUTOMATED CONFLICT RESOLUTION PRESETS TOOLBAR */}
      <div className="bg-slate-50 p-4 rounded-3xl border-3 border-black shadow-[3px_3px_0px_0px_#000] space-y-3">
        <div className="flex items-center gap-2 text-xs font-black text-black uppercase">
          <SlidersHorizontal className="w-4 h-4 text-[#FF6B6B]" />
          <span>Automated Conflict Resolution Rules & Presets:</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={() => handleApplyPresetRule("keep_best_quality")}
            className={`p-3 rounded-2xl border-2 border-black text-left transition-all cursor-pointer ${
              resolutionPreset === "keep_best_quality"
                ? "bg-[#FFE66D] text-black shadow-[2px_2px_0px_0px_#000]"
                : "bg-white text-gray-700 hover:bg-slate-100"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-black">Rule 1: Keep Highest Quality</span>
              {resolutionPreset === "keep_best_quality" && <Check className="w-4 h-4 text-black stroke-[3]" />}
            </div>
            <p className="text-[10px] font-bold text-gray-700 pt-1">
              Preserves 4K/Originals, purges downscaled WebP/compressed copies.
            </p>
          </button>

          <button
            onClick={() => handleApplyPresetRule("keep_gdrive_master")}
            className={`p-3 rounded-2xl border-2 border-black text-left transition-all cursor-pointer ${
              resolutionPreset === "keep_gdrive_master"
                ? "bg-[#4ECDC4] text-black shadow-[2px_2px_0px_0px_#000]"
                : "bg-white text-gray-700 hover:bg-slate-100"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-black">Rule 2: Keep GDrive as Master</span>
              {resolutionPreset === "keep_gdrive_master" && <Check className="w-4 h-4 text-black stroke-[3]" />}
            </div>
            <p className="text-[10px] font-bold text-gray-700 pt-1">
              Designates Google Drive as source of truth and purges OneDrive copies.
            </p>
          </button>

          <button
            onClick={() => handleApplyPresetRule("quarantine_first")}
            className={`p-3 rounded-2xl border-2 border-black text-left transition-all cursor-pointer ${
              resolutionPreset === "quarantine_first"
                ? "bg-[#A29BFE] text-black shadow-[2px_2px_0px_0px_#000]"
                : "bg-white text-gray-700 hover:bg-slate-100"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-black">Rule 3: Safe Quarantine First</span>
              {resolutionPreset === "quarantine_first" && <Check className="w-4 h-4 text-black stroke-[3]" />}
            </div>
            <p className="text-[10px] font-bold text-gray-700 pt-1">
              Moves duplicates into <code className="bg-white/80 px-1 border rounded">/_Quarantine/</code> for 30-day safe recovery.
            </p>
          </button>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#FFF9F5] p-4 rounded-3xl border-3 border-black shadow-[3px_3px_0px_0px_#000] space-y-1">
          <div className="text-[10px] font-black text-gray-500 uppercase">Exact Hash Matches</div>
          <div className="text-2xl font-black text-black">18.4 GB Total</div>
          <div className="text-[11px] font-bold text-gray-600">MD5 & SHA-256 verified byte-for-byte</div>
        </div>

        <div className="bg-[#FFE66D] p-4 rounded-3xl border-3 border-black shadow-[3px_3px_0px_0px_#000] space-y-1">
          <div className="text-[10px] font-black text-black uppercase">Perceptual Photo Matches</div>
          <div className="text-2xl font-black text-[#FF6B6B]">950 MB Photo Copies</div>
          <div className="text-[11px] font-bold text-black">pHash 99.8% similarity detected</div>
        </div>

        <div className="bg-[#4ECDC4] p-4 rounded-3xl border-3 border-black shadow-[3px_3px_0px_0px_#000] space-y-1">
          <div className="text-[10px] font-black text-black uppercase">Redundant Bandwidth Saved</div>
          <div className="text-2xl font-black text-black">18.4 GB Saved</div>
          <div className="text-[11px] font-bold text-black">Skipped re-downloading across clouds</div>
        </div>
      </div>

      {/* Deduplication Pairs Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b-2 border-black text-xs font-black text-black bg-slate-100">
              <th className="py-2.5 px-3 w-8">
                <input
                  type="checkbox"
                  checked={selectedPairIds.size === deduplicationPairs.length}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedPairIds(new Set(deduplicationPairs.map((p) => p.id)));
                    } else {
                      setSelectedPairIds(new Set());
                    }
                  }}
                  className="accent-[#FF6B6B] cursor-pointer"
                />
              </th>
              <th className="py-2.5 px-3">File Name & Cloud Locations</th>
              <th className="py-2.5 px-3">Size</th>
              <th className="py-2.5 px-3">Cryptographic Match Type</th>
              <th className="py-2.5 px-3">MD5 / SHA-1 Hashes</th>
              <th className="py-2.5 px-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y-2 divide-slate-100 text-xs font-bold">
            {deduplicationPairs.map((pair) => {
              const isSelected = selectedPairIds.has(pair.id);
              return (
                <tr key={pair.id} className={`hover:bg-slate-50 ${isSelected ? "bg-amber-50" : ""}`}>
                  <td className="py-3 px-3">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelectPair(pair.id)}
                      className="accent-[#FF6B6B] cursor-pointer"
                    />
                  </td>
                  <td className="py-3 px-3">
                    <div className="font-black text-black flex items-center gap-2">
                      <FileText className="w-4 h-4 text-black shrink-0" />
                      <span>{pair.fileName}</span>
                    </div>
                    <div className="text-[10px] font-mono text-gray-500 pt-0.5 space-y-0.5">
                      <div className="text-blue-600">GDrive: {pair.googleDrivePath}</div>
                      <div className="text-emerald-600">OneDrive: {pair.oneDrivePath}</div>
                    </div>
                  </td>
                  <td className="py-3 px-3 font-black text-[#FF6B6B]">{formatSize(pair.sizeBytes)}</td>
                  <td className="py-3 px-3 font-black">
                    <span className="px-2 py-0.5 rounded bg-slate-200 text-black border border-black text-[10px]">
                      {pair.matchType}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono text-[10px] text-gray-600">
                    <div>G: {pair.hashGoogle}</div>
                    <div>O: {pair.hashOneDrive}</div>
                  </td>
                  <td className="py-3 px-3 text-right space-x-1">
                    <button
                      onClick={() => setInspectingPair(pair)}
                      className="px-2.5 py-1 bg-[#4ECDC4] hover:bg-[#3dbbb3] text-black text-[10px] font-black rounded-lg border border-black shadow-[1px_1px_0px_0px_#000] transition-all cursor-pointer inline-flex items-center gap-1"
                    >
                      <Eye className="w-3 h-3" />
                      <span>Inspect Diff</span>
                    </button>

                    <button
                      onClick={() => {
                        setSelectedPairIds(new Set([pair.id]));
                        handleRunDeduplication();
                      }}
                      className="px-2.5 py-1 bg-[#FF6B6B] hover:bg-[#e05555] text-white text-[10px] font-black rounded-lg border border-black shadow-[1px_1px_0px_0px_#000] transition-all cursor-pointer inline-flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Purge</span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* SIDE-BY-SIDE VISUAL INSPECTION DRAWER */}
      {inspectingPair && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-end animate-in fade-in">
          <div className="w-full max-w-2xl bg-white h-full border-l-4 border-black p-6 overflow-y-auto space-y-6 shadow-[[-8px_0px_0px_0px_#000]]">
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b-2 border-black pb-4">
              <div className="flex items-center gap-2">
                <Binary className="w-5 h-5 text-[#FF6B6B]" />
                <div>
                  <h3 className="text-lg font-black text-black">Side-by-Side Visual Inspection Drawer</h3>
                  <p className="text-xs font-bold text-gray-500">{inspectingPair.fileName}</p>
                </div>
              </div>

              <button
                onClick={() => setInspectingPair(null)}
                className="p-1.5 bg-slate-100 hover:bg-slate-200 border-2 border-black rounded-xl font-black text-xs cursor-pointer"
              >
                <X className="w-5 h-5 text-black" />
              </button>
            </div>

            {/* Match Type Badge Banner */}
            <div className="bg-[#FFE66D] p-3 rounded-2xl border-2 border-black text-xs font-black flex items-center justify-between">
              <span>Match Classifier: {inspectingPair.matchType}</span>
              <span className="bg-black text-white px-2 py-0.5 rounded text-[10px]">
                Bandwidth Saved: {formatSize(inspectingPair.bandwidthSavedBytes)}
              </span>
            </div>

            {/* Photo / Media Perceptual Preview & Diff Heatmap Overlay */}
            {inspectingPair.category === "perceptual_photo" && inspectingPair.googleMetadata.previewImg && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-black uppercase flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-[#FF6B6B]" />
                    Visual Media Comparison & Compression Delta
                  </span>

                  <button
                    onClick={() => setShowDiffHeatmap(!showDiffHeatmap)}
                    className={`px-3 py-1 rounded-xl text-xs font-black border-2 border-black cursor-pointer transition-all flex items-center gap-1.5 ${
                      showDiffHeatmap
                        ? "bg-[#FF6B6B] text-white shadow-[2px_2px_0px_0px_#000]"
                        : "bg-white text-black hover:bg-slate-100"
                    }`}
                  >
                    <Flame className="w-3.5 h-3.5" />
                    <span>{showDiffHeatmap ? "Hide Difference Heatmap" : "Show Compression Heatmap Overlay"}</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Google Drive Copy Preview */}
                  <div className="bg-slate-100 p-3 rounded-2xl border-2 border-black space-y-2 relative overflow-hidden">
                    <span className="bg-blue-600 text-white font-black text-[10px] px-2 py-0.5 rounded border border-black inline-block">
                      Google Drive (Master Copy)
                    </span>
                    <div className="relative rounded-xl overflow-hidden border border-black bg-black aspect-video flex items-center justify-center">
                      <img
                        src={inspectingPair.googleMetadata.previewImg}
                        alt="GDrive Preview"
                        className="object-cover w-full h-full"
                      />
                      {showDiffHeatmap && (
                        <div className="absolute inset-0 bg-emerald-500/30 backdrop-hue-rotate-90 flex items-center justify-center">
                          <span className="bg-black/90 text-emerald-400 font-mono text-[10px] px-2 py-1 rounded border border-emerald-400">
                            No Loss / 100% Original Master
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="text-[11px] font-black text-black space-y-0.5">
                      <div>Res: {inspectingPair.googleMetadata.dimensions}</div>
                      <div>Format: {inspectingPair.googleMetadata.format}</div>
                      <div className="text-blue-600">Size: {inspectingPair.googleMetadata.sizeFormatted}</div>
                    </div>
                  </div>

                  {/* OneDrive Copy Preview */}
                  <div className="bg-slate-100 p-3 rounded-2xl border-2 border-black space-y-2 relative overflow-hidden">
                    <span className="bg-emerald-600 text-white font-black text-[10px] px-2 py-0.5 rounded border border-black inline-block">
                      OneDrive (Secondary Copy)
                    </span>
                    <div className="relative rounded-xl overflow-hidden border border-black bg-black aspect-video flex items-center justify-center">
                      <img
                        src={inspectingPair.oneDriveMetadata.previewImg}
                        alt="OneDrive Preview"
                        className="object-cover w-full h-full"
                      />
                      {showDiffHeatmap && (
                        <div className="absolute inset-0 bg-red-500/40 backdrop-contrast-200 flex items-center justify-center">
                          <span className="bg-black/90 text-red-400 font-mono text-[10px] px-2 py-1 rounded border border-red-400">
                            pHash Delta: 0.2% Compression Mask
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="text-[11px] font-black text-black space-y-0.5">
                      <div>Res: {inspectingPair.oneDriveMetadata.dimensions}</div>
                      <div>Format: {inspectingPair.oneDriveMetadata.format}</div>
                      <div className="text-[#FF6B6B]">Size: {inspectingPair.oneDriveMetadata.sizeFormatted} (Downscaled)</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Side-by-Side Metadata Diff Table */}
            <div className="space-y-2">
              <span className="text-xs font-black text-black uppercase">Technical Metadata Comparison</span>
              <table className="w-full text-xs font-bold border-2 border-black rounded-2xl overflow-hidden">
                <thead className="bg-slate-200 font-black border-b-2 border-black">
                  <tr>
                    <th className="p-2.5">Attribute</th>
                    <th className="p-2.5 text-blue-600">Google Drive</th>
                    <th className="p-2.5 text-emerald-600">OneDrive</th>
                  </tr>
                </thead>
                <tbody className="divide-y border-black bg-white">
                  <tr>
                    <td className="p-2.5 font-black text-gray-500">File Path</td>
                    <td className="p-2.5 font-mono text-[10px]">{inspectingPair.googleDrivePath}</td>
                    <td className="p-2.5 font-mono text-[10px]">{inspectingPair.oneDrivePath}</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-black text-gray-500">Dimensions / Res</td>
                    <td className="p-2.5 font-black text-black">{inspectingPair.googleMetadata.dimensions}</td>
                    <td className="p-2.5 font-black text-black">{inspectingPair.oneDriveMetadata.dimensions}</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-black text-gray-500">Format / Codec</td>
                    <td className="p-2.5">{inspectingPair.googleMetadata.format}</td>
                    <td className="p-2.5">{inspectingPair.oneDriveMetadata.format}</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-black text-gray-500">Bitrate / Spec</td>
                    <td className="p-2.5">{inspectingPair.googleMetadata.bitrate}</td>
                    <td className="p-2.5">{inspectingPair.oneDriveMetadata.bitrate}</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-black text-gray-500">Modified Date</td>
                    <td className="p-2.5">{inspectingPair.googleMetadata.modifiedDate}</td>
                    <td className="p-2.5">{inspectingPair.oneDriveMetadata.modifiedDate}</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-black text-gray-500">Hash Fingerprint</td>
                    <td className="p-2.5 font-mono text-[10px]">{inspectingPair.hashGoogle}</td>
                    <td className="p-2.5 font-mono text-[10px]">{inspectingPair.hashOneDrive}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Drawer Action Controls */}
            <div className="pt-4 border-t-2 border-black flex items-center justify-between gap-3">
              <button
                onClick={() => setInspectingPair(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-black font-black text-xs rounded-xl border border-black cursor-pointer"
              >
                Close Drawer
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setSelectedPairIds(new Set([inspectingPair.id]));
                    setInspectingPair(null);
                    handleRunDeduplication();
                  }}
                  className="px-5 py-2.5 bg-[#FF6B6B] hover:bg-[#e05555] text-white font-black text-xs rounded-2xl border-2 border-black shadow-[3px_3px_0px_0px_#000] cursor-pointer"
                >
                  Purge Secondary Copy ({formatSize(inspectingPair.sizeBytes)})
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {hasExecuted && (
        <div className="bg-emerald-100 p-4 rounded-2xl border-2 border-black flex items-center gap-3 text-xs font-black text-black">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 stroke-[3]" />
          <span>
            {resolutionPreset === "quarantine_first"
              ? `Successfully moved selected duplicates into /_ShiftCopy_Quarantine/! Reclaimed ${formatSize(totalSelectedVolumeBytes)} space.`
              : `Successfully purged selected duplicate files! Reclaimed ${formatSize(totalSelectedVolumeBytes)} of space.`}
          </span>
        </div>
      )}
    </div>
  );
};
