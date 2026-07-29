import React, { useEffect, useState } from "react";
import { Sparkles, MessageSquareCode, LayoutDashboard, FileSearch, CheckCircle2, AlertCircle, Globe } from "lucide-react";
import { checkHealth } from "../services/apiClient";

interface NavbarProps {
  activeTab: "analyze" | "interview" | "dashboard";
  setActiveTab: (tab: "analyze" | "interview" | "dashboard") => void;
  savedCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, savedCount = 0 }) => {
  const [apiState, setApiState] = useState<{ online: boolean; mode: "server" | "static" } | null>(null);

  useEffect(() => {
    checkHealth().then((res) => setApiState(res));
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <div 
          className="flex items-center space-x-3 cursor-pointer group"
          onClick={() => setActiveTab("analyze")}
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-500 to-cyan-400 p-0.5 shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/40 transition-all">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-cyan-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                CareerLens
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                AI 3.6
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">ATS Optimizer & Interview Intelligence</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center space-x-1 sm:space-x-2 bg-slate-950/60 p-1 rounded-xl border border-slate-800/80">
          <button
            onClick={() => setActiveTab("analyze")}
            className={`flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === "analyze"
                ? "bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-md shadow-indigo-600/30"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            <FileSearch className="w-4 h-4" />
            <span className="hidden xs:inline">ATS Analysis</span>
          </button>

          <button
            onClick={() => setActiveTab("interview")}
            className={`flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === "interview"
                ? "bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-md shadow-indigo-600/30"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            <MessageSquareCode className="w-4 h-4" />
            <span className="hidden xs:inline">Mock Interview</span>
          </button>

          <button
            onClick={() => setActiveTab("dashboard")}
            className={`flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-all relative ${
              activeTab === "dashboard"
                ? "bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-md shadow-indigo-600/30"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span className="hidden xs:inline">Dashboard</span>
            {savedCount > 0 && (
              <span className="ml-1 bg-indigo-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                {savedCount}
              </span>
            )}
          </button>
        </nav>

        {/* API Status */}
        <div className="hidden md:flex items-center space-x-2 text-xs">
          {apiState?.mode === "server" ? (
            <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Gemini Server Online</span>
            </div>
          ) : apiState?.mode === "static" ? (
            <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300">
              <Globe className="w-3.5 h-3.5" />
              <span>GitHub Pages (Client AI Active)</span>
            </div>
          ) : (
            <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-slate-800 text-slate-400">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span>Checking environment...</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
