import React, { useState } from "react";
import {
  BookOpen,
  ArrowRight,
  FolderSync,
  CheckCircle2,
  Sparkles,
  School,
  Cloud,
  HardDrive,
  ShieldCheck,
  Search,
  ExternalLink,
  Calculator,
  ChevronRight,
  Zap,
} from "lucide-react";
import { SelectedFolderState } from "../types";

interface MigrationGuidesProps {
  onSelectPresetScenario?: (preset: {
    sourceName: string;
    targetName: string;
    description: string;
  }) => void;
  onSwitchToExplorer?: () => void;
}

interface SEOGuideItem {
  id: string;
  keywordTitle: string;
  searchVolumeBadge: string;
  targetAudience: string;
  sourceType: string;
  targetType: string;
  summary: string;
  steps: string[];
  recommendedPreset: {
    sourceName: string;
    targetName: string;
    description: string;
  };
}

export const MigrationGuides: React.FC<MigrationGuidesProps> = ({
  onSelectPresetScenario,
  onSwitchToExplorer,
}) => {
  const [selectedGuideId, setSelectedGuideId] = useState<string>("school_to_onedrive");
  const [estimatedGB, setEstimatedGB] = useState<number>(45);

  const guides: SEOGuideItem[] = [
    {
      id: "school_to_onedrive",
      keywordTitle: "How to Move School Google Drive (.edu) to Personal OneDrive",
      searchVolumeBadge: "🔥 Top Search Solution",
      targetAudience: "Graduating Students, Alumni & Faculty",
      sourceType: "School Google Drive (.edu)",
      targetType: "Personal Microsoft OneDrive",
      summary:
        "When graduating, university IT departments permanently delete school Google Drive accounts (.edu). Shift Copy Studio allows direct cloud-to-cloud migration of all assignments, research papers, and photos directly to your personal Microsoft OneDrive without downloading files to your computer.",
      steps: [
        "Connect your School Google Drive account as the Source in Shift Copy Studio.",
        "Authorize your Personal Microsoft OneDrive or Google Account as the Target.",
        "Select your main 'Graduation Archive' or 'Schoolwork' root folder.",
        "Enable 'Background Token Auto-Refresh' to keep multi-hour transfers running continuously.",
        "Click Start Transfer — Shift Copy Studio handles nested subfolders natively.",
      ],
      recommendedPreset: {
        sourceName: "School Google Drive (.edu)",
        targetName: "Personal OneDrive / Google Drive",
        description: "School graduation migration preset: Transfers research, assignments, and media.",
      },
    },
    {
      id: "photos_to_onedrive",
      keywordTitle: "Transfer Google Photos & Heavy Media Vaults to OneDrive Without Downloading",
      searchVolumeBadge: "📸 High Intent Search",
      targetAudience: "Photographers, Content Creators & Power Users",
      sourceType: "Google Photos / Drive Media",
      targetType: "Personal / Family OneDrive",
      summary:
        "Downloading 100GB+ of high-resolution 4K video footage or photo albums using Google Takeout produces tedious zipped files. Shift Copy Studio streams your raw photos and video archives directly into OneDrive in high-speed background streams.",
      steps: [
        "Select your 'Google Photos' or 'Raw Media' folder in the Source Explorer.",
        "Target your OneDrive or secondary storage vault.",
        "Configure Duplicate Handling options (Overwrite or Auto-Rename).",
        "Monitor transfer progress in real-time with file progress indicators.",
      ],
      recommendedPreset: {
        sourceName: "Google Photos / Raw Media Vault",
        targetName: "Personal OneDrive Storage",
        description: "Photos & 4K Video migration preset: Preserves metadata and folder structures.",
      },
    },
    {
      id: "workspace_to_personal",
      keywordTitle: "Migrate Work Google Workspace Drive to Personal Gmail Drive",
      searchVolumeBadge: "💼 Enterprise Transition",
      targetAudience: "Contractors, Job Changers & Workspace Users",
      sourceType: "Company Google Workspace Drive",
      targetType: "Personal Gmail Google Drive",
      summary:
        "Seamlessly copy your personal project files, templates, and portfolios from an old work Google Workspace account to your personal Gmail Google Drive before company offboarding.",
      steps: [
        "Authenticate both Work Drive and Personal Gmail Drive.",
        "Select non-confidential project portfolios and custom templates.",
        "Run the background migration engine.",
      ],
      recommendedPreset: {
        sourceName: "Work Google Workspace Drive",
        targetName: "Personal Gmail Google Drive",
        description: "Workspace to Personal migration preset.",
      },
    },
  ];

  const activeGuide = guides.find((g) => g.id === selectedGuideId) || guides[0];

  // Transfer time estimator math
  const estimatedHours = (estimatedGB * 0.12).toFixed(1); // Avg ~8-10 GB/hour cloud stream
  const cloudStorageSavings = (estimatedGB * 0.15).toFixed(2); // Local disk space saved

  const handleApplyPreset = (guide: SEOGuideItem) => {
    if (onSelectPresetScenario) {
      onSelectPresetScenario(guide.recommendedPreset);
    }
    if (onSwitchToExplorer) {
      onSwitchToExplorer();
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-white border-4 border-black rounded-[36px] p-6 shadow-[8px_8px_0px_0px_#4ECDC4] relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 bg-[#FFE66D] text-black px-3 py-1 rounded-full text-xs font-black border-2 border-black shadow-[2px_2px_0px_0px_#000]">
              <BookOpen className="w-3.5 h-3.5 stroke-[3]" /> MIGRATION GUIDES & SEO HUB
            </div>
            <h1 className="text-3xl font-black text-black italic tracking-tight">
              Step-by-Step Drive & Cloud Transfer Guides
            </h1>
            <p className="text-sm font-bold text-gray-700 max-w-xl">
              Solutions for common cloud migration challenges — graduation account offboarding, Google Photos transfers, and Workspace transitions.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="px-3 py-1.5 bg-[#FF6B6B] text-white font-black text-xs rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_#000]">
              Instant Preset Launchers
            </span>
          </div>
        </div>
      </div>

      {/* Grid Layout: Left Guide List, Right Guide Content & Calculator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Select Guide */}
        <div className="lg:col-span-4 space-y-3">
          <h3 className="text-xs font-black uppercase tracking-wider text-gray-500 px-1">
            Featured Migration Scenarios
          </h3>
          {guides.map((guide) => (
            <button
              key={guide.id}
              onClick={() => setSelectedGuideId(guide.id)}
              className={`w-full text-left p-4 rounded-3xl border-3 border-black transition-all cursor-pointer space-y-2 ${
                selectedGuideId === guide.id
                  ? "bg-[#FFE66D] shadow-[6px_6px_0px_0px_#000] translate-y-[-2px]"
                  : "bg-white hover:bg-slate-50 shadow-[3px_3px_0px_0px_#000]"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-white border border-black text-black">
                  {guide.searchVolumeBadge}
                </span>
                <ChevronRight className="w-4 h-4 stroke-[3] text-black" />
              </div>
              <h4 className="text-sm font-black text-black leading-snug">
                {guide.keywordTitle}
              </h4>
              <p className="text-[11px] font-bold text-gray-600">
                {guide.sourceType} → {guide.targetType}
              </p>
            </button>
          ))}

          {/* Interactive Migration Time Calculator Box */}
          <div className="bg-white border-3 border-black rounded-3xl p-5 shadow-[4px_4px_0px_0px_#000] space-y-4">
            <div className="flex items-center gap-2 border-b-2 border-black pb-2">
              <Calculator className="w-5 h-5 text-[#FF6B6B]" />
              <h4 className="text-sm font-black text-black">Transfer Speed Estimator</h4>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-black flex justify-between">
                <span>Data Volume to Transfer:</span>
                <span className="text-[#FF6B6B] font-black">{estimatedGB} GB</span>
              </label>
              <input
                type="range"
                min="5"
                max="250"
                value={estimatedGB}
                onChange={(e) => setEstimatedGB(Number(e.target.value))}
                className="w-full accent-[#4ECDC4] cursor-pointer"
              />
            </div>

            <div className="bg-[#FFF9F5] p-3 rounded-2xl border-2 border-black space-y-1.5 text-xs font-bold">
              <div className="flex justify-between">
                <span className="text-gray-600">Estimated Cloud Stream Time:</span>
                <span className="text-black font-black">~{estimatedHours} hours</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Computer Disk Storage Saved:</span>
                <span className="text-emerald-600 font-black">{estimatedGB} GB Free</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Selected Guide Content */}
        <div className="lg:col-span-8 bg-white border-4 border-black rounded-[36px] p-6 shadow-[8px_8px_0px_0px_#000] space-y-6">
          {/* Guide Title Header */}
          <div className="border-b-2 border-black pb-4 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 bg-[#4ECDC4] text-black font-black text-xs rounded-xl border border-black shadow-[2px_2px_0px_0px_#000]">
                {activeGuide.targetAudience}
              </span>
              <span className="px-3 py-1 bg-[#FF6B6B] text-white font-black text-xs rounded-xl border border-black shadow-[2px_2px_0px_0px_#000]">
                Direct Cloud Stream
              </span>
            </div>

            <h2 className="text-2xl font-black text-black tracking-tight">
              {activeGuide.keywordTitle}
            </h2>

            <p className="text-sm font-bold text-gray-700 leading-relaxed bg-slate-50 p-4 rounded-2xl border-2 border-black">
              {activeGuide.summary}
            </p>
          </div>

          {/* Migration Path Indicator */}
          <div className="bg-[#FFF9F5] p-4 rounded-2xl border-2 border-black flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left">
              <span className="text-[10px] font-black text-gray-500 uppercase">From Source:</span>
              <div className="text-sm font-black text-black">{activeGuide.sourceType}</div>
            </div>

            <div className="w-10 h-10 rounded-full bg-[#FFE66D] border-2 border-black flex items-center justify-center shrink-0 shadow-[2px_2px_0px_0px_#000]">
              <ArrowRight className="w-5 h-5 text-black stroke-[3]" />
            </div>

            <div className="text-center sm:text-right">
              <span className="text-[10px] font-black text-gray-500 uppercase">To Destination:</span>
              <div className="text-sm font-black text-black">{activeGuide.targetType}</div>
            </div>
          </div>

          {/* Action Step Checklist */}
          <div className="space-y-3">
            <h3 className="text-base font-black text-black italic">How to Execute This Migration:</h3>
            <div className="space-y-2">
              {activeGuide.steps.map((step, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 bg-slate-50 p-3 rounded-2xl border-2 border-black"
                >
                  <div className="w-6 h-6 rounded-full bg-[#FFE66D] border-2 border-black flex items-center justify-center font-black text-xs shrink-0 mt-0.5">
                    {idx + 1}
                  </div>
                  <p className="text-xs font-bold text-black pt-1">{step}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 1-Click Launch Preset CTA Button */}
          <div className="pt-2">
            <button
              onClick={() => handleApplyPreset(activeGuide)}
              className="w-full py-4 bg-[#FFE66D] hover:bg-[#ffd633] text-black font-black text-sm rounded-2xl border-3 border-black shadow-[6px_6px_0px_0px_#000] transition-all cursor-pointer flex items-center justify-center gap-3 active:translate-y-1"
            >
              <FolderSync className="w-5 h-5 stroke-[3]" />
              <span>Launch "{activeGuide.recommendedPreset.sourceName}" Migration Preset Now</span>
              <ArrowRight className="w-5 h-5 stroke-[3]" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
