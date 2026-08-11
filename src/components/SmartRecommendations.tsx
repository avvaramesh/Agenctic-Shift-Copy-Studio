import React, { useState } from "react";
import {
  Sparkles,
  Trash2,
  FolderSync,
  FileArchive,
  ArrowRight,
  CheckCircle2,
  Zap,
  HardDrive,
  ShieldAlert,
  Loader2,
  Layers,
  ChevronRight,
} from "lucide-react";

interface RecommendationCard {
  id: string;
  title: string;
  subtitle: string;
  impactBadge: string;
  reclaimedGB: number;
  badgeColor: string;
  btnBg: string;
  actionType: "delete_duplicates" | "compress_media" | "migrate_coursework" | "purge_cache";
  details: string[];
}

interface SmartRecommendationsProps {
  onExecuteRecommendation?: (actionType: string) => void;
  onSwitchToExplorer?: () => void;
}

export const SmartRecommendations: React.FC<SmartRecommendationsProps> = ({
  onExecuteRecommendation,
  onSwitchToExplorer,
}) => {
  const [executingCardId, setExecutingCardId] = useState<string | null>(null);
  const [completedCardIds, setCompletedCardIds] = useState<Set<string>>(new Set());

  const recommendations: RecommendationCard[] = [
    {
      id: "rec_dup",
      title: "Purge 4.2 GB of Exact Cross-Drive Duplicate Files",
      subtitle: "MD5 / SHA-256 matches verified across Google Drive and OneDrive",
      impactBadge: "⚡ Instant 4.2 GB Free Space",
      reclaimedGB: 4.2,
      badgeColor: "#FF6B6B",
      btnBg: "#FF6B6B",
      actionType: "delete_duplicates",
      details: [
        "Eliminates 14 identical zip archives & dataset copies",
        "Zero-download cryptographic hash validation",
        "Saves 4.2 GB of Google Drive cloud storage",
      ],
    },
    {
      id: "rec_coursework",
      title: "Migrate 30 GB of Old Coursework & Thesis Files to OneDrive Cold Storage",
      subtitle: "High entropy files untouched for over 2 years",
      impactBadge: "🎓 Graduation Offboarding Ready",
      reclaimedGB: 30.0,
      badgeColor: "#FFE66D",
      btnBg: "#FFE66D",
      actionType: "migrate_coursework",
      details: [
        "Transfers 142 research PDFs and lab datasets",
        "Preserves nested directory structures in OneDrive",
        "Frees up primary Google Drive quota",
      ],
    },
    {
      id: "rec_compress",
      title: "Compress 12 GB of Raw 4K Video Archives & Media",
      subtitle: "High-volume raw video footage from campus projects",
      impactBadge: "📦 50% Compression Ratio",
      reclaimedGB: 6.0,
      badgeColor: "#4ECDC4",
      btnBg: "#4ECDC4",
      actionType: "compress_media",
      details: [
        "Consolidates loose raw footage into streamable 7z/tar.gz vaults",
        "Reduces total space by an estimated 6 GB",
        "Accelerates future cloud transfer speeds",
      ],
    },
    {
      id: "rec_cache",
      title: "Purge 850 MB of Temporary Cache & Junk (.DS_Store, node_modules)",
      subtitle: "Hidden system noise and abandoned build artifacts",
      impactBadge: "🧹 Clean Metadata & Slots",
      reclaimedGB: 0.85,
      badgeColor: "#A29BFE",
      btnBg: "#A29BFE",
      actionType: "purge_cache",
      details: [
        "Removes 142 .DS_Store & Thumbs.db files",
        "Cleans abandoned node_modules & tmp folders",
        "Instantly sharpens indexing performance",
      ],
    },
  ];

  const handleExecute = (card: RecommendationCard) => {
    setExecutingCardId(card.id);
    setTimeout(() => {
      setExecutingCardId(null);
      setCompletedCardIds((prev) => new Set(prev).add(card.id));
      if (onExecuteRecommendation) {
        onExecuteRecommendation(card.actionType);
      }
      if (card.actionType === "migrate_coursework" && onSwitchToExplorer) {
        onSwitchToExplorer();
      }
    }, 1200);
  };

  return (
    <div className="bg-white border-4 border-black rounded-[36px] p-6 shadow-[8px_8px_0px_0px_#FFE66D] space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b-2 border-black pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 bg-[#FFE66D] text-black px-3 py-1 rounded-full text-xs font-black border-2 border-black shadow-[2px_2px_0px_0px_#000] mb-2">
            <Sparkles className="w-3.5 h-3.5 stroke-[3]" /> 1-CLICK AI & STATISTICAL STORAGE ACTIONS
          </div>
          <h3 className="text-2xl font-black text-black italic">
            Smart Clean & Transfer Recommendations
          </h3>
          <p className="text-xs font-bold text-gray-700 max-w-xl">
            Execute high-impact 1-click cleanups derived from our Go, Rust, and Python storage analysis engines.
          </p>
        </div>

        <div className="bg-slate-100 p-3 rounded-2xl border-2 border-black font-black text-xs text-black shadow-[2px_2px_0px_0px_#000]">
          Total Reclaimable: <span className="text-[#FF6B6B] text-sm">41.05 GB</span>
        </div>
      </div>

      {/* Recommendation Action Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {recommendations.map((card) => {
          const isDone = completedCardIds.has(card.id);
          const isRunning = executingCardId === card.id;

          return (
            <div
              key={card.id}
              className="bg-slate-50 p-6 rounded-[32px] border-4 border-black shadow-[6px_6px_0px_0px_#000] space-y-4 flex flex-col justify-between relative overflow-hidden"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span
                    style={{ backgroundColor: card.badgeColor }}
                    className="text-black font-black text-xs px-3 py-1 rounded-full border-2 border-black shadow-[2px_2px_0px_0px_#000]"
                  >
                    {card.impactBadge}
                  </span>

                  {isDone && (
                    <span className="bg-emerald-400 text-black font-black text-xs px-3 py-1 rounded-full border-2 border-black shadow-[2px_2px_0px_0px_#000] flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" /> Completed
                    </span>
                  )}
                </div>

                <h4 className="text-lg font-black text-black leading-snug">{card.title}</h4>
                <p className="text-xs font-bold text-gray-600">{card.subtitle}</p>

                {/* Details Checklist */}
                <div className="bg-white p-3 rounded-2xl border-2 border-black space-y-1.5 text-xs font-bold text-gray-700">
                  {card.details.map((detail, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-black shrink-0" />
                      <span>{detail}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => handleExecute(card)}
                  disabled={isRunning || isDone}
                  style={{
                    backgroundColor: isDone ? "#E2E8F0" : card.btnBg,
                  }}
                  className={`w-full py-3.5 font-black text-xs rounded-2xl border-2 border-black shadow-[3px_3px_0px_0px_#000] transition-all cursor-pointer flex items-center justify-center gap-2 active:translate-y-0.5 ${
                    isDone ? "text-gray-500 cursor-not-allowed" : "text-black hover:brightness-105"
                  }`}
                >
                  {isRunning ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-black" />
                      <span>Executing Action...</span>
                    </>
                  ) : isDone ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 stroke-[3]" />
                      <span>Action Complete ({card.reclaimedGB} GB Reclaimed)</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 stroke-[3]" />
                      <span>Execute 1-Click Action ({card.reclaimedGB} GB)</span>
                      <ChevronRight className="w-4 h-4 stroke-[3]" />
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
