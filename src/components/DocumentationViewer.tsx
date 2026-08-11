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
  Building2,
  Workflow,
  Compass,
} from "lucide-react";

export const DocumentationViewer: React.FC = () => {
  const [docTab, setDocTab] = useState<"features" | "hld" | "lld" | "user_guide">("features");
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

  const getMarkdownByTab = () => {
    if (docTab === "hld") {
      return `# HIGH-LEVEL DESIGN (HLD): SHIFT COPY STUDIO\n\n1. Enterprise Multi-Cloud Topology\n2. OAuth 2.0 PKCE Scoped Security Boundaries\n3. Gemini text-embedding-004 Vector Store Architecture\n4. ReAct Reasoning Loop & Deterministic Execution Air-Gap\n5. Zero-Data-Retention Streaming In-Transit Proxies`;
    }
    if (docTab === "lld") {
      return `# LOW-LEVEL DESIGN (LLD): SHIFT COPY STUDIO\n\n1. StreamingTransferEngine & Chunked Upload Interfaces\n2. pHash Perceptual Hamming Distance Hamming Calculator\n3. Gemini API Function Signatures & Embedding Interfaces\n4. ReAct Agent Tool Call Definitions & Safety Schema`;
    }
    if (docTab === "user_guide") {
      return `# USER GUIDE & OPERATING MANUAL: SHIFT COPY STUDIO\n\n1. Dual-Pane Side-by-Side Transfer Steps\n2. Module 2: Deduplication & Visual Diff Drawer Guide\n3. Module 3: Virtual Project Workspace & Knowledge Graph Guide\n4. Agentic AI Natural Language Commands & HITL Approval Drawer`;
    }
    return `# SHIFT COPY STUDIO: Complete Feature Specifications\n\nFull architecture breakdown for Dual-Pane Explorer, Deduplication Matrix, Gemini Project Clustering, and Agentic Storage Assistant.`;
  };

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(getMarkdownByTab());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white border-4 border-black rounded-[36px] p-6 shadow-[8px_8px_0px_0px_#000] space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b-2 border-black pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 bg-[#FFE66D] text-black px-3 py-1 rounded-full text-xs font-black border-2 border-black shadow-[2px_2px_0px_0px_#000] mb-2">
            <BookOpen className="w-3.5 h-3.5 stroke-[3]" /> ENTERPRISE DOCUMENTATION SUITE
          </div>
          <h3 className="text-xl font-black text-black italic">
            Shift Copy Studio Architecture & Operational Specifications
          </h3>
          <p className="text-xs font-bold text-gray-600 max-w-2xl">
            Complete technical documentation across all organizational tiers: High-Level Design (HLD), Low-Level Design (LLD), User Guide, and Feature Architecture.
          </p>
        </div>

        <button
          onClick={handleCopyMarkdown}
          className="px-4 py-2.5 bg-[#4ECDC4] hover:bg-[#3dbbb3] text-black text-xs font-black rounded-2xl border-2 border-black shadow-[3px_3px_0px_0px_#000] transition-all cursor-pointer flex items-center gap-2 shrink-0 active:translate-y-0.5"
        >
          {copied ? <CheckCircle2 className="w-4 h-4 text-black" /> : <Copy className="w-4 h-4" />}
          <span>{copied ? "Copied Markdown!" : `Copy ${docTab.toUpperCase()}.md`}</span>
        </button>
      </div>

      {/* Doc Tier Switcher */}
      <div className="flex flex-wrap items-center gap-2 bg-slate-100 p-2 rounded-2xl border-2 border-black shadow-[2px_2px_0px_0px_#000]">
        <button
          onClick={() => setDocTab("features")}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${
            docTab === "features"
              ? "bg-[#FFE66D] text-black shadow-[2px_2px_0px_0px_#000]"
              : "text-gray-700 hover:text-black"
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Org Feature Architecture</span>
        </button>

        <button
          onClick={() => setDocTab("hld")}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${
            docTab === "hld"
              ? "bg-[#4ECDC4] text-black shadow-[2px_2px_0px_0px_#000]"
              : "text-gray-700 hover:text-black"
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>High-Level Design (HLD)</span>
        </button>

        <button
          onClick={() => setDocTab("lld")}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${
            docTab === "lld"
              ? "bg-[#A29BFE] text-black shadow-[2px_2px_0px_0px_#000]"
              : "text-gray-700 hover:text-black"
          }`}
        >
          <Code2 className="w-4 h-4" />
          <span>Low-Level Design (LLD)</span>
        </button>

        <button
          onClick={() => setDocTab("user_guide")}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${
            docTab === "user_guide"
              ? "bg-[#FF6B6B] text-white shadow-[2px_2px_0px_0px_#000]"
              : "text-gray-700 hover:text-black"
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>User Operating Guide</span>
        </button>
      </div>

      {/* Doc View Content Depending on Active Tab */}
      {docTab === "features" && (
        <div className="space-y-6">
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
      )}

      {/* HLD VIEW */}
      {docTab === "hld" && (
        <div className="bg-[#FFF9F5] p-6 rounded-3xl border-3 border-black shadow-[4px_4px_0px_0px_#000] space-y-6">
          <div className="flex items-center gap-2 text-black">
            <Building2 className="w-6 h-6 text-[#4ECDC4]" />
            <h4 className="text-lg font-black italic">HIGH-LEVEL DESIGN (HLD) ARCHITECTURE</h4>
          </div>

          <div className="space-y-4 text-xs font-bold text-gray-800 leading-relaxed">
            <div className="bg-white p-4 rounded-2xl border-2 border-black shadow-[2px_2px_0px_0px_#000] space-y-2">
              <span className="text-sm font-black text-black block">1. Enterprise Multi-Cloud Topology</span>
              <p>
                Shift Copy Studio functions as a stateless streaming proxy between Google Drive API (v3) and Microsoft Graph API (v1.0). File payloads are transferred chunk-by-chunk directly through RAM buffers in memory without persisting payload bytes to local storage disks.
              </p>
            </div>

            <div className="bg-white p-4 rounded-2xl border-2 border-black shadow-[2px_2px_0px_0px_#000] space-y-2">
              <span className="text-sm font-black text-black block">2. Security & Scoped Token Delegation</span>
              <p>
                OAuth 2.0 PKCE authentication delegates scoped permission tokens. Tokens are maintained securely server-side inside HTTP-Only encrypted session cookies, ensuring client-side browser JavaScript cannot extract raw access tokens.
              </p>
            </div>

            <div className="bg-white p-4 rounded-2xl border-2 border-black shadow-[2px_2px_0px_0px_#000] space-y-2">
              <span className="text-sm font-black text-black block">3. Gemini Vector Embedding & ReAct Loop Architecture</span>
              <p>
                The Agentic Orchestrator uses Gemini <code className="bg-slate-100 px-1 rounded font-mono">text-embedding-004</code> for semantic vector indexing, coupled with an air-gapped ReAct (<code className="bg-slate-100 px-1 rounded font-mono">Reasoning + Action</code>) loop that requires explicit Human-in-the-Loop user approval prior to calling deterministic file transfer skills.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* LLD VIEW */}
      {docTab === "lld" && (
        <div className="bg-[#FFF9F5] p-6 rounded-3xl border-3 border-black shadow-[4px_4px_0px_0px_#000] space-y-6">
          <div className="flex items-center gap-2 text-black">
            <Code2 className="w-6 h-6 text-[#A29BFE]" />
            <h4 className="text-lg font-black italic">LOW-LEVEL DESIGN (LLD) TECHNICAL SPECIFICATIONS</h4>
          </div>

          <div className="space-y-4 font-mono text-xs">
            <div className="bg-slate-900 text-white p-4 rounded-2xl border-2 border-black space-y-2">
              <span className="text-[#FFE66D] font-black text-sm block">1. StreamingTransferEngine Class Signature</span>
              <pre className="text-gray-300 overflow-x-auto text-[11px] leading-relaxed">
{`export class StreamingTransferEngine {
  async initChunkedUpload(job: TransferStreamJob, config: TransferChunkConfig): Promise<string>;
  async streamChunk(uploadUrl: string, chunkBuffer: ArrayBuffer, offset: number): Promise<boolean>;
  async finalizeTransfer(jobId: string): Promise<{ success: boolean; hashVerified: boolean }>;
}`}
              </pre>
            </div>

            <div className="bg-slate-900 text-white p-4 rounded-2xl border-2 border-black space-y-2">
              <span className="text-[#4ECDC4] font-black text-sm block">2. pHash Perceptual Hamming Distance Calculator</span>
              <pre className="text-gray-300 overflow-x-auto text-[11px] leading-relaxed">
{`export function calculatePerceptualDistance(pHashA: string, pHashB: string): number {
  const valA = BigInt("0x" + pHashA);
  const valB = BigInt("0x" + pHashB);
  let xorVal = valA ^ valB, distance = 0;
  while (xorVal > 0n) { if (xorVal & 1n) distance++; xorVal >>= 1n; }
  return distance; // Distance <= 5 indicates 99.8% visual match
}`}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* USER GUIDE VIEW */}
      {docTab === "user_guide" && (
        <div className="bg-[#FFF9F5] p-6 rounded-3xl border-3 border-black shadow-[4px_4px_0px_0px_#000] space-y-6">
          <div className="flex items-center gap-2 text-black">
            <Compass className="w-6 h-6 text-[#FF6B6B]" />
            <h4 className="text-lg font-black italic">END-USER OPERATING MANUAL & STEP-BY-STEP GUIDES</h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-bold text-black">
            <div className="bg-white p-4 rounded-2xl border-2 border-black shadow-[2px_2px_0px_0px_#000] space-y-2">
              <span className="font-black text-sm text-[#FF6B6B] block">Step 1: Dual-Pane Migration</span>
              <p className="text-gray-700">
                Select Source Drive on the left and Destination Drive on the right. Multi-select items and click <code className="bg-slate-100 px-1 rounded">Transfer Selected</code>.
              </p>
            </div>

            <div className="bg-white p-4 rounded-2xl border-2 border-black shadow-[2px_2px_0px_0px_#000] space-y-2">
              <span className="font-black text-sm text-[#4ECDC4] block">Step 2: Module 2 Deduplication</span>
              <p className="text-gray-700">
                Open Storage Analyzer $\rightarrow$ Deduplication Matrix. Inspect pairs with the Side-by-Side Visual Diff drawer and apply automated presets.
              </p>
            </div>

            <div className="bg-white p-4 rounded-2xl border-2 border-black shadow-[2px_2px_0px_0px_#000] space-y-2">
              <span className="font-black text-sm text-[#A29BFE] block">Step 3: Module 3 Gemini Clustering</span>
              <p className="text-gray-700">
                Run Gemini embeddings to synthesize cross-drive virtual folders and view interactive knowledge graph node maps.
              </p>
            </div>

            <div className="bg-white p-4 rounded-2xl border-2 border-black shadow-[2px_2px_0px_0px_#000] space-y-2">
              <span className="font-black text-sm text-[#FFE66D] block">Step 4: Agentic AI Assistant</span>
              <p className="text-gray-700">
                Type natural language migration prompts. Review the Human-in-the-Loop checklist and approve step-by-step execution.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
