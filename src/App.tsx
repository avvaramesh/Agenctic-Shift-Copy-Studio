import React, { useState, useEffect } from "react";
import {
  CopyJob,
  CopyOptions,
  SelectedFolderState,
  UserProfile,
} from "./types";
import { initAuthListener } from "./lib/firebase";
import { VirtualStorageManager } from "./lib/virtualStorage";
import { Navbar } from "./components/Navbar";
import { DirectoryPane } from "./components/DirectoryPane";
import { CopyConfigModal } from "./components/CopyConfigModal";
import { ActiveJobDashboard } from "./components/ActiveJobDashboard";
import { JobHistoryTable } from "./components/JobHistoryTable";
import { StorageAnalyzer } from "./components/StorageAnalyzer";
import { MigrationGuides } from "./components/MigrationGuides";
import { DocumentationViewer } from "./components/DocumentationViewer";
import {
  FolderSync,
  ArrowRight,
  Folder,
  SlidersHorizontal,
  Sparkles,
  CheckCircle2,
  ShieldAlert,
  Play,
  Layers,
  Columns,
  Rows,
} from "lucide-react";

export default function App() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [sourceUser, setSourceUser] = useState<UserProfile | null>(null);
  const [targetUser, setTargetUser] = useState<UserProfile | null>(null);

  const [activeTab, setActiveTab] = useState<
    "explorer" | "active_jobs" | "history" | "analyzer" | "guides" | "docs"
  >("explorer");

  const [paneLayoutMode, setPaneLayoutMode] = useState<"side_by_side" | "stacked">("side_by_side");

  const [sourceFolder, setSourceFolder] = useState<SelectedFolderState | null>(null);
  const [targetFolder, setTargetFolder] = useState<SelectedFolderState | null>(null);

  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [activeJob, setActiveJob] = useState<CopyJob | null>(null);
  const [jobHistory, setJobHistory] = useState<CopyJob[]>([]);

  // Auth listener initialization
  useEffect(() => {
    const unsubscribe = initAuthListener(
      (profile) => {
        setUser(profile);
        setSourceUser((prev) => prev || profile);
        setTargetUser((prev) => prev || profile);
      },
      () => {
        setUser(null);
        setSourceUser(null);
        setTargetUser(null);
      }
    );
    return () => unsubscribe();
  }, []);

  // Initialize job history from localStorage
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem("drive_mover_job_history");
      if (savedHistory) {
        setJobHistory(JSON.parse(savedHistory));
      }
    } catch (e) {
      console.warn("Could not load job history from localStorage");
    }
  }, []);

  // Save job history to localStorage
  useEffect(() => {
    try {
      if (jobHistory.length > 0) {
        localStorage.setItem("drive_mover_job_history", JSON.stringify(jobHistory.slice(0, 50)));
      }
    } catch (e) {
      console.warn("Could not save job history");
    }
  }, [jobHistory]);

  // Poll active job status if running on backend
  useEffect(() => {
    if (!activeJob || activeJob.status !== "in_progress") return;

    // If it's a Drive backend job
    if (activeJob.sourceLocation === "google_drive" || activeJob.targetLocation === "google_drive") {
      const interval = setInterval(async () => {
        try {
          const res = await fetch(`/api/drive/job-status/${activeJob.id}`);
          if (res.ok) {
            const updated: CopyJob = await res.json();
            setActiveJob(updated);

            if (updated.status === "completed" || updated.status === "failed" || updated.status === "cancelled") {
              setJobHistory((prev) => [updated, ...prev.filter((j) => j.id !== updated.id)]);
            }
          }
        } catch (err) {
          console.error("Job status polling error:", err);
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [activeJob]);

  const handleStartCopyJob = async (options: CopyOptions) => {
    if (!sourceFolder || !targetFolder) return;

    setIsConfigModalOpen(false);

    const srcToken = sourceFolder.accessToken || sourceUser?.accessToken || user?.accessToken;
    const tgtToken = targetFolder.accessToken || targetUser?.accessToken || user?.accessToken || srcToken;

    // If both or either involves Google Drive
    if (sourceFolder.locationType === "google_drive" || targetFolder.locationType === "google_drive") {
      if (!srcToken) {
        alert("Please sign in with Google to copy folders on Google Drive.");
        return;
      }

      const srcRefreshToken = sourceFolder.refreshToken || sourceUser?.refreshToken || user?.refreshToken;
      const srcTokenExpiry = sourceFolder.tokenExpiry || sourceUser?.tokenExpiry || user?.tokenExpiry;
      const srcProvider = sourceFolder.provider || sourceUser?.provider || "google";

      const tgtRefreshToken = targetFolder.refreshToken || targetUser?.refreshToken || user?.refreshToken;
      const tgtTokenExpiry = targetFolder.tokenExpiry || targetUser?.tokenExpiry || user?.tokenExpiry;
      const tgtProvider = targetFolder.provider || targetUser?.provider || "google";

      try {
        const res = await fetch("/api/drive/start-copy", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${srcToken}`,
          },
          body: JSON.stringify({
            sourceFolderId: sourceFolder.folderId,
            targetFolderId: targetFolder.folderId,
            targetAccessToken: tgtToken,
            options,
            sourceRefreshToken: srcRefreshToken,
            sourceTokenExpiry: srcTokenExpiry,
            sourceProvider: srcProvider,
            targetRefreshToken: tgtRefreshToken,
            targetTokenExpiry: tgtTokenExpiry,
            targetProvider: tgtProvider,
          }),
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || "Failed to start server copy job");
        }

        const data = await res.json();
        const newJob: CopyJob = {
          id: data.jobId,
          sourceFolderId: sourceFolder.folderId,
          sourceFolderName: sourceFolder.folderName,
          sourceLocation: sourceFolder.locationType,
          targetFolderId: targetFolder.folderId,
          targetFolderName: targetFolder.folderName,
          targetLocation: targetFolder.locationType,
          status: "in_progress",
          progressPercentage: 0,
          filesTotal: sourceFolder.totalFiles || 0,
          filesCopied: 0,
          filesFailed: 0,
          speedFilesPerSec: 0,
          startTime: Date.now(),
          options,
          logs: [
            {
              id: "l1",
              timestamp: new Date().toLocaleTimeString(),
              type: "info",
              message: "Initiated Google Drive server-side copy job...",
            },
          ],
        };

        setActiveJob(newJob);
        setActiveTab("active_jobs");
      } catch (err: any) {
        alert("Could not start copy job: " + err.message);
      }
    } else {
      // Virtual Local Storage Copy
      const localJobId = "job_v_" + Date.now();
      const newJob: CopyJob = {
        id: localJobId,
        sourceFolderId: sourceFolder.folderId,
        sourceFolderName: sourceFolder.folderName,
        sourceLocation: "virtual_local",
        targetFolderId: targetFolder.folderId,
        targetFolderName: targetFolder.folderName,
        targetLocation: "virtual_local",
        status: "in_progress",
        progressPercentage: 0,
        filesTotal: 0,
        filesCopied: 0,
        filesFailed: 0,
        speedFilesPerSec: 2.5,
        startTime: Date.now(),
        options,
        logs: [],
      };

      setActiveJob(newJob);
      setActiveTab("active_jobs");

      // Execute Virtual Storage Copy
      setTimeout(() => {
        try {
          const result = VirtualStorageManager.copyVirtualFolder(
            sourceFolder.folderId,
            targetFolder.folderId,
            options,
            (copied, total, currentFileName) => {
              setActiveJob((prev) => {
                if (!prev) return null;
                return {
                  ...prev,
                  filesTotal: total,
                  filesCopied: copied,
                  currentFile: currentFileName,
                  progressPercentage: Math.min(100, Math.round((copied / total) * 100)),
                  logs: [
                    {
                      id: "log_" + Date.now(),
                      timestamp: new Date().toLocaleTimeString(),
                      type: "success",
                      message: `Copied file: ${currentFileName}`,
                    },
                    ...prev.logs,
                  ],
                };
              });
            }
          );

          // Complete job
          setTimeout(() => {
            setActiveJob((prev) => {
              if (!prev) return null;
              const completedJob: CopyJob = {
                ...prev,
                status: "completed",
                progressPercentage: 100,
                endTime: Date.now(),
                filesCopied: result.totalCopied || prev.filesTotal,
                filesTotal: result.totalCopied || prev.filesTotal,
                currentFile: undefined,
                logs: [
                  {
                    id: "log_done",
                    timestamp: new Date().toLocaleTimeString(),
                    type: "success",
                    message: `Folder copy finished! Created folder "${result.createdFolderName}"`,
                  },
                  ...prev.logs,
                ],
              };
              setJobHistory((h) => [completedJob, ...h]);
              return completedJob;
            });
          }, 600);
        } catch (vErr: any) {
          setActiveJob((prev) => {
            if (!prev) return null;
            return {
              ...prev,
              status: "failed",
              endTime: Date.now(),
              logs: [
                {
                  id: "log_err",
                  timestamp: new Date().toLocaleTimeString(),
                  type: "error",
                  message: `Local copy error: ${vErr.message || vErr}`,
                },
                ...prev.logs,
              ],
            };
          });
        }
      }, 500);
    }
  };

  const handleJobAction = async (action: "pause" | "resume" | "cancel") => {
    if (!activeJob) return;

    if (activeJob.sourceLocation === "google_drive" || activeJob.targetLocation === "google_drive") {
      try {
        await fetch(`/api/drive/job-action/${activeJob.id}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action }),
        });
      } catch (err) {
        console.error("Job action error:", err);
      }
    } else {
      // Local job status toggle
      if (action === "cancel") {
        setActiveJob((prev) => (prev ? { ...prev, status: "cancelled", endTime: Date.now() } : null));
      } else if (action === "pause") {
        setActiveJob((prev) => (prev ? { ...prev, status: "paused" } : null));
      } else if (action === "resume") {
        setActiveJob((prev) => (prev ? { ...prev, status: "in_progress" } : null));
      }
    }
  };

  const isReadyToCopy = sourceFolder && targetFolder;

  return (
    <div className="min-h-screen bg-[#FFF9F5] text-black flex flex-col font-sans antialiased selection:bg-[#FFE66D] selection:text-black">
      {/* Header */}
      <Navbar
        user={user}
        setUser={setUser}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activeJobCount={activeJob?.status === "in_progress" ? 1 : 0}
      />

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Active Selection Banner */}
        {isReadyToCopy && activeTab === "explorer" && (
          <div className="bg-[#FFE66D] border-4 border-black rounded-[36px] p-6 shadow-[8px_8px_0px_0px_#000] flex flex-col md:flex-row md:items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="flex items-center gap-4 min-w-0">
              <div className="w-14 h-14 rounded-2xl bg-black text-[#FFE66D] flex items-center justify-center shrink-0 border-2 border-black shadow-[3px_3px_0px_0px_#4ECDC4]">
                <FolderSync className="w-7 h-7 stroke-[2.5]" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-black uppercase tracking-wider">
                    Ready to Migrate
                  </span>
                  <span className="px-3 py-0.5 rounded-full bg-[#4ECDC4] text-black border-2 border-black text-[10px] font-black shadow-[1px_1px_0px_0px_#000]">
                    Paths Validated
                  </span>
                </div>
                <div className="text-base font-black text-black truncate flex items-center gap-2 mt-0.5">
                  <span className="bg-white border-2 border-black px-3 py-0.5 rounded-xl shadow-[2px_2px_0px_0px_#000]">{sourceFolder.folderName}</span>
                  <ArrowRight className="w-5 h-5 text-black shrink-0 stroke-[3]" />
                  <span className="bg-[#4ECDC4] border-2 border-black px-3 py-0.5 rounded-xl shadow-[2px_2px_0px_0px_#000] text-black">{targetFolder.folderName}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsConfigModalOpen(true)}
              className="px-8 py-4 rounded-2xl bg-[#FF6B6B] hover:bg-[#ff5252] text-white font-black text-sm border-2 border-black shadow-[6px_6px_0px_0px_#000] hover:translate-y-[-1px] flex items-center justify-center gap-2 transition-all cursor-pointer shrink-0"
            >
              <SlidersHorizontal className="w-5 h-5 stroke-[2.5]" />
              <span>CONFIGURE & START COPY</span>
            </button>
          </div>
        )}

        {/* Tab 1: Folder Explorer (Dual-Pane) */}
        {activeTab === "explorer" && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white border-2 border-black rounded-2xl p-3 shadow-[3px_3px_0px_0px_#000]">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#4ECDC4] border border-black animate-pulse" />
                <span className="text-xs font-black text-black uppercase tracking-wider">
                  Dual-Pane Directory Explorer
                </span>
                <span className="hidden sm:inline text-[11px] font-black text-black bg-[#FFE66D] px-2 py-0.5 rounded-lg border border-black shadow-[1px_1px_0px_0px_#000]">
                  Source (Left) ⟷ Target (Right)
                </span>
              </div>

              {/* View Mode Switcher */}
              <div className="flex items-center gap-1.5 self-end sm:self-auto">
                <span className="text-[10px] font-black uppercase text-gray-500 mr-1">Layout:</span>
                <button
                  type="button"
                  onClick={() => setPaneLayoutMode("side_by_side")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black border-2 border-black cursor-pointer flex items-center gap-1.5 transition-all ${
                    paneLayoutMode === "side_by_side"
                      ? "bg-[#4ECDC4] text-black shadow-[2px_2px_0px_0px_#000]"
                      : "bg-white text-gray-700 hover:bg-gray-100"
                  }`}
                  title="Side-by-Side 2-Column View"
                >
                  <Columns className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Side-by-Side</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaneLayoutMode("stacked")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black border-2 border-black cursor-pointer flex items-center gap-1.5 transition-all ${
                    paneLayoutMode === "stacked"
                      ? "bg-[#FF6B6B] text-white shadow-[2px_2px_0px_0px_#000]"
                      : "bg-white text-gray-700 hover:bg-gray-100"
                  }`}
                  title="Stacked Single Column View"
                >
                  <Rows className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Stacked</span>
                </button>
              </div>
            </div>

            <div
              className={
                paneLayoutMode === "side_by_side"
                  ? "grid grid-cols-2 gap-3 md:gap-6 w-full min-w-0"
                  : "grid grid-cols-1 gap-4 w-full"
              }
            >
              <div className="min-w-0">
                <DirectoryPane
                  paneType="source"
                  user={sourceUser || user}
                  setUser={setSourceUser}
                  selectedFolder={sourceFolder}
                  onSelectFolder={(folder) => setSourceFolder(folder)}
                  onClearSelection={() => setSourceFolder(null)}
                />
              </div>

              <div className="min-w-0">
                <DirectoryPane
                  paneType="target"
                  user={targetUser || user}
                  setUser={setTargetUser}
                  selectedFolder={targetFolder}
                  onSelectFolder={(folder) => setTargetFolder(folder)}
                  onClearSelection={() => setTargetFolder(null)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Active Job Dashboard */}
        {activeTab === "active_jobs" && (
          <ActiveJobDashboard
            job={activeJob}
            onJobAction={handleJobAction}
          />
        )}

        {/* Tab 3: Job History Table */}
        {activeTab === "history" && (
          <JobHistoryTable
            historyJobs={jobHistory}
            onSelectJobForView={(job) => {
              setActiveJob(job);
              setActiveTab("active_jobs");
            }}
            onClearHistory={() => setJobHistory([])}
          />
        )}

        {/* Tab 4: Storage Analyzer Lead Magnet */}
        {activeTab === "analyzer" && (
          <StorageAnalyzer
            user={user}
            onSelectForTransfer={(folder) => {
              setSourceFolder(folder);
              setActiveTab("explorer");
            }}
            onSwitchToExplorer={() => setActiveTab("explorer")}
          />
        )}

        {/* Tab 5: SEO & Migration Guides Hub */}
        {activeTab === "guides" && (
          <MigrationGuides
            onSelectPresetScenario={(preset) => {
              setSourceFolder({
                locationType: "google_drive",
                folderId: "root",
                folderName: preset.sourceName,
                folderPath: [{ id: "root", name: preset.sourceName }],
                totalFiles: 1,
                totalFolders: 1,
                totalSizeBytes: 10 * 1024 * 1024 * 1024,
                accountLabel: preset.sourceName,
              });
              setTargetFolder({
                locationType: "google_drive",
                folderId: "root",
                folderName: preset.targetName,
                folderPath: [{ id: "root", name: preset.targetName }],
                totalFiles: 0,
                totalFolders: 0,
                totalSizeBytes: 0,
                accountLabel: preset.targetName,
              });
              setActiveTab("explorer");
              setIsConfigModalOpen(true);
            }}
            onSwitchToExplorer={() => setActiveTab("explorer")}
          />
        )}

        {/* Tab 6: Complete Feature Specifications & Documentation */}
        {activeTab === "docs" && <DocumentationViewer />}
      </main>

      {/* Floating Background Copy Status Bar */}
      {activeJob && (activeJob.status === "in_progress" || activeJob.status === "paused") && activeTab !== "active_jobs" && (
        <div className="fixed bottom-6 right-6 z-40 bg-[#FFE66D] border-4 border-black rounded-3xl p-4 shadow-[8px_8px_0px_0px_#000] flex items-center gap-4 animate-in slide-in-from-bottom-5 duration-300 max-w-md">
          <div className="w-10 h-10 rounded-2xl bg-black text-[#FFE66D] flex items-center justify-center shrink-0 border-2 border-black shadow-[2px_2px_0px_0px_#4ECDC4]">
            <FolderSync className="w-5 h-5 animate-spin-slow stroke-[2.5]" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-black uppercase tracking-wider">
                Silent Copying...
              </span>
              <span className="px-2 py-0.5 rounded-full bg-black text-white text-[10px] font-black">
                {activeJob.progressPercentage}%
              </span>
            </div>
            <div className="text-xs font-bold text-black truncate mt-0.5">
              {activeJob.currentFile || `${activeJob.filesCopied}/${activeJob.filesTotal} items copied`}
            </div>
          </div>

          <button
            onClick={() => setActiveTab("active_jobs")}
            className="px-3 py-2 rounded-xl bg-black text-white hover:bg-gray-800 text-xs font-black border-2 border-black shadow-[2px_2px_0px_0px_#000] cursor-pointer shrink-0"
          >
            View Job
          </button>
        </div>
      )}

      {/* Copy Options Modal */}
      {sourceFolder && targetFolder && (
        <CopyConfigModal
          sourceFolder={sourceFolder}
          targetFolder={targetFolder}
          isOpen={isConfigModalOpen}
          onClose={() => setIsConfigModalOpen(false)}
          onStartCopy={handleStartCopyJob}
        />
      )}
    </div>
  );
}
