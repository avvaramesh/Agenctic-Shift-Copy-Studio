import React, { useState } from "react";
import {
  BookOpen,
  Binary,
  Brain,
  Bot,
  PieChart,
  HardDrive,
  FolderSync,
  Search,
  CheckCircle2,
  Copy,
  Layers,
  Sparkles,
  ShieldCheck,
  Zap,
  Code2,
  FileCode,
  FileText,
  ExternalLink,
} from "lucide-react";

export const DocumentationViewer: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [copied, setCopied] = useState(false);

  const features = [
    {
      id: "dual_pane",
      title: "1. Dual-Pane Side-by-Side Folder Explorer",
      icon: HardDrive,
      badge: "CORE EXPLORER",
      badgeColor: "bg-[#FFE66D]",
      description:
        "Displays Source and Target cloud directories side-by-side with multi-account Google Drive, OneDrive, and Local Storage support.",
      details: [
        "Dual-Pane Architecture with responsive side-by-side layout (md:grid-cols-2).",
        "Multi-Selection & Batch Migration for individual files or entire directory trees.",
        "Drive Mode Toggle: Switch between Google Drive, OneDrive, Local Vault, and direct Shared Links.",
        "Real-time Search & Filter Bar: Client-side instant filtering by filename and file extension.",
        "Deep Breadcrumb Navigation with 1-click ancestor traversal.",
        "File & Thumbnail Grid View Modes.",
      ],
    },
    {
      id: "dedup_matrix",
      title: "2. Cross-Drive Deduplication Matrix & Visual Diff Inspector (Module 2)",
      icon: Binary,
      badge: "MODULE 2 ENGINE",
      badgeColor: "bg-[#4ECDC4]",
      description:
        "Zero-transfer cryptographic MD5 / SHA-256 matching combined with pHash (Perceptual Hashing) 99.8% media similarity detection.",
      details: [
        "Cryptographic Fingerprinting: Cross-compares Google Drive md5Checksum against OneDrive sha1Hash / quickXorHash.",
        "pHash Perceptual Hashing: Detects downscaled, re-compressed, or cropped image/video copies across clouds.",
        "Side-by-Side Visual Inspection Drawer: High-res preview card diff with an interactive Compression Heatmap Overlay.",
        "Metadata Diff Table: Highlights resolution, dimension, bitrate, creation timestamp, and file size discrepancies.",
        "Rule 1 ('Keep Highest Quality'): Preserves 4K/Originals while purging WebP or compressed secondary copies.",
        "Rule 2 ('Keep Primary Master'): Designates Google Drive or OneDrive as master source of truth.",
        "Rule 3 ('Safe Quarantine First'): Moves purged items into /_ShiftCopy_Quarantine/ for 30-day safe recovery.",
      ],
    },
    {
      id: "project_clustering",
      title: "3. Smart Project Clustering Engine & Knowledge Graph (Module 3)",
      icon: Brain,
      badge: "MODULE 3 GEMINI AI",
      badgeColor: "bg-[#A29BFE]",
      description:
        "Gemini text-embedding-004 vector embeddings group scattered files across drives into virtual project workspaces and interactive knowledge graphs.",
      details: [
        "Gemini text-embedding-004 Vector Embeddings: Ingests filename semantics, path ancestry, and metadata context.",
        "Auto-Generated AI Project Titles: Assigns human-readable names like 'CS401 Distributed Systems Final Project (2024)'.",
        "Cross-Drive Virtual Folder Workspace: Synthesizes scattered files from Google Drive and OneDrive into a single folder view.",
        "1-Click Physical Folder Consolidation: Syncs or moves scattered virtual items into a real master directory.",
        "Interactive Knowledge Graph Network: Visual SVG node map showing cosine affinity relationships between files and project hubs.",
      ],
    },
    {
      id: "agentic_orchestrator",
      title: "4. Agentic AI Storage Assistant & Human-in-the-Loop Safeguard",
      icon: Bot,
      badge: "AGENTIC AI ORCHESTRATOR",
      badgeColor: "bg-[#FF6B6B]",
      description:
        "Natural language storage migration agent featuring a ReAct reasoning trace loop and Human-in-the-Loop interactive plan inspector.",
      details: [
        "Natural Language Intent Bar: Prompts like 'Find all 2023 thesis PDFs, categorize by topic, and archive to OneDrive/'.",
        "Human-in-the-Loop (HITL) Interactive Plan Checklist: Step-by-step proposed action checklist generated prior to execution.",
        "Safety Defaults: Destructive steps (e.g. purging duplicates) are unchecked by default for user protection.",
        "ReAct Agent Trace Log: Live event log recording the agent's Thought → Tool Call → Observation loop.",
        "Long-Term Memory Store: Remembers user rules ('Keep GDrive as Master', '30-Day Rollback Buffer', 'SHA-256 Verification').",
        "Deterministic Backend Skill Directory: Air-gapped API functions for safe chunked streaming and hash verification.",
      ],
    },
    {
      id: "storage_analyzer",
      title: "5. Storage Analytics, Treemap & Waste Explorer",
      icon: PieChart,
      badge: "ANALYTICS SUITE",
      badgeColor: "bg-[#FFE66D]",
      description:
        "Interactive storage visualization tools including hierarchical D3 treemaps, entropy analysis, and waste detection.",
      details: [
        "Interactive Treemap (D3/SVG): Visual size-weighted hierarchy across connected accounts.",
        "Storage Entropy & Waste Explorer: Identifies abandoned node_modules, build caches (.next, dist), and ghost files.",
        "Smart AI Recommendations: Automated tips for bandwidth optimization and space recovery.",
      ],
    },
    {
      id: "job_streaming",
      title: "6. Active Job Streaming & Audit History",
      icon: FolderSync,
      badge: "STREAMING ENGINE",
      badgeColor: "bg-[#4ECDC4]",
      description:
        "Real-time migration progress monitoring, speed graphs (MB/s), pause/resume controls, and historical job logs.",
      details: [
        "Real-Time Speed Metrics: Live transfer rate graphs (MB/s), time remaining estimates, and active worker threads.",
        "Job Controls: Pause, resume, retry, and cancel active transfers.",
        "Audit History Log: Filterable transaction history with execution status badges and byte counts.",
        "Advanced Copy Configuration: 1-16 parallel workers, chunk size controls, and SHA-256 integrity verification.",
      ],
    },
  ];

  const filteredFeatures = features.filter(
    (f) =>
      f.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.details.some((d) => d.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const markdownContent = `# SHIFT COPY STUDIO: Complete Feature Architecture & Specification

## Executive Overview
Shift Copy Studio is a high-speed, enterprise-grade cloud storage migration and intelligent file orchestration platform.

## 1. Dual-Pane Side-by-Side Folder Explorer
- Responsive side-by-side layout (Google Drive, OneDrive, Local Vault, Shared Links).
- Multi-selection batch migration and client-side instant filtering.

## 2. Cross-Drive Deduplication Matrix & Visual Diff Inspector (Module 2)
- Zero-transfer cryptographic MD5/SHA-256 & pHash perceptual photo matcher (99.8% media similarity).
- Side-by-Side Visual Inspection Drawer with Compression Heatmap Overlay.
- Automated Conflict Resolution Rules ("Keep Highest Quality", "Keep Master Drive", "30-Day Quarantine").

## 3. Smart Project Clustering Engine & Knowledge Graph (Module 3)
- Gemini text-embedding-004 vector embeddings for automated project naming.
- Cross-Drive Virtual Workspace with 1-click physical folder consolidation.
- Interactive Knowledge Graph Network node visualization.

## 4. Agentic AI Storage Assistant & Human-in-the-Loop Safeguard
- Natural language intent execution engine.
- Human-in-the-Loop (HITL) step-by-step proposed action plan checklist.
- ReAct agent reasoning trace log and long-term user memory bank.
`;

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(markdownContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white border-4 border-black rounded-[36px] p-6 shadow-[8px_8px_0px_0px_#000] space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b-2 border-black pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 bg-[#FFE66D] text-black px-3 py-1 rounded-full text-xs font-black border-2 border-black shadow-[2px_2px_0px_0px_#000] mb-2">
            <BookOpen className="w-3.5 h-3.5 stroke-[3]" /> FEATURE SPECIFICATION & DOCUMENTATION
          </div>
          <h3 className="text-xl font-black text-black italic">
            Shift Copy Studio Architecture & Feature Documentation
          </h3>
          <p className="text-xs font-bold text-gray-600 max-w-2xl">
            Complete technical specification covering Dual-Pane Explorer, Deduplication Matrix, Gemini Project Clustering, and Agentic Storage Assistant.
          </p>
        </div>

        <button
          onClick={handleCopyMarkdown}
          className="px-4 py-2.5 bg-[#4ECDC4] hover:bg-[#3dbbb3] text-black text-xs font-black rounded-2xl border-2 border-black shadow-[3px_3px_0px_0px_#000] transition-all cursor-pointer flex items-center gap-2 shrink-0 active:translate-y-0.5"
        >
          {copied ? <CheckCircle2 className="w-4 h-4 text-black" /> : <Copy className="w-4 h-4" />}
          <span>{copied ? "Copied Markdown!" : "Copy FEATURES.md"}</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-gray-500 absolute left-4 top-3.5" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search features (e.g., pHash, Gemini embeddings, ReAct agent, quarantine)..."
          className="w-full bg-slate-50 border-2 border-black rounded-2xl pl-11 pr-4 py-2.5 text-xs font-bold text-black focus:outline-none focus:ring-2 focus:ring-[#FF6B6B]"
        />
      </div>

      {/* Feature Cards Grid */}
      <div className="space-y-6">
        {filteredFeatures.map((feat) => {
          const IconComponent = feat.icon;
          return (
            <div
              key={feat.id}
              className="bg-[#FFF9F5] p-5 rounded-3xl border-3 border-black shadow-[4px_4px_0px_0px_#000] space-y-4"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b-2 border-black/20 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-white rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_#000]">
                    <IconComponent className="w-5 h-5 text-black stroke-[2.5]" />
                  </div>
                  <h4 className="text-base font-black text-black">{feat.title}</h4>
                </div>

                <span
                  className={`${feat.badgeColor} text-black font-black text-[10px] px-2.5 py-1 rounded-full border border-black shadow-[1px_1px_0px_0px_#000]`}
                >
                  {feat.badge}
                </span>
              </div>

              <p className="text-xs font-bold text-gray-700 leading-relaxed">
                {feat.description}
              </p>

              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-wider block">
                  Key Technical Capabilities:
                </span>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs font-bold text-black">
                  {feat.details.map((detail, idx) => (
                    <li
                      key={idx}
                      className="bg-white p-2.5 rounded-2xl border border-black shadow-[1px_1px_0px_0px_#000] flex items-start gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5 stroke-[3]" />
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
