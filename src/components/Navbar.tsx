import React from "react";
import { UserProfile } from "../types";
import { signInWithGoogle, signOutGoogle } from "../lib/firebase";
import { FolderSync, HardDrive, History, LogOut, CheckCircle2, ShieldAlert, Sparkles, Loader2, PieChart, BookOpen } from "lucide-react";

interface NavbarProps {
  user: UserProfile | null;
  setUser: React.Dispatch<React.SetStateAction<UserProfile | null>>;
  activeTab: "explorer" | "active_jobs" | "history" | "analyzer" | "guides";
  setActiveTab: (tab: "explorer" | "active_jobs" | "history" | "analyzer" | "guides") => void;
  activeJobCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  setUser,
  activeTab,
  setActiveTab,
  activeJobCount,
}) => {
  const [isAuthenticating, setIsAuthenticating] = React.useState(false);

  const handleSignIn = async () => {
    try {
      setIsAuthenticating(true);
      const profile = await signInWithGoogle();
      setUser(profile);
    } catch (err: any) {
      alert("Sign in failed: " + (err.message || "Unknown error"));
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleSignOut = async () => {
    await signOutGoogle();
    setUser(null);
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b-4 border-black text-black shadow-[0px_4px_0px_0px_#000]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-[#FF6B6B] rounded-2xl flex items-center justify-center shadow-[3px_3px_0px_0px_#000] border-2 border-black">
            <FolderSync className="w-6 h-6 text-white stroke-[3]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black tracking-tight text-black italic">
                SHIFT <span className="text-sm not-italic font-bold bg-[#FFE66D] px-2 py-0.5 rounded-md border border-black shadow-[2px_2px_0px_0px_#000]">COPY STUDIO</span>
              </h1>
            </div>
            <p className="text-xs font-bold text-gray-600">High-speed Drive & Cloud folder migration</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-2">
          <button
            onClick={() => setActiveTab("explorer")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-black transition-all border-2 border-black cursor-pointer ${
              activeTab === "explorer"
                ? "bg-[#FFE66D] text-black shadow-[4px_4px_0px_0px_#000] translate-y-[-2px]"
                : "bg-white text-black shadow-[2px_2px_0px_0px_#000] hover:bg-slate-100"
            }`}
          >
            <HardDrive className="w-4 h-4 stroke-[2.5]" />
            <span>Explorer</span>
          </button>

          <button
            onClick={() => setActiveTab("active_jobs")}
            className={`relative flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-black transition-all border-2 border-black cursor-pointer ${
              activeTab === "active_jobs"
                ? "bg-[#4ECDC4] text-black shadow-[4px_4px_0px_0px_#000] translate-y-[-2px]"
                : "bg-white text-black shadow-[2px_2px_0px_0px_#000] hover:bg-slate-100"
            }`}
          >
            <FolderSync className={`w-4 h-4 stroke-[2.5] ${activeJobCount > 0 ? "animate-spin" : ""}`} />
            <span>Transfers</span>
            {activeJobCount > 0 && (
              <span className="px-2 py-0.5 text-[10px] font-black rounded-full bg-[#FF6B6B] text-white border border-black shadow-[1px_1px_0px_0px_#000]">
                {activeJobCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("history")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-black transition-all border-2 border-black cursor-pointer ${
              activeTab === "history"
                ? "bg-[#FF6B6B] text-white shadow-[4px_4px_0px_0px_#000] translate-y-[-2px]"
                : "bg-white text-black shadow-[2px_2px_0px_0px_#000] hover:bg-slate-100"
            }`}
          >
            <History className="w-4 h-4 stroke-[2.5]" />
            <span>History</span>
          </button>

          <button
            onClick={() => setActiveTab("analyzer")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-black transition-all border-2 border-black cursor-pointer ${
              activeTab === "analyzer"
                ? "bg-[#A29BFE] text-black shadow-[4px_4px_0px_0px_#000] translate-y-[-2px]"
                : "bg-white text-black shadow-[2px_2px_0px_0px_#000] hover:bg-slate-100"
            }`}
          >
            <PieChart className="w-4 h-4 stroke-[2.5]" />
            <span>Storage Analyzer</span>
          </button>

          <button
            onClick={() => setActiveTab("guides")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-black transition-all border-2 border-black cursor-pointer ${
              activeTab === "guides"
                ? "bg-[#FFE66D] text-black shadow-[4px_4px_0px_0px_#000] translate-y-[-2px]"
                : "bg-white text-black shadow-[2px_2px_0px_0px_#000] hover:bg-slate-100"
            }`}
          >
            <BookOpen className="w-4 h-4 stroke-[2.5]" />
            <span>SEO Guides</span>
          </button>
        </nav>

        {/* User Auth Section */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3 bg-white px-3.5 py-1.5 rounded-2xl border-2 border-black shadow-[3px_3px_0px_0px_#000]">
              <div className="flex items-center gap-2">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || "User"}
                    className="w-8 h-8 rounded-full border-2 border-black"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-[#FF6B6B] text-white border-2 border-black flex items-center justify-center font-black text-xs">
                    {(user.displayName || user.email || "U")[0].toUpperCase()}
                  </div>
                )}
                <div className="hidden lg:block text-left">
                  <div className="text-xs font-black text-black truncate max-w-[120px]">
                    {user.displayName || "Google User"}
                  </div>
                  <div className="text-[10px] text-[#4ECDC4] font-black flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 stroke-[3]" /> Drive Active
                  </div>
                </div>
              </div>
              <button
                onClick={async () => {
                  try {
                    setIsAuthenticating(true);
                    const profile = await signInWithGoogle(true);
                    setUser(profile);
                  } catch (err: any) {
                    alert("Switch account failed: " + (err.message || "Unknown error"));
                  } finally {
                    setIsAuthenticating(false);
                  }
                }}
                title="Switch Google Account (Prompt Account Picker)"
                className="px-2 py-1 bg-[#FFE66D] text-black hover:bg-[#ffd633] text-[10px] font-black rounded-xl border-2 border-black transition-all cursor-pointer flex items-center gap-1 shadow-[1px_1px_0px_0px_#000]"
              >
                <span>Switch</span>
              </button>
              <button
                onClick={handleSignOut}
                title="Sign out of Google"
                className="p-1.5 text-black hover:bg-[#FF6B6B] hover:text-white rounded-xl border-2 border-black transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleSignIn}
              disabled={isAuthenticating}
              className="flex items-center gap-2 bg-[#FFE66D] text-black hover:bg-[#ffd633] px-5 py-2.5 rounded-2xl text-xs font-black border-2 border-black shadow-[4px_4px_0px_0px_#000] hover:translate-y-[-1px] transition-all cursor-pointer disabled:opacity-60"
            >
              {isAuthenticating ? (
                <Loader2 className="w-4 h-4 text-black animate-spin" />
              ) : (
                <svg className="w-4 h-4" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                </svg>
              )}
              <span>{isAuthenticating ? "Connecting..." : "Sign in with Google"}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
