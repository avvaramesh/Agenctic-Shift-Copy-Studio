import React, { useState } from "react";
import {
  Flame,
  Snowflake,
  Trash2,
  FolderArchive,
  Layers,
  Sparkles,
  CheckCircle2,
  Clock,
  Filter,
  ArrowRight,
  ShieldAlert,
  Search,
  HardDrive,
  RefreshCw,
} from "lucide-react";

interface WasteItem {
  id: string;
  name: string;
  path: string;
  sizeBytes: number;
  reason: "OS Cache (.DS_Store / Thumbs.db)" | "Empty Folder Hierarchy" | "Leftover node_modules / tmp" | "Obsolete Build Artifact";
  lastModifiedDaysAgo: number;
}

interface DirectorySimilarity {
  sourcePath: string;
  targetPath: string;
  jaccardScore: number; // e.g. 0.88 = 88% structural overlap
  matchingFilesCount: number;
  uniqueSourceCount: number;
  recommendation: string;
}

interface EntropyAndWasteViewerProps {
  onPurgeWaste?: (wasteIds: string[]) => void;
  onMigrateStale?: () => void;
}

export const EntropyAndWasteViewer: React.FC<EntropyAndWasteViewerProps> = ({
  onPurgeWaste,
  onMigrateStale,
}) => {
  const [selectedWasteIds, setSelectedWasteIds] = useState<Set<string>>(
    new Set(["w1", "w2", "w3", "w4"])
  );
  const [isPurging, setIsPurging] = useState(false);
  const [hasPurged, setHasPurged] = useState(false);

  // Waste items dataset
  const wasteItems: WasteItem[] = [
    {
      id: "w1",
      name: ".DS_Store & Thumbs.db (142 files)",
      path: "/School/All_Subfolders/",
      sizeBytes: 85_000_000, // 85 MB
      reason: "OS Cache (.DS_Store / Thumbs.db)",
      lastModifiedDaysAgo: 420,
    },
    {
      id: "w2",
      name: "node_modules/ (Abandoned CS Project)",
      path: "/CS_Projects/WebDev_Assignment/node_modules/",
      sizeBytes: 420_000_000, // 420 MB
      reason: "Leftover node_modules / tmp",
      lastModifiedDaysAgo: 680,
    },
    {
      id: "w3",
      name: "tmp_build_cache_2023.log",
      path: "/Archives/2023/tmp/",
      sizeBytes: 210_000_000, // 210 MB
      reason: "Obsolete Build Artifact",
      lastModifiedDaysAgo: 510,
    },
    {
      id: "w4",
      name: "Empty Folder Tree (38 nested directories)",
      path: "/Personal/Unsorted_Folders_Empty/",
      sizeBytes: 0,
      reason: "Empty Folder Hierarchy",
      lastModifiedDaysAgo: 730,
    },
  ];

  // Jaccard Directory Similarities
  const similarityMatrix: DirectorySimilarity[] = [
    {
      sourcePath: "/School/Research_2023/",
      targetPath: "/OneDrive/University_Archive/Research/",
      jaccardScore: 0.88, // 88%
      matchingFilesCount: 142,
      uniqueSourceCount: 18,
      recommendation: "Folders are 88% identical! Merge remaining 18 unique files to OneDrive and archive source.",
    },
    {
      sourcePath: "/Media/Graduation_Photos/",
      targetPath: "/OneDrive/Camera_Roll/2024_Graduation/",
      jaccardScore: 0.74, // 74%
      matchingFilesCount: 310,
      uniqueSourceCount: 42,
      recommendation: "Partial mirror detected. Copy missing 42 photos to sync accounts.",
    },
  ];

  const formatSize = (bytes: number) => {
    if (bytes >= 1_000_000_000) {
      return (bytes / 1_000_000_000).toFixed(1) + " GB";
    }
    return (bytes / 1_000_000).toFixed(0) + " MB";
  };

  const totalWasteBytes = wasteItems
    .filter((w) => selectedWasteIds.has(w.id))
    .reduce((acc, curr) => acc + curr.sizeBytes, 0);

  const toggleSelectWaste = (id: string) => {
    const next = new Set(selectedWasteIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedWasteIds(next);
  };

  const handleRunWastePurge = () => {
    setIsPurging(true);
    setTimeout(() => {
      setIsPurging(false);
      setHasPurged(true);
      if (onPurgeWaste) {
        onPurgeWaste(Array.from(selectedWasteIds));
      }
    }, 1000);
  };

  return (
    <div className="space-y-6">
      {/* Waste Mining Section */}
      <div className="bg-white border-4 border-black rounded-[36px] p-6 shadow-[8px_8px_0px_0px_#000] space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b-2 border-black pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-[#FF6B6B] text-white px-3 py-1 rounded-full text-xs font-black border-2 border-black shadow-[2px_2px_0px_0px_#000] mb-2">
              <Trash2 className="w-3.5 h-3.5 stroke-[3]" /> ORPHAN & WASTE PATTERN MINING
            </div>
            <h3 className="text-xl font-black text-black italic">
              Automated Waste & Temporary Cache Cleaner
            </h3>
            <p className="text-xs font-bold text-gray-600 max-w-xl">
              Detects OS hidden cache files (<code className="bg-slate-100 px-1 font-mono">.DS_Store</code>, <code className="bg-slate-100 px-1 font-mono">Thumbs.db</code>), abandoned <code className="bg-slate-100 px-1 font-mono">node_modules</code>, and empty folder trees wasting metadata slots.
            </p>
          </div>

          <button
            onClick={handleRunWastePurge}
            disabled={isPurging || selectedWasteIds.size === 0}
            className="px-6 py-3.5 bg-[#FF6B6B] hover:bg-[#e05555] text-white font-black text-xs rounded-2xl border-2 border-black shadow-[4px_4px_0px_0px_#000] transition-all cursor-pointer flex items-center gap-2 shrink-0 active:translate-y-1 disabled:opacity-50"
          >
            {isPurging ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Cleaning Waste Items...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4 stroke-[2.5]" />
                <span>Purge {formatSize(totalWasteBytes)} Junk & Waste</span>
              </>
            )}
          </button>
        </div>

        {/* Waste Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-black text-xs font-black text-black bg-slate-100">
                <th className="py-2.5 px-3 w-8">
                  <input
                    type="checkbox"
                    checked={selectedWasteIds.size === wasteItems.length}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedWasteIds(new Set(wasteItems.map((w) => w.id)));
                      } else {
                        setSelectedWasteIds(new Set());
                      }
                    }}
                    className="accent-[#FF6B6B] cursor-pointer"
                  />
                </th>
                <th className="py-2.5 px-3">Waste Category & Location</th>
                <th className="py-2.5 px-3">Size</th>
                <th className="py-2.5 px-3">Age (Days Untouched)</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-slate-100 text-xs font-bold">
              {wasteItems.map((item) => {
                const isSelected = selectedWasteIds.has(item.id);
                return (
                  <tr key={item.id} className={`hover:bg-slate-50 ${isSelected ? "bg-amber-50" : ""}`}>
                    <td className="py-3 px-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectWaste(item.id)}
                        className="accent-[#FF6B6B] cursor-pointer"
                      />
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-black text-black">{item.name}</div>
                      <div className="text-[10px] text-gray-500 font-mono">{item.path}</div>
                    </td>
                    <td className="py-3 px-3 font-black text-[#FF6B6B]">{formatSize(item.sizeBytes)}</td>
                    <td className="py-3 px-3 text-gray-600">{item.lastModifiedDaysAgo} days ago</td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => {
                          setSelectedWasteIds(new Set([item.id]));
                          handleRunWastePurge();
                        }}
                        className="px-2.5 py-1 bg-[#FF6B6B] hover:bg-[#e05555] text-white text-[10px] font-black rounded-lg border border-black shadow-[1px_1px_0px_0px_#000] transition-all cursor-pointer inline-flex items-center gap-1"
                      >
                        <span>Purge</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {hasPurged && (
          <div className="bg-emerald-100 p-4 rounded-2xl border-2 border-black flex items-center gap-3 text-xs font-black text-black">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 stroke-[3]" />
            <span>Cleaned selected temporary files! Storage drive metadata overhead reduced.</span>
          </div>
        )}
      </div>

      {/* Jaccard Directory Structure Similarity */}
      <div className="bg-white border-4 border-black rounded-[36px] p-6 shadow-[8px_8px_0px_0px_#A29BFE] space-y-4">
        <div className="border-b-2 border-black pb-3">
          <h3 className="text-lg font-black text-black flex items-center gap-2 italic">
            <Layers className="w-5 h-5 text-[#A29BFE]" />
            <span>Jaccard Directory Structure Similarity (Google Drive vs OneDrive)</span>
          </h3>
          <p className="text-xs font-bold text-gray-600">
            Calculates intersection-over-union coefficient <code className="bg-slate-100 px-1 font-mono">J(A,B) = |A ∩ B| / |A ∪ B|</code> across folder trees to pinpoint mirrored or semi-cloned directory structures.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {similarityMatrix.map((item, idx) => (
            <div
              key={idx}
              className="bg-slate-50 p-4 rounded-3xl border-3 border-black space-y-3 shadow-[3px_3px_0px_0px_#000]"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-black px-2.5 py-1 rounded-full bg-[#FFE66D] border border-black text-black">
                  Jaccard Similarity: {Math.round(item.jaccardScore * 100)}%
                </span>
                <span className="text-[10px] font-black bg-black text-white px-2 py-0.5 rounded">
                  {item.matchingFilesCount} Matching Files
                </span>
              </div>

              <div className="space-y-1 text-xs font-bold">
                <div className="text-blue-600">Source: {item.sourcePath}</div>
                <div className="text-emerald-600">Target: {item.targetPath}</div>
              </div>

              <p className="text-xs font-bold text-gray-700 bg-white p-3 rounded-2xl border border-black">
                💡 {item.recommendation}
              </p>

              <button
                onClick={onMigrateStale}
                className="w-full py-2.5 bg-[#4ECDC4] hover:bg-[#3dbbb3] text-black font-black text-xs rounded-2xl border-2 border-black shadow-[2px_2px_0px_0px_#000] transition-all cursor-pointer flex items-center justify-center gap-2 active:translate-y-0.5"
              >
                <span>Merge Unsynced Files ({item.uniqueSourceCount} items)</span>
                <ArrowRight className="w-4 h-4 stroke-[3]" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
