import React, { useState } from "react";
import { CopyJob } from "../types";
import {
  Pause,
  Play,
  XCircle,
  CheckCircle2,
  AlertTriangle,
  FolderSync,
  ExternalLink,
  Terminal,
  Activity,
  Zap,
  Clock,
  FileCheck,
  Search,
  RotateCcw,
} from "lucide-react";

interface ActiveJobDashboardProps {
  job: CopyJob | null;
  onJobAction: (action: "pause" | "resume" | "cancel") => void;
  onReRunJob?: () => void;
}

export const ActiveJobDashboard: React.FC<ActiveJobDashboardProps> = ({
  job,
  onJobAction,
  onReRunJob,
}) => {
  const [logFilter, setLogFilter] = useState<"all" | "info" | "success" | "error">("all");
  const [logSearch, setLogSearch] = useState("");

  if (!job) {
    return (
      <div className="bg-white border-4 border-black rounded-[36px] p-12 text-center flex flex-col items-center justify-center min-h-[400px] shadow-[10px_10px_0px_0px_#000]">
        <div className="w-20 h-20 rounded-3xl bg-[#FFE66D] text-black border-2 border-black shadow-[4px_4px_0px_0px_#000] flex items-center justify-center mb-4">
          <FolderSync className="w-10 h-10 stroke-[2.5]" />
        </div>
        <h3 className="text-2xl font-black text-black mb-1">No Active Transfer Job</h3>
        <p className="text-xs font-bold text-gray-500 max-w-sm">
          Select a Source and Target folder in the Explorer tab to start a high-speed copy job.
        </p>
      </div>
    );
  }

  const filteredLogs = job.logs.filter((log) => {
    if (logFilter !== "all" && log.type !== logFilter) return false;
    if (logSearch && !log.message.toLowerCase().includes(logSearch.toLowerCase())) return false;
    return true;
  });

  const getStatusBadge = () => {
    switch (job.status) {
      case "in_progress":
        return (
          <span className="flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#4ECDC4] text-black border-2 border-black text-xs font-black shadow-[2px_2px_0px_0px_#000]">
            <Activity className="w-3.5 h-3.5 animate-spin stroke-[3]" /> Copying in Progress...
          </span>
        );
      case "paused":
        return (
          <span className="flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#FFE66D] text-black border-2 border-black text-xs font-black shadow-[2px_2px_0px_0px_#000]">
            <Pause className="w-3.5 h-3.5 stroke-[3]" /> Paused
          </span>
        );
      case "completed":
        return (
          <span className="flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#4ECDC4] text-white border-2 border-black text-xs font-black shadow-[2px_2px_0px_0px_#000]">
            <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" /> Completed
          </span>
        );
      case "failed":
        return (
          <span className="flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#FF6B6B] text-white border-2 border-black text-xs font-black shadow-[2px_2px_0px_0px_#000]">
            <AlertTriangle className="w-3.5 h-3.5 stroke-[3]" /> Failed
          </span>
        );
      case "cancelled":
        return (
          <span className="flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-slate-200 text-black border-2 border-black text-xs font-black shadow-[2px_2px_0px_0px_#000]">
            <XCircle className="w-3.5 h-3.5 stroke-[3]" /> Cancelled
          </span>
        );
      default:
        return null;
    }
  };

  const elapsedTimeSec = job.startTime
    ? Math.floor(((job.endTime || Date.now()) - job.startTime) / 1000)
    : 0;

  return (
    <div className="space-y-6">
      {/* Top Status & Metrics Panel */}
      <div className="bg-white border-4 border-black rounded-[36px] p-8 shadow-[12px_12px_0px_0px_#FFE66D] relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-2xl font-black text-black italic">{job.sourceFolderName}</h2>
              {getStatusBadge()}
            </div>
            <p className="text-xs font-bold text-gray-500">
              Destination Target: <span className="text-[#FF6B6B] font-black">{job.targetFolderName}</span>
            </p>
          </div>

          {/* Action Controls */}
          <div className="flex items-center gap-2">
            {job.status === "in_progress" && (
              <button
                onClick={() => onJobAction("pause")}
                className="px-4 py-2 bg-[#FFE66D] text-black border-2 border-black rounded-2xl text-xs font-black flex items-center gap-1.5 shadow-[3px_3px_0px_0px_#000] hover:translate-y-[-1px] transition-all cursor-pointer"
              >
                <Pause className="w-4 h-4 stroke-[3]" /> Pause
              </button>
            )}

            {job.status === "paused" && (
              <button
                onClick={() => onJobAction("resume")}
                className="px-4 py-2 bg-[#4ECDC4] text-black border-2 border-black rounded-2xl text-xs font-black flex items-center gap-1.5 shadow-[3px_3px_0px_0px_#000] hover:translate-y-[-1px] transition-all cursor-pointer"
              >
                <Play className="w-4 h-4 stroke-[3]" /> Resume
              </button>
            )}

            {(job.status === "in_progress" || job.status === "paused") && (
              <button
                onClick={() => onJobAction("cancel")}
                className="px-4 py-2 bg-[#FF6B6B] text-white border-2 border-black rounded-2xl text-xs font-black flex items-center gap-1.5 shadow-[3px_3px_0px_0px_#000] hover:translate-y-[-1px] transition-all cursor-pointer"
              >
                <XCircle className="w-4 h-4 stroke-[3]" /> Cancel
              </button>
            )}

            {job.createdTargetFolderUrl && (
              <a
                href={job.createdTargetFolderUrl}
                target="_blank"
                rel="noreferrer"
                className="px-5 py-2 bg-[#4ECDC4] text-black border-2 border-black rounded-2xl text-xs font-black flex items-center gap-2 shadow-[3px_3px_0px_0px_#000] hover:translate-y-[-1px] transition-all cursor-pointer"
              >
                <ExternalLink className="w-4 h-4 stroke-[3]" /> Open in Drive
              </a>
            )}
          </div>
        </div>

        {/* Progress Bar & Gauges */}
        <div className="space-y-2 mb-6">
          <div className="flex justify-between text-xs font-black text-black">
            <span>
              PROGRESS: {job.progressPercentage}%
            </span>
            <span className="text-[#FF6B6B]">
              {job.filesCopied} / {job.filesTotal} FILES COPIED
            </span>
          </div>

          <div className="w-full h-6 bg-white border-2 border-black rounded-full overflow-hidden p-0.5 shadow-[3px_3px_0px_0px_#000]">
            <div
              className="h-full bg-[#4ECDC4] border-r-2 border-black rounded-full transition-all duration-300"
              style={{ width: `${job.progressPercentage}%` }}
            />
          </div>

          {job.currentFile && (
            <div className="text-xs font-bold text-gray-600 truncate flex items-center gap-2 pt-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FF6B6B] animate-ping shrink-0" />
              <span>Copying file: <strong className="text-black font-black">{job.currentFile}</strong></span>
            </div>
          )}
        </div>

        {/* Quick Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-[#FFF9F5] p-4 rounded-2xl border-2 border-black shadow-[4px_4px_0px_0px_#000]">
            <div className="text-[10px] text-gray-500 font-black uppercase flex items-center gap-1">
              <FileCheck className="w-3.5 h-3.5 text-black stroke-[2.5]" /> Files Copied
            </div>
            <div className="text-xl font-black text-black mt-1">
              {job.filesCopied} <span className="text-xs font-bold text-gray-400">/ {job.filesTotal}</span>
            </div>
          </div>

          <div className="bg-[#FFF9F5] p-4 rounded-2xl border-2 border-black shadow-[4px_4px_0px_0px_#000]">
            <div className="text-[10px] text-gray-500 font-black uppercase flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-black stroke-[2.5]" /> Speed
            </div>
            <div className="text-xl font-black text-black mt-1">
              {job.speedFilesPerSec} <span className="text-xs font-bold text-gray-400">files/s</span>
            </div>
          </div>

          <div className="bg-[#FFF9F5] p-4 rounded-2xl border-2 border-black shadow-[4px_4px_0px_0px_#000]">
            <div className="text-[10px] text-gray-500 font-black uppercase flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-black stroke-[2.5]" /> Elapsed Time
            </div>
            <div className="text-xl font-black text-black mt-1">
              {elapsedTimeSec}s
            </div>
          </div>

          <div className="bg-[#FFF9F5] p-4 rounded-2xl border-2 border-black shadow-[4px_4px_0px_0px_#000]">
            <div className="text-[10px] text-gray-500 font-black uppercase flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5 text-black stroke-[2.5]" /> Errors
            </div>
            <div className="text-xl font-black text-[#FF6B6B] mt-1">
              {job.filesFailed}
            </div>
          </div>
        </div>
      </div>

      {/* Real-time Activity Terminal & Log Stream */}
      <div className="bg-black text-white border-4 border-black rounded-[36px] overflow-hidden shadow-[12px_12px_0px_0px_#FF6B6B] flex flex-col h-[380px]">
        {/* Console Header */}
        <div className="p-4 bg-black border-b-2 border-white/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-[#4ECDC4] stroke-[2.5]" />
            <h3 className="text-xs font-black uppercase tracking-wider text-white">
              Live Transfer Execution Log
            </h3>
            <span className="text-[10px] font-bold text-gray-400">({filteredLogs.length} events)</span>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5">
            {(["all", "info", "success", "error"] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setLogFilter(filter)}
                className={`px-3 py-1 rounded-full text-[10px] font-black uppercase transition-all cursor-pointer border ${
                  logFilter === filter
                    ? "bg-[#FFE66D] text-black border-black"
                    : "text-gray-400 hover:text-white border-transparent"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Search Bar */}
        <div className="p-2.5 bg-zinc-900 border-b border-zinc-800 flex items-center px-4">
          <Search className="w-4 h-4 text-gray-400 mr-2 stroke-[2.5]" />
          <input
            type="text"
            value={logSearch}
            onChange={(e) => setLogSearch(e.target.value)}
            placeholder="Search log messages..."
            className="w-full bg-transparent text-xs font-mono text-white placeholder-gray-500 focus:outline-none"
          />
        </div>

        {/* Terminal Window */}
        <div className="flex-1 p-4 font-mono text-xs overflow-y-auto space-y-2">
          {filteredLogs.length === 0 ? (
            <div className="text-gray-500 italic">No log entries matching criteria.</div>
          ) : (
            filteredLogs.map((log) => (
              <div key={log.id} className="flex items-start gap-2.5 leading-relaxed">
                <span className="text-gray-500 text-[10px] shrink-0 pt-0.5">[{log.timestamp}]</span>
                {log.type === "success" && (
                  <span className="text-[#4ECDC4] font-bold shrink-0">[SUCCESS]</span>
                )}
                {log.type === "error" && (
                  <span className="text-[#FF6B6B] font-bold shrink-0">[ERROR]</span>
                )}
                {log.type === "info" && (
                  <span className="text-[#FFE66D] font-bold shrink-0">[INFO]</span>
                )}
                {log.type === "warning" && (
                  <span className="text-amber-300 font-bold shrink-0">[WARN]</span>
                )}
                <span className="text-gray-200 break-all">{log.message}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
