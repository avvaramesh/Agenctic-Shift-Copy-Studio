import React from "react";
import { CopyJob } from "../types";
import {
  History,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ExternalLink,
  FolderSync,
  Trash2,
  Clock,
  RotateCcw,
} from "lucide-react";

interface JobHistoryTableProps {
  historyJobs: CopyJob[];
  onSelectJobForView: (job: CopyJob) => void;
  onClearHistory: () => void;
}

export const JobHistoryTable: React.FC<JobHistoryTableProps> = ({
  historyJobs,
  onSelectJobForView,
  onClearHistory,
}) => {
  if (historyJobs.length === 0) {
    return (
      <div className="bg-white border-4 border-black rounded-[36px] p-12 text-center flex flex-col items-center justify-center min-h-[350px] shadow-[10px_10px_0px_0px_#000]">
        <div className="w-20 h-20 rounded-3xl bg-[#FFE66D] text-black border-2 border-black shadow-[4px_4px_0px_0px_#000] flex items-center justify-center mb-4">
          <History className="w-10 h-10 stroke-[2.5]" />
        </div>
        <h3 className="text-2xl font-black text-black mb-1">No Transfer History</h3>
        <p className="text-xs font-bold text-gray-500 max-w-sm">
          Completed or cancelled copy jobs will be logged in this table.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border-4 border-black rounded-[36px] overflow-hidden shadow-[12px_12px_0px_0px_#4ECDC4] space-y-0">
      {/* Table Header Bar */}
      <div className="p-5 bg-[#FFE66D] border-b-2 border-black flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History className="w-6 h-6 text-black stroke-[3]" />
          <h2 className="text-lg font-black text-black">
            TRANSFER HISTORY ({historyJobs.length})
          </h2>
        </div>

        <button
          onClick={onClearHistory}
          className="px-4 py-2 rounded-2xl bg-[#FF6B6B] hover:bg-[#ff5252] text-white border-2 border-black text-xs font-black flex items-center gap-1.5 shadow-[3px_3px_0px_0px_#000] cursor-pointer transition-all"
        >
          <Trash2 className="w-4 h-4 stroke-[2.5]" /> Clear History
        </button>
      </div>

      {/* History Rows */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-100 text-[11px] font-black uppercase text-black border-b-2 border-black">
              <th className="p-4 pl-6">Source Folder</th>
              <th className="p-4">Target Destination</th>
              <th className="p-4">Status</th>
              <th className="p-4">Copied Files</th>
              <th className="p-4">Date</th>
              <th className="p-4 pr-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y-2 divide-slate-200 text-xs text-black font-bold">
            {historyJobs.map((job) => (
              <tr key={job.id} className="hover:bg-[#FFF9F5] transition-colors">
                <td className="p-4 pl-6 font-black text-black max-w-[180px] truncate">
                  {job.sourceFolderName}
                </td>
                <td className="p-4 font-bold text-gray-700 max-w-[180px] truncate">
                  {job.targetFolderName}
                </td>
                <td className="p-4">
                  {job.status === "completed" && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-black text-black bg-[#4ECDC4] px-3 py-1 rounded-full border-2 border-black shadow-[2px_2px_0px_0px_#000]">
                      <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" /> Completed
                    </span>
                  )}
                  {job.status === "failed" && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-black text-white bg-[#FF6B6B] px-3 py-1 rounded-full border-2 border-black shadow-[2px_2px_0px_0px_#000]">
                      <AlertTriangle className="w-3.5 h-3.5 stroke-[3]" /> Failed
                    </span>
                  )}
                  {job.status === "cancelled" && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-black text-black bg-slate-200 px-3 py-1 rounded-full border-2 border-black shadow-[2px_2px_0px_0px_#000]">
                      <XCircle className="w-3.5 h-3.5 stroke-[3]" /> Cancelled
                    </span>
                  )}
                </td>
                <td className="p-4 font-mono font-black text-[#FF6B6B]">
                  {job.filesCopied} / {job.filesTotal}
                </td>
                <td className="p-4 text-gray-500 font-bold text-[11px]">
                  {job.startTime ? new Date(job.startTime).toLocaleString() : "-"}
                </td>
                <td className="p-4 pr-6 text-right space-x-2">
                  <button
                    onClick={() => onSelectJobForView(job)}
                    className="px-3.5 py-1.5 bg-white hover:bg-slate-100 text-black border-2 border-black rounded-xl text-xs font-black shadow-[2px_2px_0px_0px_#000] cursor-pointer"
                  >
                    Logs
                  </button>

                  {job.createdTargetFolderUrl && (
                    <a
                      href={job.createdTargetFolderUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 px-3.5 py-1.5 bg-[#4ECDC4] text-black border-2 border-black rounded-xl text-xs font-black shadow-[2px_2px_0px_0px_#000]"
                    >
                      <ExternalLink className="w-3.5 h-3.5 stroke-[3]" /> Drive
                    </a>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
