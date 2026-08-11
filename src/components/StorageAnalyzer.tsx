import React, { useState } from "react";
import { UserProfile, SelectedFolderState } from "../types";
import { StorageTreemap } from "./StorageTreemap";
import { DeduplicationMatrix } from "./DeduplicationMatrix";
import { EntropyAndWasteViewer } from "./EntropyAndWasteViewer";
import { SmartRecommendations } from "./SmartRecommendations";
import { SmartProjectClustering } from "./SmartProjectClustering";
import {
  HardDrive,
  PieChart,
  Trash2,
  ArrowRight,
  FolderSync,
  AlertTriangle,
  CheckCircle,
  FileText,
  Video,
  FileArchive,
  Image as ImageIcon,
  Sparkles,
  Download,
  Loader2,
  RefreshCw,
  Zap,
  Cpu,
  Binary,
  Brain,
  Layers,
  Clock,
  Minimize2,
  FileSpreadsheet,
  Network,
  Filter,
  Check,
  FolderArchive,
  ShieldAlert,
} from "lucide-react";

interface StorageAnalyzerProps {
  user: UserProfile | null;
  onSelectForTransfer?: (folder: SelectedFolderState) => void;
  onSwitchToExplorer?: () => void;
}

interface FileCategoryBreakdown {
  name: string;
  bytes: number;
  percentage: number;
  color: string;
  icon: any;
  fileCount: number;
}

interface StorageFileItem {
  id: string;
  name: string;
  sizeBytes: number;
  category: string;
  mimeType: string;
  modifiedDate: string;
  isDuplicate?: boolean;
  duplicateGroup?: string;
  hash?: string;
  path?: string;
  phashSimilarity?: number;
}

interface SemanticCluster {
  id: string;
  title: string;
  keywords: string[];
  fileCount: number;
  totalSizeBytes: number;
  entropyScore: number; // 0-100 (high = stale/cold)
  lastAccessed: string;
  samplePath: string;
}

interface CrossAccountDelta {
  sourceAccount: string;
  targetAccount: string;
  sourceTotalGB: number;
  targetTotalGB: number;
  overlappingGB: number;
  uniqueSourceGB: number;
  redundantBandwidthSavedGB: number;
}

export const StorageAnalyzer: React.FC<StorageAnalyzerProps> = ({
  user,
  onSelectForTransfer,
  onSwitchToExplorer,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<
    "overview" | "treemap" | "matrix" | "entropy" | "clustering" | "recommendations" | "engines" | "correlation" | "cross_account" | "heavy_files"
  >("overview");

  const [isScanning, setIsScanning] = useState(false);
  const [hasScanned, setHasScanned] = useState(true);
  const [scanStep, setScanStep] = useState<"idle" | "go_indexing" | "rust_hashing" | "python_ml" | "complete">("complete");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [selectedFileIds, setSelectedFileIds] = useState<Set<string>>(new Set(["f1", "f5"]));

  // Storage Stats State
  const [totalUsedBytes, setTotalUsedBytes] = useState<number>(14_800_000_000); // 14.8 GB
  const [totalQuotaBytes] = useState<number>(15_000_000_000); // 15.0 GB limit

  // Categories
  const categories: FileCategoryBreakdown[] = [
    {
      name: "Videos & Raw Media",
      bytes: 6_800_000_000,
      percentage: 46,
      color: "#FF6B6B",
      icon: Video,
      fileCount: 42,
    },
    {
      name: "Archives & Zip Vaults",
      bytes: 4_200_000_000,
      percentage: 28,
      color: "#FFE66D",
      icon: FileArchive,
      fileCount: 18,
    },
    {
      name: "High-Res Photos",
      bytes: 2_300_000_000,
      percentage: 16,
      color: "#4ECDC4",
      icon: ImageIcon,
      fileCount: 1240,
    },
    {
      name: "PDFs & Documents",
      bytes: 1_200_000_000,
      percentage: 8,
      color: "#A29BFE",
      icon: FileText,
      fileCount: 310,
    },
    {
      name: "Duplicate Files",
      bytes: 300_000_000,
      percentage: 2,
      color: "#FF7675",
      icon: Trash2,
      fileCount: 14,
    },
  ];

  // Heavy space-hogging files list
  const sampleFiles: StorageFileItem[] = [
    {
      id: "f1",
      name: "Graduation_4K_Raw_Footage_2024.mp4",
      sizeBytes: 4_300_000_000, // 4.3 GB
      category: "Videos & Raw Media",
      mimeType: "video/mp4",
      modifiedDate: "2024-05-20",
      path: "/School/Graduation2024/Videos/",
      hash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    },
    {
      id: "f2",
      name: "CS_Final_Project_Dataset_Backup.zip",
      sizeBytes: 2_800_000_000, // 2.8 GB
      category: "Archives & Zip Vaults",
      mimeType: "application/zip",
      modifiedDate: "2024-04-12",
      path: "/CS_Projects/Archives/",
      hash: "4f83796d1920803fb2f002221665a396e987b73b22e18501e5efc3545b6f3458",
    },
    {
      id: "f3",
      name: "Design_Assets_Figma_Exports.zip",
      sizeBytes: 1_400_000_000, // 1.4 GB
      category: "Archives & Zip Vaults",
      mimeType: "application/zip",
      modifiedDate: "2024-06-01",
      path: "/Design/Exports/",
      hash: "82a87b7a8d56a7d9796014e49339396e05391d4e0e561633513e9a597a74043f",
    },
    {
      id: "f4",
      name: "School_Projects_Archive_2023.tar.gz",
      sizeBytes: 1_100_000_000, // 1.1 GB
      category: "Archives & Zip Vaults",
      mimeType: "application/gzip",
      modifiedDate: "2023-12-15",
      path: "/Archives/2023/",
      hash: "1d80e14e366e6371c66f50567a57a3e811c76251f28b5e5f32a0c64993132644",
    },
    {
      id: "f5",
      name: "Campus_Event_Photos_RAW.zip (Copy 1)",
      sizeBytes: 950_000_000, // 950 MB
      category: "Duplicate Files",
      mimeType: "application/zip",
      modifiedDate: "2024-05-18",
      isDuplicate: true,
      duplicateGroup: "Group_Photos_Vault",
      phashSimilarity: 99.8,
      path: "/Personal/Backups/Copy1/",
      hash: "82a87b7a8d56a7d9796014e49339396e05391d4e0e561633513e9a597a74043f",
    },
    {
      id: "f6",
      name: "Research_Paper_Datasets_HighRes.pdf",
      sizeBytes: 650_000_000, // 650 MB
      category: "PDFs & Documents",
      mimeType: "application/pdf",
      modifiedDate: "2024-03-30",
      path: "/Research/Papers/",
      hash: "a4c28f642d9f4a0a221f7e025b34f2d33e5033c4fdf4c8ef28290e2d1d07c082",
    },
  ];

  // Python ML Semantic Clusters
  const clusters: SemanticCluster[] = [
    {
      id: "c1",
      title: "School Research & Thesis Datasets",
      keywords: ["research", "pdf", "thesis", "data", "scikit", "python"],
      fileCount: 142,
      totalSizeBytes: 3_200_000_000,
      entropyScore: 88, // Stale
      lastAccessed: "2023-11-04",
      samplePath: "/School/Research/2023_Datasets/",
    },
    {
      id: "c2",
      title: "4K Video Projects & B-Roll",
      keywords: ["mp4", "mov", "4k", "b-roll", "graduation", "raw"],
      fileCount: 38,
      totalSizeBytes: 6_800_000_000,
      entropyScore: 45,
      lastAccessed: "2024-05-20",
      samplePath: "/Media/VideoProjects/",
    },
    {
      id: "c3",
      title: "Legacy Zip Archives & Backups",
      keywords: ["zip", "tar.gz", "backup", "export", "2022", "old"],
      fileCount: 22,
      totalSizeBytes: 4_200_000_000,
      entropyScore: 94, // Highly stale cold storage
      lastAccessed: "2022-08-14",
      samplePath: "/Backups/OldLaptop/",
    },
  ];

  // Cross Account Delta Demo
  const crossAccountData: CrossAccountDelta = {
    sourceAccount: user?.email || "School Google Drive (.edu)",
    targetAccount: "Personal Microsoft OneDrive",
    sourceTotalGB: 14.8,
    targetTotalGB: 8.2,
    overlappingGB: 3.4,
    uniqueSourceGB: 11.4,
    redundantBandwidthSavedGB: 3.4,
  };

  const handleRunMultiEngineScan = () => {
    setIsScanning(true);
    setScanStep("go_indexing");

    setTimeout(() => {
      setScanStep("rust_hashing");
      setTimeout(() => {
        setScanStep("python_ml");
        setTimeout(() => {
          setScanStep("complete");
          setIsScanning(false);
          setHasScanned(true);
        }, 800);
      }, 800);
    }, 800);
  };

  const formatSize = (bytes: number) => {
    if (bytes >= 1_000_000_000) {
      return (bytes / 1_000_000_000).toFixed(1) + " GB";
    }
    return (bytes / 1_000_000).toFixed(0) + " MB";
  };

  const usedPercentage = Math.min(100, Math.round((totalUsedBytes / totalQuotaBytes) * 100));

  const filteredFiles =
    filterCategory === "all"
      ? sampleFiles
      : sampleFiles.filter((f) => f.category === filterCategory);

  const toggleSelectFile = (id: string) => {
    const next = new Set(selectedFileIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedFileIds(next);
  };

  const handleStartMigrationForSelectedFiles = () => {
    const selectedList = sampleFiles.filter((f) => selectedFileIds.has(f.id));
    const totalBytes = selectedList.reduce((acc, curr) => acc + curr.sizeBytes, 0);

    if (onSelectForTransfer) {
      onSelectForTransfer({
        locationType: "google_drive",
        folderId: "root",
        folderName: `Analyzed Selection (${selectedList.length} items)`,
        folderPath: [{ id: "root", name: "Storage Intelligence Queue" }],
        totalFiles: selectedList.length,
        totalFolders: 0,
        totalSizeBytes: totalBytes,
        accountEmail: user?.email || "School/Personal Drive",
        accountLabel: "Multi-Engine Storage Queue",
      });
    }
    if (onSwitchToExplorer) {
      onSwitchToExplorer();
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-white border-4 border-black rounded-[36px] p-6 shadow-[8px_8px_0px_0px_#A29BFE] relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 bg-[#FFE66D] text-black px-3 py-1 rounded-full text-xs font-black border-2 border-black shadow-[2px_2px_0px_0px_#000]">
              <Zap className="w-3.5 h-3.5 stroke-[3]" /> MULTI-ENGINE STORAGE INTELLIGENCE
            </div>
            <h1 className="text-3xl font-black text-black italic tracking-tight">
              Google Drive Storage Analyzer & Correlation Engine
            </h1>
            <p className="text-sm font-bold text-gray-700 max-w-xl">
              Combines Go high-throughput indexing, Rust zero-allocation streaming deduplication, and Python ML correlation analysis to pinpoint duplicates, stale cold storage, and format optimization candidates.
            </p>
          </div>

          <button
            onClick={handleRunMultiEngineScan}
            disabled={isScanning}
            className="px-6 py-3.5 bg-[#4ECDC4] hover:bg-[#3dbbb3] text-black font-black text-sm rounded-2xl border-2 border-black shadow-[4px_4px_0px_0px_#000] transition-all cursor-pointer flex items-center gap-2 shrink-0 active:translate-y-1"
          >
            {isScanning ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin text-black" />
                <span className="capitalize">
                  {scanStep === "go_indexing" && "Go: Indexing Drive API..."}
                  {scanStep === "rust_hashing" && "Rust: Hashing SHA-256..."}
                  {scanStep === "python_ml" && "Python: Running pHash & TF-IDF..."}
                </span>
              </>
            ) : (
              <>
                <RefreshCw className="w-5 h-5 stroke-[2.5]" />
                <span>Run Multi-Engine Drive Scan</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b-2 border-black pb-2">
        <button
          onClick={() => setActiveSubTab("overview")}
          className={`px-4 py-2 rounded-2xl text-xs font-black border-2 border-black transition-all cursor-pointer flex items-center gap-2 ${
            activeSubTab === "overview"
              ? "bg-[#FFE66D] text-black shadow-[3px_3px_0px_0px_#000] translate-y-[-2px]"
              : "bg-white text-gray-700 hover:bg-slate-100"
          }`}
        >
          <PieChart className="w-4 h-4 stroke-[2.5]" />
          <span>Storage Breakdown</span>
        </button>

        <button
          onClick={() => setActiveSubTab("treemap")}
          className={`px-4 py-2 rounded-2xl text-xs font-black border-2 border-black transition-all cursor-pointer flex items-center gap-2 ${
            activeSubTab === "treemap"
              ? "bg-[#4ECDC4] text-black shadow-[3px_3px_0px_0px_#000] translate-y-[-2px]"
              : "bg-white text-gray-700 hover:bg-slate-100"
          }`}
        >
          <Layers className="w-4 h-4 stroke-[2.5]" />
          <span>Disk Treemap & Cold Map</span>
        </button>

        <button
          onClick={() => setActiveSubTab("matrix")}
          className={`px-4 py-2 rounded-2xl text-xs font-black border-2 border-black transition-all cursor-pointer flex items-center gap-2 ${
            activeSubTab === "matrix"
              ? "bg-[#A29BFE] text-black shadow-[3px_3px_0px_0px_#000] translate-y-[-2px]"
              : "bg-white text-gray-700 hover:bg-slate-100"
          }`}
        >
          <Binary className="w-4 h-4 stroke-[2.5]" />
          <span>Deduplication Matrix (MD5/pHash)</span>
        </button>

        <button
          onClick={() => setActiveSubTab("entropy")}
          className={`px-4 py-2 rounded-2xl text-xs font-black border-2 border-black transition-all cursor-pointer flex items-center gap-2 ${
            activeSubTab === "entropy"
              ? "bg-[#FF7675] text-white shadow-[3px_3px_0px_0px_#000] translate-y-[-2px]"
              : "bg-white text-gray-700 hover:bg-slate-100"
          }`}
        >
          <Trash2 className="w-4 h-4 stroke-[2.5]" />
          <span>Entropy, Jaccard & Waste Cleaner</span>
        </button>

        <button
          onClick={() => setActiveSubTab("clustering")}
          className={`px-4 py-2 rounded-2xl text-xs font-black border-2 border-black transition-all cursor-pointer flex items-center gap-2 ${
            activeSubTab === "clustering"
              ? "bg-[#A29BFE] text-black shadow-[3px_3px_0px_0px_#000] translate-y-[-2px]"
              : "bg-white text-gray-700 hover:bg-slate-100"
          }`}
        >
          <Brain className="w-4 h-4 stroke-[2.5]" />
          <span>Smart AI Project Clustering</span>
        </button>

        <button
          onClick={() => setActiveSubTab("recommendations")}
          className={`px-4 py-2 rounded-2xl text-xs font-black border-2 border-black transition-all cursor-pointer flex items-center gap-2 ${
            activeSubTab === "recommendations"
              ? "bg-[#FFE66D] text-black shadow-[3px_3px_0px_0px_#000] translate-y-[-2px]"
              : "bg-white text-gray-700 hover:bg-slate-100"
          }`}
        >
          <Sparkles className="w-4 h-4 stroke-[2.5]" />
          <span>1-Click Smart Actions</span>
        </button>

        <button
          onClick={() => setActiveSubTab("engines")}
          className={`px-4 py-2 rounded-2xl text-xs font-black border-2 border-black transition-all cursor-pointer flex items-center gap-2 ${
            activeSubTab === "engines"
              ? "bg-slate-900 text-white shadow-[3px_3px_0px_0px_#000] translate-y-[-2px]"
              : "bg-white text-gray-700 hover:bg-slate-100"
          }`}
        >
          <Cpu className="w-4 h-4 stroke-[2.5]" />
          <span>Multi-Engine Telemetry (Go/Rust/Python)</span>
        </button>

        <button
          onClick={() => setActiveSubTab("cross_account")}
          className={`px-4 py-2 rounded-2xl text-xs font-black border-2 border-black transition-all cursor-pointer flex items-center gap-2 ${
            activeSubTab === "cross_account"
              ? "bg-[#4ECDC4] text-black shadow-[3px_3px_0px_0px_#000] translate-y-[-2px]"
              : "bg-white text-gray-700 hover:bg-slate-100"
          }`}
        >
          <Network className="w-4 h-4 stroke-[2.5]" />
          <span>Cross-Account Source Delta</span>
        </button>

        <button
          onClick={() => setActiveSubTab("heavy_files")}
          className={`px-4 py-2 rounded-2xl text-xs font-black border-2 border-black transition-all cursor-pointer flex items-center gap-2 ${
            activeSubTab === "heavy_files"
              ? "bg-[#FF6B6B] text-white shadow-[3px_3px_0px_0px_#000] translate-y-[-2px]"
              : "bg-white text-gray-700 hover:bg-slate-100"
          }`}
        >
          <HardDrive className="w-4 h-4 stroke-[2.5]" />
          <span>Heavy Items List</span>
        </button>
      </div>

      {/* NEW TAB: TREEMAP */}
      {activeSubTab === "treemap" && (
        <StorageTreemap
          onSelectNodeForAction={(node) => {
            if (onSelectForTransfer) {
              onSelectForTransfer({
                locationType: "google_drive",
                folderId: node.id,
                folderName: node.name,
                folderPath: [{ id: node.id, name: node.name }],
                totalFiles: node.fileCount,
                totalFolders: 1,
                totalSizeBytes: node.sizeBytes,
                accountEmail: user?.email || "School/Personal Drive",
                accountLabel: "Treemap Selected Folder",
              });
            }
            if (onSwitchToExplorer) {
              onSwitchToExplorer();
            }
          }}
        />
      )}

      {/* NEW TAB: DEDUPLICATION MATRIX */}
      {activeSubTab === "matrix" && (
        <DeduplicationMatrix
          onExecuteDeduplication={() => {
            setTotalUsedBytes((prev) => Math.max(1_000_000_000, prev - 4_200_000_000));
          }}
        />
      )}

      {/* NEW TAB: ENTROPY & WASTE VIEWER */}
      {activeSubTab === "entropy" && (
        <EntropyAndWasteViewer
          onPurgeWaste={() => {
            setTotalUsedBytes((prev) => Math.max(1_000_000_000, prev - 850_000_000));
          }}
          onMigrateStale={() => {
            setActiveSubTab("treemap");
          }}
        />
      )}

      {/* NEW TAB: SMART AI PROJECT CLUSTERING */}
      {activeSubTab === "clustering" && (
        <SmartProjectClustering
          onConsolidateProject={(proj) => {
            if (onSelectForTransfer) {
              onSelectForTransfer({
                locationType: "google_drive",
                folderId: proj.id,
                folderName: proj.title,
                folderPath: [{ id: proj.id, name: proj.title }],
                totalFiles: proj.itemCount,
                totalFolders: 1,
                totalSizeBytes: proj.totalSizeBytes,
                accountEmail: user?.email || "School/Personal Drive",
                accountLabel: "Virtual Project Workspace",
              });
            }
            if (onSwitchToExplorer) {
              onSwitchToExplorer();
            }
          }}
        />
      )}

      {/* NEW TAB: SMART RECOMMENDATIONS */}
      {activeSubTab === "recommendations" && (
        <SmartRecommendations
          onExecuteRecommendation={(actionType) => {
            if (actionType === "delete_duplicates") {
              setTotalUsedBytes((prev) => Math.max(1_000_000_000, prev - 4_200_000_000));
            } else if (actionType === "purge_cache") {
              setTotalUsedBytes((prev) => Math.max(1_000_000_000, prev - 850_000_000));
            }
          }}
          onSwitchToExplorer={onSwitchToExplorer}
        />
      )}

      {/* TAB 1: OVERVIEW & BREAKDOWN */}
      {activeSubTab === "overview" && (
        <div className="space-y-6">
          <div className="bg-white border-4 border-black rounded-[36px] p-6 shadow-[8px_8px_0px_0px_#000] space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b-2 border-black pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[#4ECDC4] rounded-2xl border-2 border-black flex items-center justify-center shadow-[3px_3px_0px_0px_#000]">
                  <HardDrive className="w-6 h-6 text-black stroke-[2.5]" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-black">Google Drive Capacity Status</h2>
                  <p className="text-xs font-bold text-gray-600">
                    Account: <span className="text-black font-black">{user?.email || "School/Personal Drive"}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {usedPercentage >= 90 ? (
                  <span className="bg-[#FF6B6B] text-white px-3 py-1.5 rounded-xl border-2 border-black text-xs font-black shadow-[2px_2px_0px_0px_#000] flex items-center gap-1.5 animate-pulse">
                    <AlertTriangle className="w-4 h-4 stroke-[3]" /> CRITICAL: 98% Quota Used
                  </span>
                ) : (
                  <span className="bg-emerald-400 text-black px-3 py-1.5 rounded-xl border-2 border-black text-xs font-black shadow-[2px_2px_0px_0px_#000] flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 stroke-[3]" /> Space Healthy
                  </span>
                )}
              </div>
            </div>

            {/* Storage Gauge */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-black">
                <span>Used: {formatSize(totalUsedBytes)} of {formatSize(totalQuotaBytes)}</span>
                <span className="text-[#FF6B6B] font-black">{usedPercentage}% Capacity Reached</span>
              </div>
              <div className="w-full h-7 bg-slate-100 rounded-2xl border-2 border-black p-1 shadow-[2px_2px_0px_0px_#000] relative overflow-hidden flex">
                {categories.map((cat, idx) => (
                  <div
                    key={idx}
                    style={{
                      width: `${cat.percentage}%`,
                      backgroundColor: cat.color,
                    }}
                    className="h-full border-r border-black first:rounded-l-xl last:rounded-r-xl transition-all"
                    title={`${cat.name}: ${cat.percentage}% (${formatSize(cat.bytes)})`}
                  />
                ))}
              </div>
            </div>

            {/* Categories Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-2">
              {categories.map((cat, idx) => {
                const Icon = cat.icon;
                return (
                  <button
                    key={idx}
                    onClick={() => {
                      setFilterCategory(cat.name);
                      setActiveSubTab("heavy_files");
                    }}
                    className="p-3 bg-slate-50 hover:bg-[#FFE66D] rounded-2xl border-2 border-black transition-all cursor-pointer text-left space-y-1.5 shadow-[2px_2px_0px_0px_#000] active:translate-y-0.5"
                  >
                    <div className="flex items-center justify-between">
                      <Icon className="w-5 h-5 text-black stroke-[2.5]" />
                      <span className="text-[10px] font-black px-1.5 py-0.5 rounded-md bg-white border border-black">
                        {cat.percentage}%
                      </span>
                    </div>
                    <div className="text-xs font-black text-black truncate">{cat.name}</div>
                    <div className="text-[11px] font-bold text-gray-700">{formatSize(cat.bytes)}</div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MULTI-ENGINE ARCHITECTURE TELEMETRY */}
      {activeSubTab === "engines" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Go Engine Card */}
          <div className="bg-white border-4 border-black rounded-[32px] p-6 shadow-[6px_6px_0px_0px_#4ECDC4] space-y-4">
            <div className="flex items-center justify-between border-b-2 border-black pb-3">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-[#4ECDC4] border-2 border-black flex items-center justify-center font-black text-black shadow-[2px_2px_0px_0px_#000]">
                  GO
                </div>
                <div>
                  <h3 className="text-base font-black text-black">Go Indexing Engine</h3>
                  <p className="text-[10px] font-bold text-gray-500">Goroutines & Fan-Out Crawling</p>
                </div>
              </div>
              <span className="bg-emerald-300 text-black text-[10px] font-black px-2 py-0.5 rounded border border-black">
                Active
              </span>
            </div>

            <p className="text-xs font-bold text-gray-700 leading-relaxed">
              Handles high-concurrency Google Drive v3 API paginated listings. Uses 16 worker channels to index 20,000+ files in under 1.5 seconds without hitches.
            </p>

            <div className="bg-slate-50 p-3 rounded-2xl border-2 border-black space-y-2 text-xs font-bold">
              <div className="flex justify-between">
                <span className="text-gray-600">Crawling Throughput:</span>
                <span className="text-black font-black">14,200 items/sec</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Active Worker Goroutines:</span>
                <span className="text-black font-black">16 Routines</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Memory Footprint:</span>
                <span className="text-emerald-600 font-black">18.4 MB RAM</span>
              </div>
            </div>
          </div>

          {/* Rust Engine Card */}
          <div className="bg-white border-4 border-black rounded-[32px] p-6 shadow-[6px_6px_0px_0px_#FF6B6B] space-y-4">
            <div className="flex items-center justify-between border-b-2 border-black pb-3">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-[#FF6B6B] border-2 border-black flex items-center justify-center font-black text-white shadow-[2px_2px_0px_0px_#000]">
                  RS
                </div>
                <div>
                  <h3 className="text-base font-black text-black">Rust Deduplication Engine</h3>
                  <p className="text-[10px] font-bold text-gray-500">Zero-Allocation SHA-256 / xxHash64</p>
                </div>
              </div>
              <span className="bg-emerald-300 text-black text-[10px] font-black px-2 py-0.5 rounded border border-black">
                Active
              </span>
            </div>

            <p className="text-xs font-bold text-gray-700 leading-relaxed">
              Performs zero-copy stream hashing across cloud chunks. Instantly matches exact byte-level duplicate files regardless of renaming or folder placement.
            </p>

            <div className="bg-slate-50 p-3 rounded-2xl border-2 border-black space-y-2 text-xs font-bold">
              <div className="flex justify-between">
                <span className="text-gray-600">Hash Stream Speed:</span>
                <span className="text-black font-black">1.8 GB/sec</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Exact Duplicates Found:</span>
                <span className="text-[#FF6B6B] font-black">14 Files (950 MB)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Safety Guarantee:</span>
                <span className="text-emerald-600 font-black">Zero-Copy Memory</span>
              </div>
            </div>
          </div>

          {/* Python Engine Card */}
          <div className="bg-white border-4 border-black rounded-[32px] p-6 shadow-[6px_6px_0px_0px_#A29BFE] space-y-4">
            <div className="flex items-center justify-between border-b-2 border-black pb-3">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-[#A29BFE] border-2 border-black flex items-center justify-center font-black text-black shadow-[2px_2px_0px_0px_#000]">
                  PY
                </div>
                <div>
                  <h3 className="text-base font-black text-black">Python ML & Intelligence</h3>
                  <p className="text-[10px] font-bold text-gray-500">TF-IDF, pHash, Cosine Clustering</p>
                </div>
              </div>
              <span className="bg-emerald-300 text-black text-[10px] font-black px-2 py-0.5 rounded border border-black">
                Active
              </span>
            </div>

            <p className="text-xs font-bold text-gray-700 leading-relaxed">
              Executes perceptual image matching (pHash) for scaled/resized photo duplicates and vector TF-IDF topic clustering to group unorganized documents automatically.
            </p>

            <div className="bg-slate-50 p-3 rounded-2xl border-2 border-black space-y-2 text-xs font-bold">
              <div className="flex justify-between">
                <span className="text-gray-600">Perceptual Photo Matches:</span>
                <span className="text-black font-black">99.8% Match Score</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Topic Clusters Formed:</span>
                <span className="text-black font-black">3 Semantic Clusters</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Cold Folders Identified:</span>
                <span className="text-purple-600 font-black">7.4 GB Stale Data</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PYTHON ML CORRELATION & COLD STORAGE */}
      {activeSubTab === "correlation" && (
        <div className="space-y-6">
          <div className="bg-white border-4 border-black rounded-[36px] p-6 shadow-[8px_8px_0px_0px_#000] space-y-4">
            <div className="flex items-center justify-between border-b-2 border-black pb-3">
              <div>
                <h3 className="text-lg font-black text-black flex items-center gap-2">
                  <Brain className="w-5 h-5 text-[#A29BFE]" />
                  <span>Python ML Semantic Topic Clusters & Cold Storage</span>
                </h3>
                <p className="text-xs font-bold text-gray-500">
                  Calculates folder entropy (days untouched) and aggregates files using TF-IDF text vectors.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              {clusters.map((cluster) => (
                <div
                  key={cluster.id}
                  className="bg-slate-50 p-4 rounded-3xl border-3 border-black space-y-3 shadow-[3px_3px_0px_0px_#000]"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-[#FFE66D] border border-black text-black">
                      Entropy Score: {cluster.entropyScore}/100
                    </span>
                    {cluster.entropyScore > 80 && (
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-[#FF6B6B] text-white border border-black">
                        Cold Storage
                      </span>
                    )}
                  </div>

                  <h4 className="text-sm font-black text-black leading-tight">{cluster.title}</h4>

                  <div className="flex flex-wrap gap-1">
                    {cluster.keywords.map((kw, idx) => (
                      <span key={idx} className="text-[9px] font-bold bg-white px-1.5 py-0.5 rounded border border-black">
                        #{kw}
                      </span>
                    ))}
                  </div>

                  <div className="bg-white p-2.5 rounded-2xl border border-black text-xs font-bold space-y-1">
                    <div className="flex justify-between text-gray-600">
                      <span>Total Volume:</span>
                      <span className="text-black font-black">{formatSize(cluster.totalSizeBytes)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>File Count:</span>
                      <span className="text-black font-black">{cluster.fileCount} files</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Last Accessed:</span>
                      <span className="text-purple-600 font-black">{cluster.lastAccessed}</span>
                    </div>
                  </div>

                  <button
                    onClick={handleStartMigrationForSelectedFiles}
                    className="w-full py-2 bg-[#4ECDC4] hover:bg-[#3dbbb3] text-black font-black text-xs rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_#000] transition-all cursor-pointer flex items-center justify-center gap-1.5 active:translate-y-0.5"
                  >
                    <span>Migrate Cluster to OneDrive</span>
                    <ArrowRight className="w-3.5 h-3.5 stroke-[3]" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: CROSS-ACCOUNT SOURCE VS TARGET DELTA */}
      {activeSubTab === "cross_account" && (
        <div className="bg-white border-4 border-black rounded-[36px] p-6 shadow-[8px_8px_0px_0px_#000] space-y-6">
          <div className="border-b-2 border-black pb-3">
            <h3 className="text-lg font-black text-black flex items-center gap-2">
              <Network className="w-5 h-5 text-[#FF7675]" />
              <span>Cross-Account Source vs Target Delta Analysis</span>
            </h3>
            <p className="text-xs font-bold text-gray-500">
              Compares your Google Drive source against your OneDrive destination prior to transferring to eliminate redundant bandwidth.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#FFF9F5] p-5 rounded-3xl border-3 border-black space-y-3 shadow-[4px_4px_0px_0px_#000]">
              <div className="text-xs font-black text-gray-500 uppercase">Source Drive Volume</div>
              <div className="text-2xl font-black text-black">{crossAccountData.sourceTotalGB} GB</div>
              <p className="text-xs font-bold text-gray-600">{crossAccountData.sourceAccount}</p>
            </div>

            <div className="bg-[#FFF9F5] p-5 rounded-3xl border-3 border-black space-y-3 shadow-[4px_4px_0px_0px_#000]">
              <div className="text-xs font-black text-gray-500 uppercase">Existing Target Volume</div>
              <div className="text-2xl font-black text-black">{crossAccountData.targetTotalGB} GB</div>
              <p className="text-xs font-bold text-gray-600">{crossAccountData.targetAccount}</p>
            </div>

            <div className="bg-[#FFE66D] p-5 rounded-3xl border-3 border-black space-y-3 shadow-[4px_4px_0px_0px_#000]">
              <div className="text-xs font-black text-black uppercase">Redundant Overlap Saved</div>
              <div className="text-2xl font-black text-[#FF6B6B]">{crossAccountData.redundantBandwidthSavedGB} GB</div>
              <p className="text-xs font-bold text-black">
                Files already exist in OneDrive! Will skip re-downloading.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: HEAVY FILES & DUPLICATES TABLE */}
      {activeSubTab === "heavy_files" && (
        <div className="bg-white border-4 border-black rounded-[36px] p-6 shadow-[8px_8px_0px_0px_#000] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-black pb-3">
            <div>
              <h3 className="text-lg font-black text-black flex items-center gap-2">
                <Trash2 className="w-5 h-5 text-[#FF6B6B]" />
                <span>Heavy Items & Deduplication Queue</span>
              </h3>
              <p className="text-xs font-bold text-gray-500">
                Selected {selectedFileIds.size} files for action.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleStartMigrationForSelectedFiles}
                disabled={selectedFileIds.size === 0}
                className="px-5 py-2.5 bg-[#FFE66D] hover:bg-[#ffd633] text-black font-black text-xs rounded-2xl border-2 border-black shadow-[3px_3px_0px_0px_#000] transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50 active:translate-y-0.5"
              >
                <FolderSync className="w-4 h-4 stroke-[3]" />
                <span>Queue {selectedFileIds.size} Selected Files for OneDrive</span>
                <ArrowRight className="w-4 h-4 stroke-[3]" />
              </button>
            </div>
          </div>

          {/* Files Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-black text-xs font-black text-black bg-slate-100">
                  <th className="py-2.5 px-3 w-8">
                    <input
                      type="checkbox"
                      checked={selectedFileIds.size === sampleFiles.length}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedFileIds(new Set(sampleFiles.map((f) => f.id)));
                        } else {
                          setSelectedFileIds(new Set());
                        }
                      }}
                      className="accent-[#FF6B6B] cursor-pointer"
                    />
                  </th>
                  <th className="py-2.5 px-3">File Name & Path</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Size</th>
                  <th className="py-2.5 px-3">SHA-256 Hash / pHash</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-slate-100 text-xs font-bold">
                {filteredFiles.map((file) => {
                  const isSelected = selectedFileIds.has(file.id);
                  return (
                    <tr
                      key={file.id}
                      className={`hover:bg-slate-50 transition-colors ${
                        isSelected ? "bg-amber-50" : ""
                      }`}
                    >
                      <td className="py-3 px-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectFile(file.id)}
                          className="accent-[#FF6B6B] cursor-pointer"
                        />
                      </td>
                      <td className="py-3 px-3 font-black text-black">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-black shrink-0" />
                          <span className="truncate max-w-[240px]">{file.name}</span>
                          {file.isDuplicate && (
                            <span className="bg-[#FF6B6B] text-white text-[9px] font-black uppercase px-1.5 py-0.5 rounded border border-black">
                              Duplicate
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] font-medium text-gray-500 truncate max-w-[280px]">
                          {file.path}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-gray-600">{file.category}</td>
                      <td className="py-3 px-3 font-black text-[#FF6B6B]">{formatSize(file.sizeBytes)}</td>
                      <td className="py-3 px-3 font-mono text-[10px] text-gray-500">
                        {file.hash ? file.hash.substring(0, 12) + "..." : "N/A"}
                        {file.phashSimilarity && (
                          <span className="block text-emerald-600 font-sans font-bold">
                            pHash: {file.phashSimilarity}% match
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => {
                            setSelectedFileIds(new Set([file.id]));
                            handleStartMigrationForSelectedFiles();
                          }}
                          className="px-2.5 py-1 bg-[#FFE66D] hover:bg-[#ffd633] text-black text-[10px] font-black rounded-lg border border-black shadow-[1px_1px_0px_0px_#000] transition-all cursor-pointer inline-flex items-center gap-1"
                        >
                          <span>Transfer</span>
                          <ArrowRight className="w-3 h-3 stroke-[3]" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
