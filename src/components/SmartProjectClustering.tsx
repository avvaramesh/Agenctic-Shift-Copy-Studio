import React, { useState } from "react";
import {
  Brain,
  Network,
  FolderSync,
  Sparkles,
  ArrowRight,
  Folder,
  FileText,
  Video,
  Image as ImageIcon,
  FileArchive,
  CheckCircle2,
  RefreshCw,
  Info,
  Layers,
  ChevronRight,
  HardDrive,
  Check,
  Zap,
  Globe,
  Share2,
  ExternalLink,
  SlidersHorizontal,
  Eye,
  Trash2,
} from "lucide-react";

export interface VirtualProjectItem {
  id: string;
  fileName: string;
  driveSource: "Google Drive" | "OneDrive";
  sizeBytes: number;
  path: string;
  mimeType: string;
  category: "Video" | "Document" | "Photo" | "Archive" | "Code";
  affinityScore: number; // e.g. 0.98
}

export interface VirtualProject {
  id: string;
  title: string; // Gemini generated
  aiSummary: string;
  confidenceScore: number; // e.g. 96.4
  totalSizeBytes: number;
  itemCount: number;
  gdriveCount: number;
  oneDriveCount: number;
  keywords: string[];
  items: VirtualProjectItem[];
}

interface SmartProjectClusteringProps {
  onConsolidateProject?: (project: VirtualProject) => void;
}

const INITIAL_VIRTUAL_PROJECTS: VirtualProject[] = [
  {
    id: "vp1",
    title: "CS401 Distributed Systems Final Project & Lab Datasets (2024)",
    aiSummary:
      "Gemini text-embedding-004 grouped 18 files across Google Drive & OneDrive based on path ancestry (/CS_Projects/), code dependencies, and thesis PDF citations.",
    confidenceScore: 98.2,
    totalSizeBytes: 4_850_000_000, // 4.85 GB
    itemCount: 18,
    gdriveCount: 12,
    oneDriveCount: 6,
    keywords: ["Distributed Systems", "Lab Datasets", "Golang", "Thesis Draft", "Benchmarking"],
    items: [
      {
        id: "vpi_1",
        fileName: "CS_Final_Project_Dataset_Backup.zip",
        driveSource: "Google Drive",
        sizeBytes: 2_800_000_000,
        path: "/GoogleDrive/CS_Projects/Archives/CS_Final_Project_Dataset_Backup.zip",
        mimeType: "application/zip",
        category: "Archive",
        affinityScore: 0.99,
      },
      {
        id: "vpi_2",
        fileName: "Distributed_Systems_Thesis_Draft_v4.pdf",
        driveSource: "Google Drive",
        sizeBytes: 850_000_000,
        path: "/GoogleDrive/Research/Papers/Distributed_Systems_Thesis_Draft_v4.pdf",
        mimeType: "application/pdf",
        category: "Document",
        affinityScore: 0.97,
      },
      {
        id: "vpi_3",
        fileName: "Lab1_Benchmark_Data_Recordings.xlsx",
        driveSource: "OneDrive",
        sizeBytes: 650_000_000,
        path: "/OneDrive/University/Lab1_Benchmark_Data_Recordings.xlsx",
        mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        category: "Document",
        affinityScore: 0.95,
      },
      {
        id: "vpi_4",
        fileName: "Cluster_Nodes_Deployment_Log.txt",
        driveSource: "OneDrive",
        sizeBytes: 550_000_000,
        path: "/OneDrive/Logs/2024/Cluster_Nodes_Deployment_Log.txt",
        mimeType: "text/plain",
        category: "Code",
        affinityScore: 0.92,
      },
    ],
  },
  {
    id: "vp2",
    title: "Graduation Ceremony 4K Video Production & Media Vault",
    aiSummary:
      "Cross-drive media correlation linked 4K stage recordings in Google Drive with audio multi-tracks and camera roll B-Roll dumps in OneDrive.",
    confidenceScore: 95.8,
    totalSizeBytes: 6_200_000_000, // 6.2 GB
    itemCount: 35,
    gdriveCount: 20,
    oneDriveCount: 15,
    keywords: ["Graduation 2024", "4K Video", "Multitrack Audio", "B-Roll", "RAW Photos"],
    items: [
      {
        id: "vpi_5",
        fileName: "Ceremony_Stage_4K_Raw.mp4",
        driveSource: "Google Drive",
        sizeBytes: 2_800_000_000,
        path: "/GoogleDrive/School/Graduation2024/Videos/Ceremony_Stage_4K_Raw.mp4",
        mimeType: "video/mp4",
        category: "Video",
        affinityScore: 0.99,
      },
      {
        id: "vpi_6",
        fileName: "Raw_Audio_Multitrack_Stage.wav",
        driveSource: "OneDrive",
        sizeBytes: 1_400_000_000,
        path: "/OneDrive/Media_Archive/Graduation/Raw_Audio_Multitrack_Stage.wav",
        mimeType: "audio/wav",
        category: "Video",
        affinityScore: 0.96,
      },
      {
        id: "vpi_7",
        fileName: "Campus_Walk_B-Roll_Footage.mov",
        driveSource: "Google Drive",
        sizeBytes: 1_400_000_000,
        path: "/GoogleDrive/School/Graduation2024/Videos/Campus_Walk_B-Roll_Footage.mov",
        mimeType: "video/quicktime",
        category: "Video",
        affinityScore: 0.94,
      },
      {
        id: "vpi_8",
        fileName: "Graduation_Program_Booklet.pdf",
        driveSource: "OneDrive",
        sizeBytes: 600_000_000,
        path: "/OneDrive/Documents/Graduation_Program_Booklet.pdf",
        mimeType: "application/pdf",
        category: "Document",
        affinityScore: 0.89,
      },
    ],
  },
  {
    id: "vp3",
    title: "UI/UX Figma Design Exports & Frontend Components",
    aiSummary:
      "Semantic similarity linked Figma export archives in OneDrive with React component repositories in Google Drive.",
    confidenceScore: 91.4,
    totalSizeBytes: 2_200_000_000, // 2.2 GB
    itemCount: 22,
    gdriveCount: 14,
    oneDriveCount: 8,
    keywords: ["Figma", "UI Design", "Tailwind CSS", "React Components", "Assets"],
    items: [
      {
        id: "vpi_9",
        fileName: "Figma_Design_Exports_Archive.tar.gz",
        driveSource: "OneDrive",
        sizeBytes: 1_100_000_000,
        path: "/OneDrive/Design/Figma_Design_Exports_Archive.tar.gz",
        mimeType: "application/gzip",
        category: "Archive",
        affinityScore: 0.98,
      },
      {
        id: "vpi_10",
        fileName: "Design_Tokens_And_Icons.zip",
        driveSource: "Google Drive",
        sizeBytes: 700_000_000,
        path: "/GoogleDrive/Design/Assets/Design_Tokens_And_Icons.zip",
        mimeType: "application/zip",
        category: "Archive",
        affinityScore: 0.93,
      },
      {
        id: "vpi_11",
        fileName: "Component_Library_Specs.pdf",
        driveSource: "Google Drive",
        sizeBytes: 400_000_000,
        path: "/GoogleDrive/Design/Docs/Component_Library_Specs.pdf",
        mimeType: "application/pdf",
        category: "Document",
        affinityScore: 0.88,
      },
    ],
  },
];

export const SmartProjectClustering: React.FC<SmartProjectClusteringProps> = ({
  onConsolidateProject,
}) => {
  const [viewMode, setViewMode] = useState<"virtual_folder" | "knowledge_graph">(
    "virtual_folder"
  );
  const [selectedProject, setSelectedProject] = useState<VirtualProject>(
    INITIAL_VIRTUAL_PROJECTS[0]
  );
  const [isAiClustering, setIsAiClustering] = useState(false);
  const [hasConsolidated, setHasConsolidated] = useState<string | null>(null);
  const [selectedGraphNode, setSelectedGraphNode] = useState<string | null>(null);

  const formatSize = (bytes: number) => {
    if (bytes >= 1_000_000_000) {
      return (bytes / 1_000_000_000).toFixed(1) + " GB";
    }
    return (bytes / 1_000_000).toFixed(0) + " MB";
  };

  const handleRunGeminiClustering = () => {
    setIsAiClustering(true);
    setTimeout(() => {
      setIsAiClustering(false);
    }, 1500);
  };

  const handleConsolidate = (proj: VirtualProject) => {
    setHasConsolidated(proj.id);
    if (onConsolidateProject) {
      onConsolidateProject(proj);
    }
  };

  return (
    <div className="bg-white border-4 border-black rounded-[36px] p-6 shadow-[8px_8px_0px_0px_#000] space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b-2 border-black pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 bg-[#A29BFE] text-black px-3 py-1 rounded-full text-xs font-black border-2 border-black shadow-[2px_2px_0px_0px_#000] mb-2">
            <Brain className="w-3.5 h-3.5 stroke-[3]" /> GEMINI VECTOR EMBEDDING CLUSTERING (TEXT-EMBEDDING-004)
          </div>
          <h3 className="text-xl font-black text-black italic">
            Smart Cross-Drive Project Clustering & Knowledge Graph
          </h3>
          <p className="text-xs font-bold text-gray-600 max-w-xl">
            Automatically groups related files and datasets scattered across Google Drive and OneDrive into unified Virtual Project Workspaces using Gemini AI vector embeddings.
          </p>
        </div>

        {/* View Switcher & AI Trigger */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-100 p-1.5 rounded-2xl border-2 border-black shadow-[2px_2px_0px_0px_#000]">
            <button
              onClick={() => setViewMode("virtual_folder")}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === "virtual_folder"
                  ? "bg-[#FFE66D] text-black shadow-[1px_1px_0px_0px_#000]"
                  : "text-gray-600 hover:text-black"
              }`}
            >
              <FolderSync className="w-3.5 h-3.5" />
              <span>Virtual Folder Workspace</span>
            </button>

            <button
              onClick={() => setViewMode("knowledge_graph")}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === "knowledge_graph"
                  ? "bg-[#4ECDC4] text-black shadow-[1px_1px_0px_0px_#000]"
                  : "text-gray-600 hover:text-black"
              }`}
            >
              <Network className="w-3.5 h-3.5" />
              <span>Interactive Knowledge Graph</span>
            </button>
          </div>

          <button
            onClick={handleRunGeminiClustering}
            disabled={isAiClustering}
            className="px-4 py-2 bg-[#FF6B6B] hover:bg-[#e05555] text-white text-xs font-black rounded-2xl border-2 border-black shadow-[3px_3px_0px_0px_#000] transition-all cursor-pointer flex items-center gap-2 active:translate-y-0.5"
          >
            <Sparkles className={`w-4 h-4 ${isAiClustering ? "animate-spin" : ""}`} />
            <span>{isAiClustering ? "Generating Embeddings..." : "Re-Cluster with Gemini"}</span>
          </button>
        </div>
      </div>

      {/* Main Content Area depending on View Mode */}
      {viewMode === "virtual_folder" ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Virtual Project Cards Selector */}
          <div className="lg:col-span-5 space-y-4">
            <span className="text-xs font-black text-gray-500 uppercase tracking-wider block">
              Gemini Virtual Projects ({INITIAL_VIRTUAL_PROJECTS.length})
            </span>

            {INITIAL_VIRTUAL_PROJECTS.map((proj) => {
              const isSelected = selectedProject.id === proj.id;
              return (
                <div
                  key={proj.id}
                  onClick={() => setSelectedProject(proj)}
                  className={`p-4 rounded-3xl border-3 border-black transition-all cursor-pointer space-y-3 relative overflow-hidden ${
                    isSelected
                      ? "bg-[#FFF9F5] shadow-[6px_6px_0px_0px_#000] ring-2 ring-black"
                      : "bg-white hover:bg-slate-50 shadow-[3px_3px_0px_0px_#000]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <FolderSync className="w-5 h-5 text-[#FF6B6B] shrink-0" />
                      <h4 className="text-sm font-black text-black leading-snug">{proj.title}</h4>
                    </div>
                    <span className="bg-[#4ECDC4] text-black font-black text-[10px] px-2 py-0.5 rounded-full border border-black shrink-0">
                      {proj.confidenceScore}% Match
                    </span>
                  </div>

                  <p className="text-[11px] font-bold text-gray-600 line-clamp-2">{proj.aiSummary}</p>

                  {/* Keywords Tag Cloud */}
                  <div className="flex flex-wrap gap-1">
                    {proj.keywords.map((kw, i) => (
                      <span
                        key={i}
                        className="bg-slate-100 text-black text-[9px] font-bold px-2 py-0.5 rounded-md border border-black/30"
                      >
                        #{kw}
                      </span>
                    ))}
                  </div>

                  {/* Stats Row */}
                  <div className="flex items-center justify-between text-xs font-black pt-2 border-t border-black/10">
                    <span className="text-[#FF6B6B]">{formatSize(proj.totalSizeBytes)}</span>
                    <div className="flex items-center gap-2 text-[10px]">
                      <span className="text-blue-600 font-bold">GDrive: {proj.gdriveCount}</span>
                      <span className="text-emerald-600 font-bold">OneDrive: {proj.oneDriveCount}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Virtual Folder Workspace File List */}
          <div className="lg:col-span-7 bg-[#FFF9F5] p-5 rounded-3xl border-3 border-black shadow-[4px_4px_0px_0px_#000] space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b-2 border-black pb-3">
              <div>
                <span className="text-[10px] font-black text-gray-500 uppercase">Synthesized Virtual Workspace</span>
                <h4 className="text-base font-black text-black">{selectedProject.title}</h4>
              </div>

              <button
                onClick={() => handleConsolidate(selectedProject)}
                className="px-4 py-2 bg-[#FFE66D] hover:bg-[#ffd633] text-black font-black text-xs rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_#000] transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
              >
                <FolderSync className="w-4 h-4" />
                <span>Consolidate Physical Folders</span>
              </button>
            </div>

            {hasConsolidated === selectedProject.id && (
              <div className="bg-emerald-100 p-3 rounded-2xl border-2 border-black text-xs font-black text-black flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Scattered files queued for consolidation into Google Drive master directory!</span>
              </div>
            )}

            <div className="space-y-2">
              <span className="text-xs font-black text-black uppercase">
                Connected Workspace Files ({selectedProject.items.length})
              </span>

              <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                {selectedProject.items.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 bg-white rounded-2xl border-2 border-black shadow-[2px_2px_0px_0px_#000] flex items-center justify-between gap-3 hover:bg-slate-50 transition-all"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {item.category === "Video" ? (
                        <Video className="w-5 h-5 text-[#FF6B6B] shrink-0" />
                      ) : item.category === "Archive" ? (
                        <FileArchive className="w-5 h-5 text-[#FFE66D] shrink-0" />
                      ) : (
                        <FileText className="w-5 h-5 text-blue-600 shrink-0" />
                      )}
                      <div className="min-w-0">
                        <div className="font-black text-xs text-black truncate">{item.fileName}</div>
                        <div className="text-[10px] font-mono text-gray-500 truncate">{item.path}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span
                        className={`text-[10px] font-black px-2 py-0.5 rounded-full border border-black ${
                          item.driveSource === "Google Drive"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-emerald-100 text-emerald-800"
                        }`}
                      >
                        {item.driveSource}
                      </span>
                      <span className="font-black text-xs text-[#FF6B6B]">
                        {formatSize(item.sizeBytes)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* INTERACTIVE KNOWLEDGE GRAPH NETWORK (VISUAL SVG NODE MAP) */
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs font-black text-gray-600 bg-slate-100 p-3 rounded-2xl border-2 border-black">
            <span className="flex items-center gap-1.5">
              <Network className="w-4 h-4 text-[#FF6B6B]" />
              Showing Cosine Affinity Clusters (Google Drive 🔵 vs OneDrive 🟢)
            </span>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-blue-500 border border-black" /> Google Drive Node</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-emerald-500 border border-black" /> OneDrive Node</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-amber-400 border border-black" /> Gemini Project Hub</span>
            </div>
          </div>

          <div className="relative w-full h-[420px] bg-slate-900 rounded-[32px] border-4 border-black p-4 overflow-hidden shadow-[6px_6px_0px_0px_#000] flex items-center justify-center">
            <svg className="w-full h-full">
              {/* Connecting Edges */}
              {/* Hub 1 (CS Project) connections */}
              <line x1="250" y1="200" x2="120" y2="100" stroke="#FFE66D" strokeWidth="3" strokeDasharray="4" />
              <line x1="250" y1="200" x2="140" y2="280" stroke="#FFE66D" strokeWidth="2" />
              <line x1="250" y1="200" x2="350" y2="100" stroke="#4ECDC4" strokeWidth="3" />
              <line x1="250" y1="200" x2="380" y2="280" stroke="#4ECDC4" strokeWidth="2" />

              {/* Hub 2 (Graduation) connections */}
              <line x1="650" y1="200" x2="520" y2="100" stroke="#FFE66D" strokeWidth="3" />
              <line x1="650" y1="200" x2="550" y2="300" stroke="#FFE66D" strokeWidth="2.5" />
              <line x1="650" y1="200" x2="780" y2="120" stroke="#4ECDC4" strokeWidth="3" strokeDasharray="4" />
              <line x1="650" y1="200" x2="760" y2="300" stroke="#4ECDC4" strokeWidth="2" />

              {/* PROJECT HUB NODES */}
              {/* Hub 1 */}
              <g
                onClick={() => setSelectedGraphNode("CS401 Distributed Systems")}
                className="cursor-pointer hover:scale-105 transition-transform"
              >
                <circle cx="250" cy="200" r="42" fill="#FFE66D" stroke="#000" strokeWidth="4" />
                <text x="250" y="196" textAnchor="middle" fill="#000" fontSize="11" fontWeight="900">
                  CS401 Thesis
                </text>
                <text x="250" y="212" textAnchor="middle" fill="#000" fontSize="9" fontWeight="700">
                  (4.8 GB • 98.2%)
                </text>
              </g>

              {/* Hub 2 */}
              <g
                onClick={() => setSelectedGraphNode("Graduation Media Production")}
                className="cursor-pointer hover:scale-105 transition-transform"
              >
                <circle cx="650" cy="200" r="42" fill="#FF6B6B" stroke="#000" strokeWidth="4" />
                <text x="650" y="196" textAnchor="middle" fill="#FFF" fontSize="11" fontWeight="900">
                  Graduation 2024
                </text>
                <text x="650" y="212" textAnchor="middle" fill="#FFF" fontSize="9" fontWeight="700">
                  (6.2 GB • 95.8%)
                </text>
              </g>

              {/* FILE LEAF NODES (GDrive = Blue, OneDrive = Emerald) */}
              {/* Leaf 1 (GDrive) */}
              <g onClick={() => setSelectedGraphNode("CS_Dataset_Backup.zip")} className="cursor-pointer">
                <circle cx="120" cy="100" r="22" fill="#3B82F6" stroke="#000" strokeWidth="3" />
                <text x="120" y="104" textAnchor="middle" fill="#FFF" fontSize="8" fontWeight="800">
                  GDrive
                </text>
              </g>

              {/* Leaf 2 (GDrive) */}
              <g onClick={() => setSelectedGraphNode("Thesis_Draft_v4.pdf")} className="cursor-pointer">
                <circle cx="140" cy="280" r="22" fill="#3B82F6" stroke="#000" strokeWidth="3" />
                <text x="140" y="284" textAnchor="middle" fill="#FFF" fontSize="8" fontWeight="800">
                  GDrive
                </text>
              </g>

              {/* Leaf 3 (OneDrive) */}
              <g onClick={() => setSelectedGraphNode("Benchmark_Data.xlsx")} className="cursor-pointer">
                <circle cx="350" cy="100" r="22" fill="#10B981" stroke="#000" strokeWidth="3" />
                <text x="350" y="104" textAnchor="middle" fill="#FFF" fontSize="8" fontWeight="800">
                  OneDrive
                </text>
              </g>

              {/* Leaf 4 (OneDrive) */}
              <g onClick={() => setSelectedGraphNode("Ceremony_Stage_4K.mp4")} className="cursor-pointer">
                <circle cx="520" cy="100" r="22" fill="#10B981" stroke="#000" strokeWidth="3" />
                <text x="520" y="104" textAnchor="middle" fill="#FFF" fontSize="8" fontWeight="800">
                  OneDrive
                </text>
              </g>
            </svg>

            {selectedGraphNode && (
              <div className="absolute bottom-4 right-4 bg-white p-4 rounded-2xl border-3 border-black shadow-[4px_4px_0px_0px_#000] text-xs font-black space-y-1 z-20">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-[#FF6B6B]">{selectedGraphNode}</span>
                  <button onClick={() => setSelectedGraphNode(null)} className="text-gray-400 hover:text-black">
                    ✕
                  </button>
                </div>
                <p className="text-[10px] font-bold text-gray-600">
                  Connected via Gemini text-embedding-004 cosine similarity score (0.978 affinity).
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
