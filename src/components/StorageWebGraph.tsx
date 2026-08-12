import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { UserProfile, SelectedFolderState } from "../types";
import {
  Network,
  Search,
  Filter,
  Maximize2,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Layers,
  HardDrive,
  Folder,
  FileText,
  Video,
  FileArchive,
  Image as ImageIcon,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Trash2,
  Info,
  CheckCircle2,
  Sliders,
  Cpu,
  RefreshCw,
  FolderSync,
  ExternalLink,
  Tag
} from "lucide-react";

interface StorageWebGraphProps {
  user: UserProfile | null;
  onSelectForTransfer?: (folder: SelectedFolderState) => void;
  onSwitchToExplorer?: () => void;
}

export interface GraphNode {
  id: string;
  label: string;
  type: "drive" | "folder" | "file";
  category?: "video" | "archive" | "photo" | "document" | "code" | "other";
  drive: "google_drive" | "onedrive" | "local_vault";
  sizeBytes?: number;
  path: string;
  hash?: string;
  phashSimilarity?: number;
  vectorCluster?: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  isDuplicate?: boolean;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  relationType: "parent_child" | "duplicate_hash" | "duplicate_phash" | "vector_similarity";
  label?: string;
  strength?: number;
}

export const StorageWebGraph: React.FC<StorageWebGraphProps> = ({
  user,
  onSelectForTransfer,
  onSwitchToExplorer,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [dimensions, setDimensions] = useState<{ width: number; height: number }>({ width: 900, height: 600 });

  // Viewport Pan & Zoom state
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [startPan, setStartPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Physics Simulation Settings
  const [repulsion, setRepulsion] = useState<number>(350);
  const [linkDistance, setLinkDistance] = useState<number>(80);
  const [isPhysicsRunning, setIsPhysicsRunning] = useState<boolean>(true);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [driveFilter, setDriveFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"ALL_NODES" | "DUPLICATES_ONLY" | "VECTOR_SEMANTIC" | "CROSS_CLOUD">("ALL_NODES");
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Dragging individual node
  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null);

  // Initializing mock graph data across 3 drives
  const initialNodes: GraphNode[] = useMemo(() => {
    return [
      // Drives
      { id: "drive_gdrive", label: "Google Drive (Main)", type: "drive", drive: "google_drive", path: "Google Drive:", x: 250, y: 200, vx: 0, vy: 0, radius: 28, color: "#4ECDC4" },
      { id: "drive_onedrive", label: "Microsoft OneDrive", type: "drive", drive: "onedrive", path: "OneDrive:", x: 650, y: 200, vx: 0, vy: 0, radius: 28, color: "#FFE66D" },
      { id: "drive_local", label: "Local Vault Backup", type: "drive", drive: "local_vault", path: "Local Vault:", x: 450, y: 480, vx: 0, vy: 0, radius: 28, color: "#A29BFE" },

      // Folders - Google Drive
      { id: "f_grad", label: "/Graduation2024", type: "folder", drive: "google_drive", path: "/Graduation2024", x: 200, y: 120, vx: 0, vy: 0, radius: 18, color: "#3B82F6" },
      { id: "f_cs", label: "/CS_Projects", type: "folder", drive: "google_drive", path: "/CS_Projects", x: 150, y: 280, vx: 0, vy: 0, radius: 18, color: "#3B82F6" },
      { id: "f_photos", label: "/CameraUploads", type: "folder", drive: "google_drive", path: "/CameraUploads", x: 320, y: 100, vx: 0, vy: 0, radius: 18, color: "#3B82F6" },

      // Folders - OneDrive
      { id: "f_work", label: "/Work_Archives", type: "folder", drive: "onedrive", path: "/Work_Archives", x: 700, y: 120, vx: 0, vy: 0, radius: 18, color: "#F59E0B" },
      { id: "f_backup", label: "/Cloud_Backups", type: "folder", drive: "onedrive", path: "/Cloud_Backups", x: 750, y: 280, vx: 0, vy: 0, radius: 18, color: "#F59E0B" },

      // Files - Google Drive
      { id: "doc_grad_raw", label: "Graduation_4K_Raw.mp4", type: "file", category: "video", drive: "google_drive", sizeBytes: 4300000000, path: "/Graduation2024/Graduation_4K_Raw.mp4", hash: "hash_4k_raw", vectorCluster: "Media Renders", x: 180, y: 50, vx: 0, vy: 0, radius: 12, color: "#FF6B6B", isDuplicate: true },
      { id: "doc_cs_zip", label: "CS_Final_Backup.zip", type: "file", category: "archive", drive: "google_drive", sizeBytes: 2800000000, path: "/CS_Projects/CS_Final_Backup.zip", hash: "hash_cs_zip", vectorCluster: "CS Research", x: 100, y: 240, vx: 0, vy: 0, radius: 12, color: "#FFE66D", isDuplicate: true },
      { id: "doc_paper", label: "Thesis_Draft_v3.pdf", type: "file", category: "document", drive: "google_drive", sizeBytes: 15000000, path: "/CS_Projects/Thesis_Draft_v3.pdf", hash: "hash_thesis", vectorCluster: "CS Research", x: 80, y: 320, vx: 0, vy: 0, radius: 10, color: "#A29BFE" },
      { id: "doc_photo1", label: "IMG_9942_Sunset.raw", type: "file", category: "photo", drive: "google_drive", sizeBytes: 45000000, path: "/CameraUploads/IMG_9942_Sunset.raw", phashSimilarity: 0.96, vectorCluster: "Photography", x: 340, y: 40, vx: 0, vy: 0, radius: 10, color: "#4ECDC4", isDuplicate: true },

      // Files - OneDrive
      { id: "doc_onedrive_dup", label: "Graduation_4K_Raw_Backup.mp4", type: "file", category: "video", drive: "onedrive", sizeBytes: 4300000000, path: "/Work_Archives/Graduation_4K_Raw_Backup.mp4", hash: "hash_4k_raw", vectorCluster: "Media Renders", x: 740, y: 60, vx: 0, vy: 0, radius: 12, color: "#FF6B6B", isDuplicate: true },
      { id: "doc_onedrive_cs_zip", label: "CS_Final_Backup_2024.zip", type: "file", category: "archive", drive: "onedrive", sizeBytes: 2800000000, path: "/Cloud_Backups/CS_Final_Backup_2024.zip", hash: "hash_cs_zip", vectorCluster: "CS Research", x: 820, y: 240, vx: 0, vy: 0, radius: 12, color: "#FFE66D", isDuplicate: true },
      { id: "doc_photo1_compressed", label: "IMG_9942_Sunset_Compressed.jpg", type: "file", category: "photo", drive: "onedrive", sizeBytes: 8500000, path: "/Work_Archives/IMG_9942_Sunset_Compressed.jpg", phashSimilarity: 0.96, vectorCluster: "Photography", x: 640, y: 80, vx: 0, vy: 0, radius: 10, color: "#4ECDC4", isDuplicate: true },
      { id: "doc_report", label: "Quarterly_Financial_Report.xlsx", type: "file", category: "document", drive: "onedrive", sizeBytes: 8200000, path: "/Work_Archives/Quarterly_Financial_Report.xlsx", vectorCluster: "Finance", x: 780, y: 140, vx: 0, vy: 0, radius: 10, color: "#A29BFE" },

      // Local Vault Nodes
      { id: "f_local_tax", label: "/Tax2024_Docs", type: "folder", drive: "local_vault", path: "/Tax2024_Docs", x: 420, y: 560, vx: 0, vy: 0, radius: 18, color: "#8B5CF6" },
      { id: "doc_tax_return", label: "Tax_Return_2024_Signed.pdf", type: "file", category: "document", drive: "local_vault", sizeBytes: 12000000, path: "/Tax2024_Docs/Tax_Return_2024_Signed.pdf", vectorCluster: "Finance", x: 480, y: 620, vx: 0, vy: 0, radius: 10, color: "#A29BFE" },
    ];
  }, []);

  const initialEdges: GraphEdge[] = useMemo(() => {
    return [
      // Hierarchy
      { id: "e1", source: "drive_gdrive", target: "f_grad", relationType: "parent_child" },
      { id: "e2", source: "drive_gdrive", target: "f_cs", relationType: "parent_child" },
      { id: "e3", source: "drive_gdrive", target: "f_photos", relationType: "parent_child" },
      { id: "e4", source: "f_grad", target: "doc_grad_raw", relationType: "parent_child" },
      { id: "e5", source: "f_cs", target: "doc_cs_zip", relationType: "parent_child" },
      { id: "e6", source: "f_cs", target: "doc_paper", relationType: "parent_child" },
      { id: "e7", source: "f_photos", target: "doc_photo1", relationType: "parent_child" },

      { id: "e8", source: "drive_onedrive", target: "f_work", relationType: "parent_child" },
      { id: "e9", source: "drive_onedrive", target: "f_backup", relationType: "parent_child" },
      { id: "e10", source: "f_work", target: "doc_onedrive_dup", relationType: "parent_child" },
      { id: "e11", source: "f_backup", target: "doc_onedrive_cs_zip", relationType: "parent_child" },
      { id: "e12", source: "f_work", target: "doc_photo1_compressed", relationType: "parent_child" },
      { id: "e13", source: "f_work", target: "doc_report", relationType: "parent_child" },

      { id: "e14", source: "drive_local", target: "f_local_tax", relationType: "parent_child" },
      { id: "e15", source: "f_local_tax", target: "doc_tax_return", relationType: "parent_child" },

      // Duplicate Hash Edges (Red)
      { id: "dup_4k", source: "doc_grad_raw", target: "doc_onedrive_dup", relationType: "duplicate_hash", label: "100% SHA-256 Match" },
      { id: "dup_cs_zip", source: "doc_cs_zip", target: "doc_onedrive_cs_zip", relationType: "duplicate_hash", label: "100% SHA-256 Match" },

      // Duplicate pHash Edges (Purple)
      { id: "phash_sunset", source: "doc_photo1", target: "doc_photo1_compressed", relationType: "duplicate_phash", label: "96% Perceptual Match" },

      // Vector Similarity Edges (Cyan)
      { id: "vec_thesis_report", source: "doc_paper", target: "doc_report", relationType: "vector_similarity", label: "0.82 Gemini Semantic Match" },
      { id: "vec_tax_report", source: "doc_tax_return", target: "doc_report", relationType: "vector_similarity", label: "0.89 Gemini Finance Match" },
    ];
  }, []);

  const [nodes, setNodes] = useState<GraphNode[]>(initialNodes);
  const [edges, setEdges] = useState<GraphEdge[]>(initialEdges);

  // Measure container dimensions with ResizeObserver for true responsiveness
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        if (entry.contentRect) {
          setDimensions({
            width: entry.contentRect.width,
            height: Math.max(550, entry.contentRect.height),
          });
        }
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Simple, smooth 2D physics simulation loop
  useEffect(() => {
    if (!isPhysicsRunning) return;

    let animId: number;
    const center = { x: dimensions.width / 2, y: dimensions.height / 2 };

    const stepSimulation = () => {
      setNodes((prevNodes) => {
        const nextNodes = prevNodes.map((node) => ({ ...node }));

        // 1. Repulsion between all node pairs (Coulomb force)
        for (let i = 0; i < nextNodes.length; i++) {
          for (let j = i + 1; j < nextNodes.length; j++) {
            const n1 = nextNodes[i];
            const n2 = nextNodes[j];
            const dx = n2.x - n1.x;
            const dy = n2.y - n1.y;
            const distSq = dx * dx + dy * dy + 1;
            const dist = Math.sqrt(distSq);

            if (dist < 300) {
              const force = (repulsion * 50) / distSq;
              const fx = (dx / dist) * force;
              const fy = (dy / dist) * force;

              if (n1.id !== draggedNodeId) {
                n1.vx -= fx;
                n1.vy -= fy;
              }
              if (n2.id !== draggedNodeId) {
                n2.vx += fx;
                n2.vy += fy;
              }
            }
          }
        }

        // 2. Link Attraction forces (Hooke's spring force)
        edges.forEach((edge) => {
          const sourceNode = nextNodes.find((n) => n.id === edge.source);
          const targetNode = nextNodes.find((n) => n.id === edge.target);

          if (sourceNode && targetNode) {
            const dx = targetNode.x - sourceNode.x;
            const dy = targetNode.y - sourceNode.y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            const desiredDist = edge.relationType === "parent_child" ? linkDistance : linkDistance * 1.5;
            const delta = dist - desiredDist;
            const springForce = delta * 0.03;

            const fx = (dx / dist) * springForce;
            const fy = (dy / dist) * springForce;

            if (sourceNode.id !== draggedNodeId) {
              sourceNode.vx += fx;
              sourceNode.vy += fy;
            }
            if (targetNode.id !== draggedNodeId) {
              targetNode.vx -= fx;
              targetNode.vy -= fy;
            }
          }
        });

        // 3. Central Gravity Pull
        nextNodes.forEach((node) => {
          if (node.id === draggedNodeId) return;
          const dx = center.x - node.x;
          const dy = center.y - node.y;
          node.vx += dx * 0.005;
          node.vy += dy * 0.005;

          // Apply friction damping
          node.vx *= 0.82;
          node.vy *= 0.82;

          // Update position
          node.x += node.vx;
          node.y += node.vy;

          // Keep in bounding box
          node.x = Math.max(40, Math.min(dimensions.width - 40, node.x));
          node.y = Math.max(40, Math.min(dimensions.height - 40, node.y));
        });

        return nextNodes;
      });

      animId = requestAnimationFrame(stepSimulation);
    };

    animId = requestAnimationFrame(stepSimulation);
    return () => cancelAnimationFrame(animId);
  }, [isPhysicsRunning, repulsion, linkDistance, edges, dimensions, draggedNodeId]);

  // Handle Dragging
  const handleNodeMouseDown = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    setDraggedNodeId(nodeId);
    const node = nodes.find((n) => n.id === nodeId);
    if (node) {
      setSelectedNode(node);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (draggedNodeId && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const clientX = (e.clientX - rect.left - pan.x) / zoom;
      const clientY = (e.clientY - rect.top - pan.y) / zoom;

      setNodes((prev) =>
        prev.map((n) =>
          n.id === draggedNodeId
            ? { ...n, x: clientX, y: clientY, vx: 0, vy: 0 }
            : n
        )
      );
    } else if (isPanning) {
      setPan({
        x: e.clientX - startPan.x,
        y: e.clientY - startPan.y,
      });
    }
  };

  const handleMouseUp = () => {
    setDraggedNodeId(null);
    setIsPanning(false);
  };

  // Canvas Pan Handlers
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (e.target === containerRef.current || (e.target as HTMLElement).tagName === "svg") {
      setIsPanning(true);
      setStartPan({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  // Zoom controls
  const handleZoomIn = () => setZoom((z) => Math.min(2.5, z + 0.2));
  const handleZoomOut = () => setZoom((z) => Math.max(0.4, z - 0.2));
  const handleResetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setSelectedNode(null);
  };

  // Filtered nodes and edges based on View Mode and Drive filter
  const filteredNodes = useMemo(() => {
    return nodes.filter((node) => {
      // Search Query Filter
      if (searchQuery.trim().length > 0) {
        const matchesName = node.label.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesPath = node.path.toLowerCase().includes(searchQuery.toLowerCase());
        if (!matchesName && !matchesPath) return false;
      }

      // Drive Filter
      if (driveFilter !== "all" && node.drive !== driveFilter) {
        return false;
      }

      // View Mode Filter
      if (viewMode === "DUPLICATES_ONLY") {
        return node.type === "drive" || node.isDuplicate;
      }
      if (viewMode === "VECTOR_SEMANTIC") {
        return node.type === "drive" || Boolean(node.vectorCluster);
      }
      if (viewMode === "CROSS_CLOUD") {
        return node.type === "drive" || node.drive !== "local_vault";
      }

      return true;
    });
  }, [nodes, searchQuery, driveFilter, viewMode]);

  const visibleNodeIds = useMemo(() => new Set(filteredNodes.map((n) => n.id)), [filteredNodes]);

  const filteredEdges = useMemo(() => {
    return edges.filter((edge) => {
      const sourceVisible = visibleNodeIds.has(edge.source);
      const targetVisible = visibleNodeIds.has(edge.target);
      if (!sourceVisible || !targetVisible) return false;

      if (viewMode === "DUPLICATES_ONLY") {
        return edge.relationType === "duplicate_hash" || edge.relationType === "duplicate_phash" || edge.relationType === "parent_child";
      }
      if (viewMode === "VECTOR_SEMANTIC") {
        return edge.relationType === "vector_similarity" || edge.relationType === "parent_child";
      }

      return true;
    });
  }, [edges, visibleNodeIds, viewMode]);

  // Compute metrics
  const totalNodesCount = nodes.length;
  const duplicateEdgesCount = edges.filter((e) => e.relationType === "duplicate_hash" || e.relationType === "duplicate_phash").length;
  const vectorEdgesCount = edges.filter((e) => e.relationType === "vector_similarity").length;
  const totalVolumeBytes = nodes.reduce((acc, curr) => acc + (curr.sizeBytes || 0), 0);

  const formatSize = (bytes: number) => {
    if (!bytes) return "0 B";
    if (bytes >= 1e9) return (bytes / 1e9).toFixed(1) + " GB";
    if (bytes >= 1e6) return (bytes / 1e6).toFixed(1) + " MB";
    return (bytes / 1e3).toFixed(1) + " KB";
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#FFE66D] rounded-3xl p-6 border-4 border-black shadow-[6px_6px_0px_0px_#000] relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="px-3 py-1 rounded-full text-xs font-black bg-black text-white uppercase tracking-wider flex items-center gap-1.5 shadow-[2px_2px_0px_0px_#000]">
                <Network className="w-3.5 h-3.5 text-[#4ECDC4]" />
                Interactive Storage Web
              </span>
              <span className="px-2.5 py-1 rounded-full text-xs font-black bg-white text-black border border-black shadow-[2px_2px_0px_0px_#000]">
                Force-Directed Graph
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-black italic">
              MULTI-CLOUD KNOWLEDGE GRAPH & WEB VISUALIZER
            </h2>
            <p className="text-sm font-bold text-gray-800 mt-1 max-w-2xl">
              Explore structural hierarchy, exact SHA-256 duplicate linkages, pHash visual matches, and Gemini AI vector clusters across all connected drives in an interactive 2D physics graph.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setIsPhysicsRunning(!isPhysicsRunning)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-black border-2 border-black transition-all flex items-center gap-2 cursor-pointer shadow-[3px_3px_0px_0px_#000] ${
                isPhysicsRunning ? "bg-[#FF6B6B] text-white" : "bg-white text-black hover:bg-slate-100"
              }`}
            >
              <Cpu className="w-4 h-4" />
              <span>{isPhysicsRunning ? "Pause Physics" : "Resume Physics"}</span>
            </button>
            <button
              onClick={handleResetView}
              className="px-4 py-2.5 bg-white text-black hover:bg-slate-100 rounded-2xl text-xs font-black border-2 border-black shadow-[3px_3px_0px_0px_#000] flex items-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset View</span>
            </button>
          </div>
        </div>
      </div>

      {/* Graph Metrics & Mode Selector Ribbon */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border-3 border-black shadow-[4px_4px_0px_0px_#000] flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#FFE66D] border-2 border-black flex items-center justify-center font-black">
            <Network className="w-5 h-5 text-black" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Total Graph Nodes</div>
            <div className="text-lg font-black text-black">{totalNodesCount} Entities</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border-3 border-black shadow-[4px_4px_0px_0px_#000] flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#FF6B6B] border-2 border-black flex items-center justify-center font-black text-white">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Duplicate Edges</div>
            <div className="text-lg font-black text-black">{duplicateEdgesCount} Cross-Links</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border-3 border-black shadow-[4px_4px_0px_0px_#000] flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#4ECDC4] border-2 border-black flex items-center justify-center font-black text-black">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Vector Semantic Links</div>
            <div className="text-lg font-black text-black">{vectorEdgesCount} AI Relationships</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border-3 border-black shadow-[4px_4px_0px_0px_#000] flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#A29BFE] border-2 border-black flex items-center justify-center font-black text-black">
            <HardDrive className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Indexed Volume</div>
            <div className="text-lg font-black text-black">{formatSize(totalVolumeBytes)}</div>
          </div>
        </div>
      </div>

      {/* Control Bar: View Modes, Search, and Physics Sliders */}
      <div className="bg-white p-4 rounded-2xl border-3 border-black shadow-[4px_4px_0px_0px_#000] space-y-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Mode Selector Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setViewMode("ALL_NODES")}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all border-2 border-black shrink-0 cursor-pointer ${
                viewMode === "ALL_NODES" ? "bg-[#FFE66D] text-black shadow-[2px_2px_0px_0px_#000]" : "bg-slate-50 text-gray-700 hover:bg-slate-100"
              }`}
            >
              Full Storage Web
            </button>

            <button
              onClick={() => setViewMode("DUPLICATES_ONLY")}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all border-2 border-black shrink-0 cursor-pointer ${
                viewMode === "DUPLICATES_ONLY" ? "bg-[#FF6B6B] text-white shadow-[2px_2px_0px_0px_#000]" : "bg-slate-50 text-gray-700 hover:bg-slate-100"
              }`}
            >
              Duplicate Links Web
            </button>

            <button
              onClick={() => setViewMode("VECTOR_SEMANTIC")}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all border-2 border-black shrink-0 cursor-pointer ${
                viewMode === "VECTOR_SEMANTIC" ? "bg-[#4ECDC4] text-black shadow-[2px_2px_0px_0px_#000]" : "bg-slate-50 text-gray-700 hover:bg-slate-100"
              }`}
            >
              Gemini AI Vector Clusters
            </button>

            <button
              onClick={() => setViewMode("CROSS_CLOUD")}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all border-2 border-black shrink-0 cursor-pointer ${
                viewMode === "CROSS_CLOUD" ? "bg-[#A29BFE] text-black shadow-[2px_2px_0px_0px_#000]" : "bg-slate-50 text-gray-700 hover:bg-slate-100"
              }`}
            >
              Cross-Cloud Sync Web
            </button>
          </div>

          {/* Drive Filter & Search */}
          <div className="flex items-center gap-2">
            <select
              value={driveFilter}
              onChange={(e) => setDriveFilter(e.target.value)}
              className="bg-white border-2 border-black rounded-xl px-3 py-1.5 text-xs font-black text-black shadow-[2px_2px_0px_0px_#000]"
            >
              <option value="all">All Drives</option>
              <option value="google_drive">Google Drive</option>
              <option value="onedrive">OneDrive</option>
              <option value="local_vault">Local Vault</option>
            </select>

            <div className="relative flex-1 sm:w-60">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Highlight node..."
                className="w-full bg-slate-50 border-2 border-black rounded-xl pl-8 pr-3 py-1.5 text-xs font-bold text-black focus:outline-none focus:bg-white"
              />
            </div>
          </div>
        </div>

        {/* Physics Controls Expandable Bar */}
        <div className="pt-2 border-t-2 border-slate-100 flex flex-wrap items-center gap-6 text-xs font-bold text-gray-700">
          <div className="flex items-center gap-2">
            <Sliders className="w-3.5 h-3.5 text-black" />
            <span>Repulsion Force:</span>
            <input
              type="range"
              min="100"
              max="800"
              value={repulsion}
              onChange={(e) => setRepulsion(Number(e.target.value))}
              className="accent-black w-24 cursor-pointer"
            />
            <span className="font-mono text-[11px] text-black">{repulsion}</span>
          </div>

          <div className="flex items-center gap-2">
            <span>Link Distance:</span>
            <input
              type="range"
              min="40"
              max="200"
              value={linkDistance}
              onChange={(e) => setLinkDistance(Number(e.target.value))}
              className="accent-black w-24 cursor-pointer"
            />
            <span className="font-mono text-[11px] text-black">{linkDistance}px</span>
          </div>

          <div className="ml-auto flex items-center gap-3">
            <span className="flex items-center gap-1 text-[11px] text-black font-black">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FF6B6B] inline-block border border-black"></span> Hash Match
            </span>
            <span className="flex items-center gap-1 text-[11px] text-black font-black">
              <span className="w-2.5 h-2.5 rounded-full bg-[#8B5CF6] inline-block border border-black"></span> pHash Match
            </span>
            <span className="flex items-center gap-1 text-[11px] text-black font-black">
              <span className="w-2.5 h-2.5 rounded-full bg-[#4ECDC4] inline-block border border-black"></span> Vector Cluster
            </span>
          </div>
        </div>
      </div>

      {/* Main Interactive Physics Canvas & Inspection Drawer Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Canvas Area (Spans 3 Columns) */}
        <div className="lg:col-span-3 bg-slate-900 rounded-3xl border-4 border-black shadow-[6px_6px_0px_0px_#000] relative overflow-hidden h-[600px]">
          {/* Zoom & Pan Overlay Toolbar */}
          <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
            <button
              onClick={handleZoomIn}
              title="Zoom In"
              className="w-9 h-9 bg-white text-black rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_#000] flex items-center justify-center font-black hover:bg-slate-100 cursor-pointer"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={handleZoomOut}
              title="Zoom Out"
              className="w-9 h-9 bg-white text-black rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_#000] flex items-center justify-center font-black hover:bg-slate-100 cursor-pointer"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={handleResetView}
              title="Recenter"
              className="w-9 h-9 bg-[#FFE66D] text-black rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_#000] flex items-center justify-center font-black hover:bg-[#ffd835] cursor-pointer"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>

          {/* Canvas Background Grid */}
          <div
            ref={containerRef}
            onMouseDown={handleCanvasMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            className="w-full h-full cursor-grab active:cursor-grabbing relative overflow-hidden bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:20px_20px]"
          >
            <svg className="w-full h-full">
              <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
                {/* Render Edges */}
                {filteredEdges.map((edge) => {
                  const source = nodes.find((n) => n.id === edge.source);
                  const target = nodes.find((n) => n.id === edge.target);
                  if (!source || !target) return null;

                  let strokeColor = "#475569";
                  let strokeDash = "none";
                  let strokeWidth = 1.5;

                  if (edge.relationType === "duplicate_hash") {
                    strokeColor = "#FF6B6B";
                    strokeDash = "4 4";
                    strokeWidth = 2.5;
                  } else if (edge.relationType === "duplicate_phash") {
                    strokeColor = "#8B5CF6";
                    strokeDash = "3 3";
                    strokeWidth = 2;
                  } else if (edge.relationType === "vector_similarity") {
                    strokeColor = "#4ECDC4";
                    strokeDash = "2 2";
                    strokeWidth = 2;
                  }

                  return (
                    <g key={edge.id}>
                      <line
                        x1={source.x}
                        y1={source.y}
                        x2={target.x}
                        y2={target.y}
                        stroke={strokeColor}
                        strokeWidth={strokeWidth}
                        strokeDasharray={strokeDash}
                        opacity={0.8}
                      />
                      {edge.label && (
                        <text
                          x={(source.x + target.x) / 2}
                          y={(source.y + target.y) / 2 - 4}
                          fill="#94a3b8"
                          fontSize="9"
                          fontWeight="bold"
                          textAnchor="middle"
                          className="select-none pointer-events-none"
                        >
                          {edge.label}
                        </text>
                      )}
                    </g>
                  );
                })}

                {/* Render Nodes */}
                {filteredNodes.map((node) => {
                  const isSelected = selectedNode?.id === node.id;
                  const isHovered = hoveredNode?.id === node.id;

                  return (
                    <g
                      key={node.id}
                      transform={`translate(${node.x}, ${node.y})`}
                      onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
                      onMouseEnter={(e) => {
                        setHoveredNode(node);
                        setTooltipPos({ x: e.clientX, y: e.clientY });
                      }}
                      onMouseLeave={() => setHoveredNode(null)}
                      className="cursor-pointer group"
                    >
                      {/* Outer Pulse/Halo for selected or duplicate nodes */}
                      {(isSelected || node.isDuplicate) && (
                        <circle
                          r={node.radius + 6}
                          fill="none"
                          stroke={node.isDuplicate ? "#FF6B6B" : "#FFE66D"}
                          strokeWidth="2.5"
                          className="animate-pulse"
                        />
                      )}

                      {/* Main Node Circle */}
                      <circle
                        r={node.radius}
                        fill={node.color}
                        stroke="#000"
                        strokeWidth="2.5"
                        className="transition-transform group-hover:scale-110"
                      />

                      {/* Node Center Badge/Icon Indicator */}
                      <text
                        x="0"
                        y="4"
                        fill="#000"
                        fontSize={node.type === "drive" ? "12" : "10"}
                        fontWeight="900"
                        textAnchor="middle"
                        className="select-none pointer-events-none font-black"
                      >
                        {node.type === "drive" ? "☁️" : node.type === "folder" ? "📁" : "📄"}
                      </text>

                      {/* Label under Node */}
                      <text
                        x="0"
                        y={node.radius + 14}
                        fill="#fff"
                        fontSize="10"
                        fontWeight="800"
                        textAnchor="middle"
                        className="select-none pointer-events-none drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]"
                      >
                        {node.label.length > 22 ? node.label.slice(0, 20) + "..." : node.label}
                      </text>
                    </g>
                  );
                })}
              </g>
            </svg>
          </div>
        </div>

        {/* Selected Node Details Drawer & Actions (Right Column) */}
        <div className="bg-white p-6 rounded-3xl border-4 border-black shadow-[6px_6px_0px_0px_#000] flex flex-col justify-between">
          {selectedNode ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b-2 border-black pb-3">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#FFE66D] text-black border border-black shadow-[2px_2px_0px_0px_#000]">
                  {selectedNode.type} Details
                </span>
                <span className="text-[10px] font-mono font-bold text-gray-500">ID: {selectedNode.id}</span>
              </div>

              <div>
                <h3 className="text-base font-black text-black leading-tight break-all">{selectedNode.label}</h3>
                <p className="text-xs font-bold text-gray-600 mt-1 font-mono break-all">{selectedNode.path}</p>
              </div>

              <div className="space-y-2 bg-slate-50 p-3 rounded-2xl border-2 border-black">
                <div className="flex justify-between text-xs">
                  <span className="font-bold text-gray-600">Drive Location:</span>
                  <span className="font-black text-black uppercase">{selectedNode.drive.replace("_", " ")}</span>
                </div>
                {selectedNode.sizeBytes && (
                  <div className="flex justify-between text-xs">
                    <span className="font-bold text-gray-600">File Size:</span>
                    <span className="font-black text-black">{formatSize(selectedNode.sizeBytes)}</span>
                  </div>
                )}
                {selectedNode.vectorCluster && (
                  <div className="flex justify-between text-xs">
                    <span className="font-bold text-gray-600">Gemini Cluster:</span>
                    <span className="font-black text-[#8B5CF6]">{selectedNode.vectorCluster}</span>
                  </div>
                )}
                {selectedNode.isDuplicate && (
                  <div className="mt-2 p-2 rounded-xl bg-[#FF6B6B]/10 border border-[#FF6B6B] text-[11px] font-black text-[#FF6B6B] flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                    <span>Cross-Drive Duplicate Detected</span>
                  </div>
                )}
              </div>

              {/* Node Actions */}
              <div className="space-y-2 pt-2">
                <button
                  onClick={() => {
                    if (onSelectForTransfer) {
                      onSelectForTransfer({
                        id: selectedNode.id,
                        name: selectedNode.label,
                        path: selectedNode.path,
                        itemCount: 1,
                        sizeBytes: selectedNode.sizeBytes || 0,
                        driveType: selectedNode.drive,
                      });
                    }
                    if (onSwitchToExplorer) onSwitchToExplorer();
                  }}
                  className="w-full bg-[#4ECDC4] text-black hover:bg-[#3dbbb3] py-2.5 px-3 rounded-2xl text-xs font-black border-2 border-black shadow-[3px_3px_0px_0px_#000] flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <ArrowRight className="w-4 h-4" />
                  <span>Transfer Node in Dual Pane</span>
                </button>

                <button
                  onClick={() => alert(`Quarantine move initiated for: ${selectedNode.label}`)}
                  className="w-full bg-white text-black hover:bg-slate-100 py-2.5 px-3 rounded-2xl text-xs font-black border-2 border-black shadow-[3px_3px_0px_0px_#000] flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <Trash2 className="w-4 h-4 text-[#FF6B6B]" />
                  <span>Move to 30-Day Quarantine</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-gray-500 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 border-2 border-black flex items-center justify-center text-black shadow-[2px_2px_0px_0px_#000]">
                <Info className="w-6 h-6 text-gray-600" />
              </div>
              <h4 className="text-sm font-black text-black">No Node Selected</h4>
              <p className="text-xs font-bold text-gray-600">
                Click or drag any cloud, folder, or file node inside the graph canvas to inspect metadata and execute actions.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
