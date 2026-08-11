import React, { useState } from "react";
import {
  Bot,
  Sparkles,
  Send,
  CheckCircle2,
  AlertTriangle,
  Play,
  Check,
  X,
  Layers,
  Search,
  ArrowRight,
  ShieldCheck,
  FolderPlus,
  RefreshCw,
  Terminal,
  Cpu,
  Brain,
  Trash2,
  Lock,
  ChevronRight,
  Sliders,
  Settings2,
  HardDrive,
  FileText,
  Clock,
  RotateCcw,
  SlidersHorizontal,
} from "lucide-react";

export interface AgentStep {
  id: string;
  type: "create_folder" | "transfer_file" | "quarantine_file" | "delete_duplicate";
  title: string;
  sourcePath?: string;
  targetPath?: string;
  sizeBytes?: number;
  approved: boolean;
  isDestructive?: boolean;
}

export interface AgentTrace {
  id: string;
  timestamp: string;
  thought: string;
  toolCall: string;
  observation: string;
}

export interface AgentPreference {
  id: string;
  key: string;
  value: string;
  description: string;
}

interface AgenticOrchestratorProps {
  onExecutePlan?: (approvedSteps: AgentStep[]) => void;
}

const PRESET_PROMPTS = [
  "Find all 2023-2024 research thesis PDFs in Google Drive, categorize them by topic, and archive to OneDrive/Thesis_Vault/.",
  "Locate duplicate video files over 500MB across drives, move lower-resolution copies to quarantine, and keep 4K masters.",
  "Identify abandoned node_modules and build caches older than 1 year and generate a safe cleanup strategy.",
  "Sync all graduation RAW photos from Google Drive into OneDrive/Photos_Backup/ with MD5 verification.",
];

const MOCK_TRACES: AgentTrace[] = [
  {
    id: "t1",
    timestamp: "13:42:01",
    thought: "Analyzing user intent: The user wants to discover research papers and thesis datasets from 2023-2024, organize them into a structured thesis vault on OneDrive, and quarantine duplicate drafts.",
    toolCall: "search_files_semantic(query: 'thesis OR research OR CS401 dataset', created_after: '2023-01-01')",
    observation: "Found 18 matching files across Google Drive (12) and OneDrive (6). Total volume size: 4.85 GB. Identified 3 duplicate draft versions with 99.2% pHash similarity.",
  },
  {
    id: "t2",
    timestamp: "13:42:03",
    thought: "Checking storage quotas and path structure on target drive (OneDrive). OneDrive has 85.2 GB available. Designing clean destination directory hierarchy: /OneDrive/Thesis_Vault_2024/.",
    toolCall: "calculate_destination_quota(target_drive: 'OneDrive', required_bytes: 4850000000)",
    observation: "Target drive quota validated. Formulated 5-step proposed action plan with Human-in-the-Loop safeguards.",
  },
];

const INITIAL_STEPS: AgentStep[] = [
  {
    id: "step_1",
    type: "create_folder",
    title: "Create Target Vault Folder on OneDrive",
    targetPath: "/OneDrive/Thesis_Vault_2024/",
    approved: true,
    isDestructive: false,
  },
  {
    id: "step_2",
    type: "transfer_file",
    title: "Stream Copy: CS_Final_Project_Dataset_Backup.zip (2.8 GB)",
    sourcePath: "/GoogleDrive/CS_Projects/CS_Final_Project_Dataset_Backup.zip",
    targetPath: "/OneDrive/Thesis_Vault_2024/CS_Final_Project_Dataset_Backup.zip",
    sizeBytes: 2_800_000_000,
    approved: true,
    isDestructive: false,
  },
  {
    id: "step_3",
    type: "transfer_file",
    title: "Stream Copy: Distributed_Systems_Thesis_Draft_v4.pdf (850 MB)",
    sourcePath: "/GoogleDrive/Research/Distributed_Systems_Thesis_Draft_v4.pdf",
    targetPath: "/OneDrive/Thesis_Vault_2024/Distributed_Systems_Thesis_Draft_v4.pdf",
    sizeBytes: 850_000_000,
    approved: true,
    isDestructive: false,
  },
  {
    id: "step_4",
    type: "quarantine_file",
    title: "Quarantine Duplicate Draft: Thesis_Draft_v2_Old.pdf (850 MB)",
    sourcePath: "/GoogleDrive/Research/Thesis_Draft_v2_Old.pdf",
    targetPath: "/GoogleDrive/_ShiftCopy_Quarantine/Thesis_Draft_v2_Old.pdf",
    sizeBytes: 850_000_000,
    approved: true,
    isDestructive: false,
  },
  {
    id: "step_5",
    type: "delete_duplicate",
    title: "Purge Redundant Temporary Cache (.DS_Store & Thumbs.db)",
    sourcePath: "/GoogleDrive/Research/.DS_Store",
    sizeBytes: 15_000_000,
    approved: false, // Unchecked by default for safety
    isDestructive: true,
  },
];

const INITIAL_PREFERENCES: AgentPreference[] = [
  {
    id: "pref_1",
    key: "Master Drive Strategy",
    value: "Google Drive as Master",
    description: "Always preserve original copies on Google Drive when resolving duplicate conflicts.",
  },
  {
    id: "pref_2",
    key: "Quarantine Safety Buffer",
    value: "30-Day Auto Rollback",
    description: "Never hard-delete files directly; move them to /_ShiftCopy_Quarantine/ first.",
  },
  {
    id: "pref_3",
    key: "Integrity Verification",
    value: "SHA-256 Hash Verification",
    description: "Programmatically verify file byte hashes after stream copy before completing task.",
  },
];

export const AgenticOrchestrator: React.FC<AgenticOrchestratorProps> = ({
  onExecutePlan,
}) => {
  const [promptInput, setPromptInput] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [hasPlanGenerated, setHasPlanGenerated] = useState(true);
  const [steps, setSteps] = useState<AgentStep[]>(INITIAL_STEPS);
  const [traces, setTraces] = useState<AgentTrace[]>(MOCK_TRACES);
  const [preferences, setPreferences] = useState<AgentPreference[]>(INITIAL_PREFERENCES);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionProgress, setExecutionProgress] = useState(0);
  const [hasCompleted, setHasCompleted] = useState(false);
  const [activeTab, setActiveTab] = useState<"plan" | "traces" | "memory">("plan");

  const formatSize = (bytes?: number) => {
    if (!bytes) return "0 MB";
    if (bytes >= 1_000_000_000) {
      return (bytes / 1_000_000_000).toFixed(1) + " GB";
    }
    return (bytes / 1_000_000).toFixed(0) + " MB";
  };

  const handleRunAgentPrompt = (textToRun?: string) => {
    const query = textToRun || promptInput;
    if (!query.trim()) return;

    setIsAnalyzing(true);
    setHasCompleted(false);
    setExecutionProgress(0);

    setTimeout(() => {
      setIsAnalyzing(false);
      setHasPlanGenerated(true);
      setActiveTab("plan");
    }, 1200);
  };

  const toggleStepApproval = (stepId: string) => {
    setSteps((prev) =>
      prev.map((s) => (s.id === stepId ? { ...s, approved: !s.approved } : s))
    );
  };

  const handleApproveAndExecute = () => {
    const approvedSteps = steps.filter((s) => s.approved);
    if (approvedSteps.length === 0) return;

    setIsExecuting(true);
    setExecutionProgress(15);

    const interval = setInterval(() => {
      setExecutionProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsExecuting(false);
          setHasCompleted(true);
          if (onExecutePlan) onExecutePlan(approvedSteps);
          return 100;
        }
        return prev + 25;
      });
    }, 400);
  };

  const approvedCount = steps.filter((s) => s.approved).length;
  const totalApprovedBytes = steps
    .filter((s) => s.approved)
    .reduce((sum, s) => sum + (s.sizeBytes || 0), 0);

  return (
    <div className="bg-white border-4 border-black rounded-[36px] p-6 shadow-[8px_8px_0px_0px_#000] space-y-6">
      {/* Top Banner Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b-2 border-black pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 bg-[#FF6B6B] text-white px-3 py-1 rounded-full text-xs font-black border-2 border-black shadow-[2px_2px_0px_0px_#000] mb-2">
            <Bot className="w-4 h-4 stroke-[2.5]" /> REACT AGENTIC ORCHESTRATOR & HUMAN-IN-THE-LOOP SAFEGUARD
          </div>
          <h3 className="text-xl font-black text-black italic">
            Autonomous Cloud Storage Agent & Human-in-the-Loop Executor
          </h3>
          <p className="text-xs font-bold text-gray-600 max-w-2xl">
            Type natural language migration requests. The AI agent inspects your connected cloud drives, formulates step-by-step action plans, and waits for your approval before deterministic execution.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 bg-slate-100 p-1.5 rounded-2xl border-2 border-black shadow-[2px_2px_0px_0px_#000] shrink-0">
          <button
            onClick={() => setActiveTab("plan")}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "plan"
                ? "bg-[#FFE66D] text-black shadow-[1px_1px_0px_0px_#000]"
                : "text-gray-600 hover:text-black"
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>HITL Action Plan ({approvedCount})</span>
          </button>

          <button
            onClick={() => setActiveTab("traces")}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "traces"
                ? "bg-[#4ECDC4] text-black shadow-[1px_1px_0px_0px_#000]"
                : "text-gray-600 hover:text-black"
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Agent ReAct Trace ({traces.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("memory")}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "memory"
                ? "bg-[#A29BFE] text-black shadow-[1px_1px_0px_0px_#000]"
                : "text-gray-600 hover:text-black"
            }`}
          >
            <Brain className="w-3.5 h-3.5" />
            <span>Long-Term Memory</span>
          </button>
        </div>
      </div>

      {/* NATURAL LANGUAGE INTENT PROMPT INPUT BAR */}
      <div className="bg-[#FFF9F5] p-5 rounded-3xl border-3 border-black shadow-[4px_4px_0px_0px_#000] space-y-3">
        <div className="flex items-center gap-2 text-xs font-black text-black uppercase">
          <Sparkles className="w-4 h-4 text-[#FF6B6B]" />
          <span>Ask Agent to Plan Cross-Drive Migration:</span>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={promptInput}
            onChange={(e) => setPromptInput(e.target.value)}
            placeholder="e.g. Find all marketing proposals from 2023 in Google Drive, categorize by client, and archive to OneDrive..."
            className="flex-1 bg-white border-2 border-black rounded-2xl px-4 py-3 text-xs font-bold text-black focus:outline-none focus:ring-2 focus:ring-[#FF6B6B]"
            onKeyDown={(e) => {
              if (e.key === "Enter") handleRunAgentPrompt();
            }}
          />
          <button
            onClick={() => handleRunAgentPrompt()}
            disabled={isAnalyzing}
            className="px-6 py-3 bg-[#FF6B6B] hover:bg-[#e05555] text-white font-black text-xs rounded-2xl border-2 border-black shadow-[3px_3px_0px_0px_#000] transition-all cursor-pointer flex items-center justify-center gap-2 shrink-0 active:translate-y-0.5"
          >
            {isAnalyzing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Analyzing Drives...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Generate Plan</span>
              </>
            )}
          </button>
        </div>

        {/* Preset Chips */}
        <div className="space-y-1.5 pt-1">
          <span className="text-[10px] font-black text-gray-500 uppercase">Suggested Agent Tasks:</span>
          <div className="flex flex-wrap gap-2">
            {PRESET_PROMPTS.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setPromptInput(prompt);
                  handleRunAgentPrompt(prompt);
                }}
                className="bg-white hover:bg-slate-100 text-black text-[11px] font-bold px-3 py-1.5 rounded-xl border border-black shadow-[1px_1px_0px_0px_#000] transition-all cursor-pointer text-left"
              >
                💡 {prompt}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ACTIVE TAB MAIN VIEW */}
      {activeTab === "plan" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 bg-slate-50 p-4 rounded-3xl border-3 border-black shadow-[3px_3px_0px_0px_#000]">
            <div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <h4 className="text-base font-black text-black">
                  Human-in-the-Loop Interactive Plan Checklist
                </h4>
              </div>
              <p className="text-xs font-bold text-gray-600">
                Review the agent's proposed actions below. Destructive actions (like purging duplicates) are unchecked by default.
              </p>
            </div>

            <button
              onClick={handleApproveAndExecute}
              disabled={isExecuting || approvedCount === 0}
              className="px-6 py-3 bg-[#FFE66D] hover:bg-[#ffd633] text-black font-black text-xs rounded-2xl border-2 border-black shadow-[3px_3px_0px_0px_#000] transition-all cursor-pointer flex items-center gap-2 shrink-0 active:translate-y-0.5 disabled:opacity-50"
            >
              {isExecuting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Executing ({executionProgress}%)...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-black" />
                  <span>Approve & Safely Execute ({formatSize(totalApprovedBytes)})</span>
                </>
              )}
            </button>
          </div>

          {/* Execution Progress Bar */}
          {isExecuting && (
            <div className="bg-slate-900 p-4 rounded-2xl border-2 border-black text-white space-y-2">
              <div className="flex items-center justify-between text-xs font-black">
                <span className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-[#FFE66D]" />
                  <span>Streaming File Transfer & Deterministic SHA-256 Verification...</span>
                </span>
                <span className="text-[#FFE66D] font-mono">{executionProgress}%</span>
              </div>
              <div className="w-full h-3 bg-slate-700 rounded-full overflow-hidden border border-white">
                <div
                  className="h-full bg-[#FFE66D] transition-all duration-300"
                  style={{ width: `${executionProgress}%` }}
                />
              </div>
            </div>
          )}

          {hasCompleted && (
            <div className="bg-emerald-100 p-4 rounded-2xl border-2 border-black flex items-center gap-3 text-xs font-black text-black">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 stroke-[3]" />
              <span>
                Plan Executed Successfully! Streamed {formatSize(totalApprovedBytes)} across cloud drives with byte-for-byte SHA-256 verification.
              </span>
            </div>
          )}

          {/* Steps Checklist Table */}
          <div className="space-y-3">
            {steps.map((step) => (
              <div
                key={step.id}
                className={`p-4 rounded-3xl border-3 border-black transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                  step.approved
                    ? step.isDestructive
                      ? "bg-red-50 shadow-[3px_3px_0px_0px_#000]"
                      : "bg-white shadow-[3px_3px_0px_0px_#000]"
                    : "bg-slate-100 opacity-75"
                }`}
              >
                <div className="flex items-start gap-3 min-w-0">
                  <input
                    type="checkbox"
                    checked={step.approved}
                    onChange={() => toggleStepApproval(step.id)}
                    className="accent-[#FF6B6B] w-5 h-5 cursor-pointer mt-0.5 shrink-0"
                  />

                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-xs text-black">{step.title}</span>
                      {step.isDestructive && (
                        <span className="bg-red-500 text-white font-black text-[9px] px-1.5 py-0.5 rounded border border-black flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> Destructive Action
                        </span>
                      )}
                    </div>

                    <div className="text-[10px] font-mono text-gray-500 space-y-0.5">
                      {step.sourcePath && <div>Source: {step.sourcePath}</div>}
                      {step.targetPath && <div className="text-blue-600">Target: {step.targetPath}</div>}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                  {step.sizeBytes && (
                    <span className="font-black text-xs text-[#FF6B6B]">
                      {formatSize(step.sizeBytes)}
                    </span>
                  )}

                  <button
                    onClick={() => toggleStepApproval(step.id)}
                    className={`px-3 py-1 rounded-xl text-xs font-black border border-black cursor-pointer ${
                      step.approved
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-slate-200 text-gray-600"
                    }`}
                  >
                    {step.approved ? "Approved" : "Excluded"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* REACT AGENT TRACE LOG TAB */}
      {activeTab === "traces" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs font-black text-black bg-slate-100 p-3 rounded-2xl border-2 border-black">
            <span className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-[#FF6B6B]" />
              ReAct Loop Reasoning Log (Thought → Tool Call → Observation)
            </span>
            <span className="bg-black text-white px-2 py-0.5 rounded text-[10px]">
              {traces.length} Events Logged
            </span>
          </div>

          <div className="space-y-3 font-mono text-xs">
            {traces.map((trace) => (
              <div
                key={trace.id}
                className="bg-slate-900 text-white p-4 rounded-3xl border-3 border-black space-y-2 shadow-[3px_3px_0px_0px_#000]"
              >
                <div className="flex items-center justify-between text-[#FFE66D] font-bold text-[10px]">
                  <span>AGENT THOUGHT PROCESS</span>
                  <span>[{trace.timestamp}]</span>
                </div>

                <p className="text-gray-300 font-sans text-xs font-bold leading-relaxed">
                  {trace.thought}
                </p>

                <div className="bg-slate-800 p-2.5 rounded-xl border border-slate-700 text-[#4ECDC4] font-mono text-[11px]">
                  <span className="text-amber-400 font-black">⚡ TOOL CALL: </span>
                  {trace.toolCall}
                </div>

                <div className="text-emerald-400 font-sans text-[11px] font-bold">
                  <span className="text-white font-black">Observation: </span>
                  {trace.observation}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* LONG-TERM AGENT MEMORY & SKILL DIRECTORY TAB */}
      {activeTab === "memory" && (
        <div className="space-y-6">
          {/* User Preferences */}
          <div className="space-y-3">
            <span className="text-xs font-black text-black uppercase block">
              Agent Long-Term User Preferences & Rules
            </span>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {preferences.map((pref) => (
                <div
                  key={pref.id}
                  className="bg-[#FFF9F5] p-4 rounded-3xl border-3 border-black shadow-[3px_3px_0px_0px_#000] space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-gray-500 uppercase">{pref.key}</span>
                    <Lock className="w-3.5 h-3.5 text-black" />
                  </div>
                  <div className="text-sm font-black text-black">{pref.value}</div>
                  <p className="text-[10px] font-bold text-gray-600">{pref.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Exposed Deterministic Agent Skills */}
          <div className="space-y-3">
            <span className="text-xs font-black text-black uppercase block">
              Exposed Deterministic API Skills (MCP Compatible)
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-bold">
              <div className="bg-white p-3 rounded-2xl border-2 border-black shadow-[2px_2px_0px_0px_#000]">
                <div className="font-black text-black">search_files_semantic()</div>
                <p className="text-[10px] text-gray-600 pt-1">Vector RAG query on filenames, tags, and metadata ancestry.</p>
              </div>

              <div className="bg-white p-3 rounded-2xl border-2 border-black shadow-[2px_2px_0px_0px_#000]">
                <div className="font-black text-black">stream_file_transfer()</div>
                <p className="text-[10px] text-gray-600 pt-1">Chunked byte transfer with real-time SHA-256 verification.</p>
              </div>

              <div className="bg-white p-3 rounded-2xl border-2 border-black shadow-[2px_2px_0px_0px_#000]">
                <div className="font-black text-black">quarantine_duplicates()</div>
                <p className="text-[10px] text-gray-600 pt-1">Moves redundant copies into safe 30-day recovery vault.</p>
              </div>

              <div className="bg-white p-3 rounded-2xl border-2 border-black shadow-[2px_2px_0px_0px_#000]">
                <div className="font-black text-black">convert_file_format()</div>
                <p className="text-[10px] text-gray-600 pt-1">On-the-fly document / image conversion during transfer.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
