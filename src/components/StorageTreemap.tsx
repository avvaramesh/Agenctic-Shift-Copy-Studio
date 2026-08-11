import React, { useState, useMemo } from "react";
import {
  Folder,
  FileText,
  Video,
  Image as ImageIcon,
  FileArchive,
  Trash2,
  Sparkles,
  Info,
  Maximize2,
  ChevronRight,
  Clock,
  Layers,
  Flame,
  Snowflake,
  Sliders,
  ArrowLeft,
  Activity,
  Zap,
  Filter,
  CheckCircle2,
} from "lucide-react";

export interface TreemapNode {
  id: string;
  name: string;
  sizeBytes: number;
  category: "Video" | "Archive" | "Photo" | "Document" | "Duplicate" | "Cache" | "Code";
  color: string;
  ageYears: number; // e.g. 0.2 = active, 2.5 = cold
  lastAccessedDaysAgo: number; // Read velocity
  entropyScore: number; // 0-100 (high = cold/stale)
  fileCount: number;
  path: string;
  isFolder?: boolean;
  children?: TreemapNode[];
}

export interface Rect {
  x: number; // percentage or px
  y: number;
  w: number;
  h: number;
}

export interface LayoutNode extends TreemapNode {
  rect: Rect;
}

interface StorageTreemapProps {
  onSelectNodeForAction?: (node: TreemapNode) => void;
}

// Complete Hierarchical Storage Dataset
const ROOT_STORAGE_DATA: TreemapNode = {
  id: "root",
  name: "All Connected Cloud Drives",
  sizeBytes: 14_800_000_000, // 14.8 GB
  category: "Archive",
  color: "#4ECDC4",
  ageYears: 1.2,
  lastAccessedDaysAgo: 2,
  entropyScore: 45,
  fileCount: 1640,
  path: "/",
  isFolder: true,
  children: [
    {
      id: "folder_school",
      name: "School & University Archive",
      sizeBytes: 7_800_000_000, // 7.8 GB
      category: "Video",
      color: "#FF6B6B",
      ageYears: 0.5,
      lastAccessedDaysAgo: 4,
      entropyScore: 40,
      fileCount: 412,
      path: "/School/",
      isFolder: true,
      children: [
        {
          id: "folder_grad_video",
          name: "4K Raw Graduation Media",
          sizeBytes: 4_800_000_000, // 4.8 GB
          category: "Video",
          color: "#FF6B6B",
          ageYears: 0.2,
          lastAccessedDaysAgo: 3,
          entropyScore: 25,
          fileCount: 42,
          path: "/School/Graduation2024/Videos/",
          isFolder: true,
          children: [
            {
              id: "file_ceremony_4k",
              name: "Ceremony_Stage_4K.mp4",
              sizeBytes: 2_800_000_000,
              category: "Video",
              color: "#FF6B6B",
              ageYears: 0.2,
              lastAccessedDaysAgo: 3, // Flame Hot
              entropyScore: 20,
              fileCount: 1,
              path: "/School/Graduation2024/Videos/Ceremony_Stage_4K.mp4",
            },
            {
              id: "file_broll_mov",
              name: "B-Roll_Campus_Walk.mov",
              sizeBytes: 1_400_000_000,
              category: "Video",
              color: "#FF6B6B",
              ageYears: 0.3,
              lastAccessedDaysAgo: 14, // Warm
              entropyScore: 35,
              fileCount: 1,
              path: "/School/Graduation2024/Videos/B-Roll_Campus_Walk.mov",
            },
            {
              id: "file_audio_wav",
              name: "Raw_Audio_Multitrack.wav",
              sizeBytes: 600_000_000,
              category: "Video",
              color: "#FF6B6B",
              ageYears: 0.5,
              lastAccessedDaysAgo: 45, // Warm
              entropyScore: 40,
              fileCount: 1,
              path: "/School/Graduation2024/Videos/Raw_Audio_Multitrack.wav",
            },
          ],
        },
        {
          id: "folder_research",
          name: "Research & Thesis Datasets",
          sizeBytes: 2_200_000_000, // 2.2 GB
          category: "Document",
          color: "#A29BFE",
          ageYears: 1.8,
          lastAccessedDaysAgo: 400,
          entropyScore: 82,
          fileCount: 210,
          path: "/School/Research_Thesis/",
          isFolder: true,
          children: [
            {
              id: "file_thesis_pdf",
              name: "CS_Thesis_Final_Draft_v4.pdf",
              sizeBytes: 850_000_000,
              category: "Document",
              color: "#A29BFE",
              ageYears: 1.2,
              lastAccessedDaysAgo: 220, // Cool
              entropyScore: 70,
              fileCount: 1,
              path: "/School/Research_Thesis/CS_Thesis_Final_Draft_v4.pdf",
            },
            {
              id: "file_lab_dataset",
              name: "Lab_Data_Recordings_2023.zip",
              sizeBytes: 1_350_000_000,
              category: "Archive",
              color: "#FFE66D",
              ageYears: 2.5,
              lastAccessedDaysAgo: 850, // Frost Cold
              entropyScore: 92,
              fileCount: 1,
              path: "/School/Research_Thesis/Lab_Data_Recordings_2023.zip",
            },
          ],
        },
        {
          id: "folder_assignments",
          name: "Lab Code & Heavy Dependencies",
          sizeBytes: 800_000_000, // 800 MB
          category: "Code",
          color: "#FD79A8",
          ageYears: 2.9,
          lastAccessedDaysAgo: 950,
          entropyScore: 95,
          fileCount: 160,
          path: "/School/Lab_Code/",
          isFolder: true,
          children: [
            {
              id: "file_node_modules",
              name: "node_modules (Abandoned Assignment)",
              sizeBytes: 520_000_000,
              category: "Cache",
              color: "#FF7675",
              ageYears: 2.9,
              lastAccessedDaysAgo: 950, // Frost Cold
              entropyScore: 98,
              fileCount: 150,
              path: "/School/Lab_Code/WebDev/node_modules/",
            },
            {
              id: "file_dl_weights",
              name: "DeepLearning_Weights.bin",
              sizeBytes: 280_000_000,
              category: "Code",
              color: "#FD79A8",
              ageYears: 1.5,
              lastAccessedDaysAgo: 380, // Cool
              entropyScore: 75,
              fileCount: 1,
              path: "/School/Lab_Code/AI/DeepLearning_Weights.bin",
            },
          ],
        },
      ],
    },
    {
      id: "folder_personal",
      name: "Personal Backups & Media Vaults",
      sizeBytes: 5_200_000_000, // 5.2 GB
      category: "Archive",
      color: "#FFE66D",
      ageYears: 2.2,
      lastAccessedDaysAgo: 600,
      entropyScore: 88,
      fileCount: 1100,
      path: "/Personal/",
      isFolder: true,
      children: [
        {
          id: "folder_zip_backups",
          name: "Old Laptop ZIP Archives",
          sizeBytes: 3_200_000_000, // 3.2 GB
          category: "Archive",
          color: "#FFE66D",
          ageYears: 3.1,
          lastAccessedDaysAgo: 1100, // Deep Frost
          entropyScore: 96,
          fileCount: 18,
          path: "/Personal/OldLaptop_Backups/",
          isFolder: true,
          children: [
            {
              id: "file_datasets_2022",
              name: "CS_Project_Datasets_2022.zip",
              sizeBytes: 2_100_000_000,
              category: "Archive",
              color: "#FFE66D",
              ageYears: 3.1,
              lastAccessedDaysAgo: 1100,
              entropyScore: 96,
              fileCount: 1,
              path: "/Personal/OldLaptop_Backups/CS_Project_Datasets_2022.zip",
            },
            {
              id: "file_figma_exports",
              name: "Figma_Exports_Archive.tar.gz",
              sizeBytes: 1_100_000_000,
              category: "Archive",
              color: "#FFE66D",
              ageYears: 2.8,
              lastAccessedDaysAgo: 980,
              entropyScore: 94,
              fileCount: 1,
              path: "/Personal/OldLaptop_Backups/Figma_Exports_Archive.tar.gz",
            },
          ],
        },
        {
          id: "folder_photos",
          name: "Campus Event RAW Photos",
          sizeBytes: 2_000_000_000, // 2.0 GB
          category: "Photo",
          color: "#4ECDC4",
          ageYears: 0.8,
          lastAccessedDaysAgo: 120, // Warm
          entropyScore: 50,
          fileCount: 1082,
          path: "/Personal/Photos_Campus/",
          isFolder: true,
          children: [
            {
              id: "file_raw_photos_zip",
              name: "Campus_Event_RAW_Photos.zip",
              sizeBytes: 1_400_000_000,
              category: "Photo",
              color: "#4ECDC4",
              ageYears: 0.8,
              lastAccessedDaysAgo: 120,
              entropyScore: 50,
              fileCount: 1,
              path: "/Personal/Photos_Campus/Campus_Event_RAW_Photos.zip",
            },
            {
              id: "file_album_webp",
              name: "Album_Selected_WebP.zip",
              sizeBytes: 600_000_000,
              category: "Photo",
              color: "#4ECDC4",
              ageYears: 0.4,
              lastAccessedDaysAgo: 25, // Flame Hot
              entropyScore: 30,
              fileCount: 1,
              path: "/Personal/Photos_Campus/Album_Selected_WebP.zip",
            },
          ],
        },
      ],
    },
    {
      id: "folder_unsorted",
      name: "Unsorted Copies & Temporary Cache",
      sizeBytes: 1_800_000_000, // 1.8 GB
      category: "Duplicate",
      color: "#FF7675",
      ageYears: 2.1,
      lastAccessedDaysAgo: 700,
      entropyScore: 92,
      fileCount: 118,
      path: "/Duplicates_And_Cache/",
      isFolder: true,
      children: [
        {
          id: "file_dup_vault",
          name: "Identical Duplicate Datasets",
          sizeBytes: 1_200_000_000,
          category: "Duplicate",
          color: "#FF7675",
          ageYears: 2.0,
          lastAccessedDaysAgo: 700,
          entropyScore: 92,
          fileCount: 14,
          path: "/Duplicates_And_Cache/Identical_Copies/",
        },
        {
          id: "file_cache_junk",
          name: "OS Cache (.DS_Store & Thumbs.db)",
          sizeBytes: 600_000_000,
          category: "Cache",
          color: "#FF7675",
          ageYears: 3.0,
          lastAccessedDaysAgo: 1050,
          entropyScore: 99,
          fileCount: 104,
          path: "/Duplicates_And_Cache/OS_Cache/",
        },
      ],
    },
  ],
};

// Squarified Treemap Layout Function
function computeSquarifiedLayout(
  nodes: TreemapNode[],
  x: number,
  y: number,
  width: number,
  height: number
): LayoutNode[] {
  if (!nodes || nodes.length === 0) return [];

  const totalBytes = nodes.reduce((sum, n) => sum + n.sizeBytes, 0);
  if (totalBytes === 0) return [];

  const sortedNodes = [...nodes].sort((a, b) => b.sizeBytes - a.sizeBytes);
  const layoutNodes: LayoutNode[] = [];

  let curX = x;
  let curY = y;
  let curW = width;
  let curH = height;

  let remainingNodes = [...sortedNodes];

  while (remainingNodes.length > 0) {
    const isHorizontal = curW >= curH;
    const currentLine: TreemapNode[] = [];
    let currentLineBytes = 0;

    const remainingTotalBytes = remainingNodes.reduce((s, n) => s + n.sizeBytes, 0);

    // Grab first node
    const first = remainingNodes.shift()!;
    currentLine.push(first);
    currentLineBytes += first.sizeBytes;

    // Add nodes to current row/column while improving or keeping aspect ratio
    while (remainingNodes.length > 0) {
      const candidate = remainingNodes[0];
      const nextLineBytes = currentLineBytes + candidate.sizeBytes;

      // Calculate worst aspect ratio for currentLine vs nextLine
      const currentRatio = calculateWorstRatio(currentLine, currentLineBytes, isHorizontal ? curH : curW, totalBytes, isHorizontal ? curW : curH);
      const nextLine = [...currentLine, candidate];
      const nextRatio = calculateWorstRatio(nextLine, nextLineBytes, isHorizontal ? curH : curW, totalBytes, isHorizontal ? curW : curH);

      if (nextRatio <= currentRatio) {
        currentLine.push(remainingNodes.shift()!);
        currentLineBytes = nextLineBytes;
      } else {
        break;
      }
    }

    // Lay out the current row/column
    const lineRatio = currentLineBytes / remainingTotalBytes;

    if (isHorizontal) {
      const chunkWidth = curW * (currentLineBytes / remainingTotalBytes);
      let itemY = curY;

      for (const node of currentLine) {
        const itemHeight = curH * (node.sizeBytes / currentLineBytes);
        layoutNodes.push({
          ...node,
          rect: {
            x: curX,
            y: itemY,
            w: Math.max(0, chunkWidth),
            h: Math.max(0, itemHeight),
          },
        });
        itemY += itemHeight;
      }

      curX += chunkWidth;
      curW -= chunkWidth;
    } else {
      const chunkHeight = curH * (currentLineBytes / remainingTotalBytes);
      let itemX = curX;

      for (const node of currentLine) {
        const itemWidth = curW * (node.sizeBytes / currentLineBytes);
        layoutNodes.push({
          ...node,
          rect: {
            x: itemX,
            y: curY,
            w: Math.max(0, itemWidth),
            h: Math.max(0, chunkHeight),
          },
        });
        itemX += itemWidth;
      }

      curY += chunkHeight;
      curH -= chunkHeight;
    }
  }

  return layoutNodes;
}

function calculateWorstRatio(
  line: TreemapNode[],
  lineBytes: number,
  sideLength: number,
  totalBytes: number,
  otherSide: number
): number {
  if (lineBytes === 0 || sideLength === 0) return Infinity;
  const lineArea = (lineBytes / totalBytes) * (sideLength * otherSide);
  if (lineArea === 0) return Infinity;

  let maxRatio = 0;
  for (const node of line) {
    const itemArea = (node.sizeBytes / lineBytes) * lineArea;
    const itemSide = itemArea / (sideLength * (node.sizeBytes / lineBytes));
    const ratio = Math.max(itemSide / sideLength, sideLength / itemSide);
    if (ratio > maxRatio) maxRatio = ratio;
  }
  return maxRatio;
}

export const StorageTreemap: React.FC<StorageTreemapProps> = ({
  onSelectNodeForAction,
}) => {
  const [currentPath, setCurrentPath] = useState<TreemapNode[]>([ROOT_STORAGE_DATA]);
  const [colorMode, setColorMode] = useState<"category" | "velocity" | "entropy">("category");
  const [selectedNode, setSelectedNode] = useState<TreemapNode | null>(null);
  const [minSizeMB, setMinSizeMB] = useState<number>(0);

  // Current Active Root Node based on breadcrumbs
  const activeRoot = currentPath[currentPath.length - 1];

  // Filter children of active root by minimum size threshold
  const filteredChildren = useMemo(() => {
    if (!activeRoot.children) return [];
    const minBytes = minSizeMB * 1_000_000;
    return activeRoot.children.filter((child) => child.sizeBytes >= minBytes);
  }, [activeRoot, minSizeMB]);

  // Compute Squarified Layout (Width 100%, Height 100%)
  const layoutNodes = useMemo(() => {
    return computeSquarifiedLayout(filteredChildren, 0, 0, 100, 100);
  }, [filteredChildren]);

  const formatSize = (bytes: number) => {
    if (bytes >= 1_000_000_000) {
      return (bytes / 1_000_000_000).toFixed(1) + " GB";
    }
    return (bytes / 1_000_000).toFixed(0) + " MB";
  };

  // Color generator based on mode
  const getNodeColor = (node: TreemapNode) => {
    if (colorMode === "category") {
      return node.color;
    }

    if (colorMode === "velocity") {
      // Access Velocity Heatmap
      if (node.lastAccessedDaysAgo <= 14) return "#FF6B6B"; // 🔥 Flame Hot (<2 wks)
      if (node.lastAccessedDaysAgo <= 180) return "#FFE66D"; // ⚡ Warm (2wks - 6mo)
      if (node.lastAccessedDaysAgo <= 730) return "#4ECDC4"; // ❄️ Cool (6mo - 2 yrs)
      return "#6C5CE7"; // 🧊 Deep Frost (> 2 yrs)
    }

    // Color by Entropy Score (0-100)
    if (node.entropyScore >= 80) return "#6C5CE7"; // Stale cold data
    if (node.entropyScore >= 50) return "#4ECDC4"; // Warm
    return "#FF6B6B"; // Active hot data
  };

  // Drill Down into a subfolder
  const handleNodeClick = (node: LayoutNode) => {
    setSelectedNode(node);
    if (node.isFolder && node.children && node.children.length > 0) {
      setCurrentPath((prev) => [...prev, node]);
      setSelectedNode(null);
    }
  };

  // Navigate back in breadcrumb
  const handleNavigateToBreadcrumb = (index: number) => {
    setCurrentPath((prev) => prev.slice(0, index + 1));
    setSelectedNode(null);
  };

  const activeMappedVolumeBytes = filteredChildren.reduce((sum, n) => sum + n.sizeBytes, 0);
  const hiddenCount = (activeRoot.children?.length || 0) - filteredChildren.length;

  return (
    <div className="bg-white border-4 border-black rounded-[36px] p-6 shadow-[8px_8px_0px_0px_#000] space-y-6">
      {/* Top Banner & Mode Switches */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b-2 border-black pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 bg-[#4ECDC4] text-black px-3 py-1 rounded-full text-xs font-black border-2 border-black shadow-[2px_2px_0px_0px_#000] mb-2">
            <Layers className="w-3.5 h-3.5 stroke-[3]" /> SQUARIFIED DISK HEATMAP ENGINE
          </div>
          <h3 className="text-xl font-black text-black italic">
            Interactive Squarified Storage Treemap & Read Velocity Heatmap
          </h3>
          <p className="text-xs font-bold text-gray-600 max-w-xl">
            Optimized rectangle aspect ratios prevent thin slivers. Click any folder block to zoom into sub-trees or switch between Category and Read Velocity Heatmaps.
          </p>
        </div>

        {/* Heatmap Color Mode Selector */}
        <div className="flex items-center gap-1 bg-slate-100 p-1.5 rounded-2xl border-2 border-black shadow-[2px_2px_0px_0px_#000] shrink-0">
          <button
            onClick={() => setColorMode("category")}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
              colorMode === "category"
                ? "bg-[#FFE66D] text-black shadow-[1px_1px_0px_0px_#000]"
                : "text-gray-600 hover:text-black"
            }`}
          >
            <span>File Category</span>
          </button>

          <button
            onClick={() => setColorMode("velocity")}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
              colorMode === "velocity"
                ? "bg-[#FF6B6B] text-white shadow-[1px_1px_0px_0px_#000]"
                : "text-gray-600 hover:text-black"
            }`}
          >
            <Flame className="w-3.5 h-3.5 stroke-[3]" />
            <span>Read Velocity</span>
          </button>

          <button
            onClick={() => setColorMode("entropy")}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
              colorMode === "entropy"
                ? "bg-[#6C5CE7] text-white shadow-[1px_1px_0px_0px_#000]"
                : "text-gray-600 hover:text-black"
            }`}
          >
            <Snowflake className="w-3.5 h-3.5 stroke-[3]" />
            <span>Aging & Entropy</span>
          </button>
        </div>
      </div>

      {/* Breadcrumbs Navigation & Minimum Size Filter Slider */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-slate-50 p-4 rounded-3xl border-3 border-black shadow-[3px_3px_0px_0px_#000]">
        {/* Breadcrumb Trail */}
        <div className="flex items-center gap-2 overflow-x-auto py-1 text-xs font-black">
          {currentPath.length > 1 && (
            <button
              onClick={() => handleNavigateToBreadcrumb(currentPath.length - 2)}
              className="p-1.5 bg-white border border-black rounded-xl hover:bg-slate-200 transition-all cursor-pointer mr-1"
              title="Go Up One Level"
            >
              <ArrowLeft className="w-4 h-4 stroke-[3]" />
            </button>
          )}

          {currentPath.map((node, idx) => {
            const isLast = idx === currentPath.length - 1;
            return (
              <React.Fragment key={node.id}>
                {idx > 0 && <ChevronRight className="w-4 h-4 text-gray-400 shrink-0 stroke-[3]" />}
                <button
                  onClick={() => handleNavigateToBreadcrumb(idx)}
                  className={`px-3 py-1.5 rounded-xl border-2 border-black transition-all shrink-0 cursor-pointer ${
                    isLast
                      ? "bg-[#4ECDC4] text-black shadow-[2px_2px_0px_0px_#000]"
                      : "bg-white text-gray-700 hover:bg-slate-200"
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    {idx === 0 ? <Folder className="w-3.5 h-3.5 fill-black" /> : <Folder className="w-3.5 h-3.5" />}
                    <span>{node.name}</span>
                  </span>
                </button>
              </React.Fragment>
            );
          })}
        </div>

        {/* Size Filter Slider */}
        <div className="flex items-center gap-3 bg-white p-2.5 rounded-2xl border-2 border-black shrink-0">
          <Filter className="w-4 h-4 text-gray-500 stroke-[2.5]" />
          <div className="flex flex-col space-y-0.5">
            <div className="flex items-center justify-between gap-4 text-[11px] font-black">
              <span className="text-gray-500 uppercase">Min Size Threshold:</span>
              <span className="text-[#FF6B6B] font-black">
                {minSizeMB === 0 ? "All Items (0 MB)" : `> ${minSizeMB >= 1000 ? (minSizeMB / 1000).toFixed(1) + " GB" : minSizeMB + " MB"}`}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="2000"
              step="100"
              value={minSizeMB}
              onChange={(e) => setMinSizeMB(Number(e.target.value))}
              className="w-48 accent-[#FF6B6B] cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Legend & Stats Overview */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#FFF9F5] p-3 rounded-2xl border-2 border-black text-xs font-bold">
        <div className="flex items-center gap-4">
          <span className="text-gray-500 font-black uppercase text-[10px]">Legend:</span>
          {colorMode === "category" ? (
            <>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-[#FF6B6B] border border-black inline-block" /> Video</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-[#FFE66D] border border-black inline-block" /> Archive</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-[#4ECDC4] border border-black inline-block" /> Photos</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-[#A29BFE] border border-black inline-block" /> Document</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-[#FF7675] border border-black inline-block" /> Duplicate / Cache</span>
            </>
          ) : colorMode === "velocity" ? (
            <>
              <span className="flex items-center gap-1"><Flame className="w-3.5 h-3.5 text-[#FF6B6B]" /><span className="w-3 h-3 rounded bg-[#FF6B6B] border border-black inline-block" /> Flame Hot (&lt;14d)</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-[#FFE66D] border border-black inline-block" /> Warm (&lt;6mo)</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-[#4ECDC4] border border-black inline-block" /> Cool (&lt;2yr)</span>
              <span className="flex items-center gap-1"><Snowflake className="w-3.5 h-3.5 text-[#6C5CE7]" /><span className="w-3 h-3 rounded bg-[#6C5CE7] border border-black inline-block" /> Deep Frost (&gt;2yr)</span>
            </>
          ) : (
            <>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-[#FF6B6B] border border-black inline-block" /> Active Data</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-[#4ECDC4] border border-black inline-block" /> Medium Age</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-[#6C5CE7] border border-black inline-block" /> Cold Stale Storage</span>
            </>
          )}
        </div>

        <div className="text-gray-600 text-[11px] font-black">
          Mapped: <span className="text-black">{formatSize(activeMappedVolumeBytes)}</span>
          {hiddenCount > 0 && <span className="text-[#FF6B6B] ml-2">({hiddenCount} small items filtered out)</span>}
        </div>
      </div>

      {/* SQUARIFIED TREEMAP CANVAS STAGE */}
      <div className="relative w-full h-[440px] bg-slate-900 rounded-[32px] border-4 border-black p-2 overflow-hidden shadow-[6px_6px_0px_0px_#000]">
        {layoutNodes.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-white space-y-2">
            <Filter className="w-8 h-8 text-[#FFE66D]" />
            <p className="font-black text-sm">No items meet the current size filter threshold ({minSizeMB} MB).</p>
            <button
              onClick={() => setMinSizeMB(0)}
              className="px-4 py-2 bg-[#FFE66D] text-black rounded-xl font-black text-xs border border-black"
            >
              Reset Minimum Size Filter
            </button>
          </div>
        ) : (
          layoutNodes.map((node) => {
            const isFolderWithChildren = node.isFolder && node.children && node.children.length > 0;
            const percentageOfParent = Math.round((node.sizeBytes / activeRoot.sizeBytes) * 100);

            return (
              <div
                key={node.id}
                onClick={() => handleNodeClick(node)}
                style={{
                  left: `${node.rect.x}%`,
                  top: `${node.rect.y}%`,
                  width: `${node.rect.w}%`,
                  height: `${node.rect.h}%`,
                  backgroundColor: getNodeColor(node),
                }}
                className="absolute p-2 border-2 border-black rounded-2xl cursor-pointer hover:brightness-110 hover:z-20 transition-all flex flex-col justify-between overflow-hidden group shadow-[2px_2px_0px_0px_#000]"
              >
                {/* Node Title Header */}
                <div className="flex items-start justify-between gap-1 relative z-10">
                  <div className="bg-white/95 text-black font-black text-[11px] px-2 py-0.5 rounded-lg border border-black shadow-[1px_1px_0px_0px_#000] flex items-center gap-1 truncate max-w-[80%]">
                    {isFolderWithChildren ? (
                      <Folder className="w-3.5 h-3.5 fill-amber-400 stroke-black shrink-0" />
                    ) : node.category === "Video" ? (
                      <Video className="w-3.5 h-3.5 text-[#FF6B6B] shrink-0" />
                    ) : node.category === "Archive" ? (
                      <FileArchive className="w-3.5 h-3.5 text-[#FFE66D] shrink-0" />
                    ) : (
                      <FileText className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    )}
                    <span className="truncate">{node.name}</span>
                  </div>

                  <span className="bg-black text-white font-black text-[10px] px-1.5 py-0.5 rounded border border-white shrink-0">
                    {formatSize(node.sizeBytes)}
                  </span>
                </div>

                {/* Sub-item count or preview */}
                {node.rect.h > 15 && (
                  <div className="text-[10px] font-black text-black/90 space-y-0.5 relative z-10 pt-1">
                    <div className="flex items-center justify-between">
                      <span className="bg-white/80 px-1.5 py-0.5 rounded border border-black text-[9px]">
                        {percentageOfParent}% of parent
                      </span>
                      {isFolderWithChildren && (
                        <span className="bg-[#FFE66D] text-black px-1.5 py-0.5 rounded border border-black text-[9px] font-black group-hover:translate-x-0.5 transition-transform">
                          Zoom In ({node.children?.length} items) →
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Bottom Path */}
                {node.rect.h > 25 && (
                  <div className="text-[9px] font-mono text-black/80 truncate pt-1 relative z-10 border-t border-black/20">
                    {node.path}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Selected Node Details Drawer */}
      {selectedNode && (
        <div className="bg-[#FFF9F5] p-5 rounded-3xl border-3 border-black space-y-3 shadow-[4px_4px_0px_0px_#000] animate-in fade-in">
          <div className="flex items-center justify-between border-b-2 border-black pb-2">
            <div className="flex items-center gap-2">
              <Folder className="w-5 h-5 text-[#FF6B6B] fill-amber-300" />
              <div>
                <h4 className="text-base font-black text-black">{selectedNode.name}</h4>
                <span className="text-[10px] font-mono text-gray-500">{selectedNode.path}</span>
              </div>
            </div>
            <button
              onClick={() => setSelectedNode(null)}
              className="text-xs font-black px-2.5 py-1 bg-white border border-black rounded-lg cursor-pointer hover:bg-slate-100"
            >
              Close
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-bold">
            <div className="bg-white p-2.5 rounded-2xl border border-black">
              <span className="text-gray-500 block text-[10px] uppercase font-black">Volume Size:</span>
              <span className="text-[#FF6B6B] font-black text-sm">{formatSize(selectedNode.sizeBytes)}</span>
            </div>

            <div className="bg-white p-2.5 rounded-2xl border border-black">
              <span className="text-gray-500 block text-[10px] uppercase font-black">Last Read / Velocity:</span>
              <span className="text-black font-black text-sm">
                {selectedNode.lastAccessedDaysAgo} days ago
              </span>
            </div>

            <div className="bg-white p-2.5 rounded-2xl border border-black">
              <span className="text-gray-500 block text-[10px] uppercase font-black">Entropy (Stale Index):</span>
              <span className="text-purple-600 font-black text-sm">{selectedNode.entropyScore}/100</span>
            </div>

            <div className="bg-white p-2.5 rounded-2xl border border-black">
              <span className="text-gray-500 block text-[10px] uppercase font-black">Item Count:</span>
              <span className="text-black font-black text-sm">{selectedNode.fileCount} items</span>
            </div>
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-between gap-2">
            {selectedNode.isFolder && selectedNode.children && selectedNode.children.length > 0 && (
              <button
                onClick={() => {
                  setCurrentPath((prev) => [...prev, selectedNode]);
                  setSelectedNode(null);
                }}
                className="px-4 py-2 bg-[#4ECDC4] text-black font-black text-xs rounded-xl border border-black shadow-[2px_2px_0px_0px_#000] cursor-pointer hover:bg-[#3dbbb3]"
              >
                Drill Into Subfolder →
              </button>
            )}

            <button
              onClick={() => onSelectNodeForAction && onSelectNodeForAction(selectedNode)}
              className="px-5 py-2.5 bg-[#FFE66D] hover:bg-[#ffd633] text-black font-black text-xs rounded-2xl border-2 border-black shadow-[3px_3px_0px_0px_#000] transition-all cursor-pointer flex items-center gap-2 active:translate-y-0.5 ml-auto"
            >
              <span>Queue Node for Transfer / Backup</span>
              <ChevronRight className="w-4 h-4 stroke-[3]" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
