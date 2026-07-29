import React, { useState } from "react";
import {
  LayoutDashboard,
  TrendingUp,
  FileSearch,
  MessageSquareCode,
  Trash2,
  Search,
  Sparkles,
  ExternalLink,
  Award,
  AlertTriangle,
  Calendar,
} from "lucide-react";
import { AnalysisResult } from "../types";

interface DashboardProps {
  history: AnalysisResult[];
  onSelectAnalysis: (result: AnalysisResult) => void;
  onStartInterview: (jobTitle: string, companyName?: string) => void;
  onDeleteAnalysis: (id: string) => void;
  onClearHistory: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  history,
  onSelectAnalysis,
  onStartInterview,
  onDeleteAnalysis,
  onClearHistory,
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredHistory = history.filter(
    (item) =>
      item.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.companyName && item.companyName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Compute analytics
  const totalScans = history.length;
  const avgScore =
    totalScans > 0
      ? Math.round(history.reduce((sum, item) => sum + item.atsScore, 0) / totalScans)
      : 0;

  // Most common missing skills frequency
  const missingSkillsMap: Record<string, number> = {};
  history.forEach((item) => {
    item.missingCriticalSkills?.forEach((skill) => {
      missingSkillsMap[skill] = (missingSkillsMap[skill] || 0) + 1;
    });
  });

  const topMissingSkills = Object.entries(missingSkillsMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <LayoutDashboard className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-white">Career Intelligence Dashboard</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Track past ATS scan scores, identify recurring skill gaps across applications, and manage saved analyses.
          </p>
        </div>

        {history.length > 0 && (
          <button
            onClick={() => {
              if (confirm("Are you sure you want to clear all analysis history?")) {
                onClearHistory();
              }
            }}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-rose-400 border border-slate-700 text-xs transition-all self-start sm:self-auto"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear History</span>
          </button>
        )}
      </div>

      {/* Analytics Cards Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Scans */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
            <FileSearch className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-semibold block uppercase tracking-wider">
              Total ATS Scans
            </span>
            <span className="text-2xl font-black text-white">{totalScans}</span>
          </div>
        </div>

        {/* Avg Score */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-semibold block uppercase tracking-wider">
              Average ATS Match
            </span>
            <span className="text-2xl font-black text-indigo-400">{avgScore} / 100</span>
          </div>
        </div>

        {/* Top Missing Skill Trend */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="overflow-hidden">
            <span className="text-xs text-slate-400 font-semibold block uppercase tracking-wider">
              Top Recurring Gap
            </span>
            <span className="text-sm font-bold text-rose-300 truncate block">
              {topMissingSkills[0] ? topMissingSkills[0][0] : "None detected"}
            </span>
          </div>
        </div>
      </div>

      {/* Top Recurring Skill Gaps Pill Section */}
      {topMissingSkills.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-2">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
            <TrendingUp className="w-4 h-4 text-rose-400" />
            <span>Most Frequent Missing Skill Keywords Across Your Job Applications</span>
          </h3>
          <div className="flex flex-wrap gap-2 pt-1">
            {topMissingSkills.map(([skill, count], idx) => (
              <span
                key={idx}
                className="text-xs font-medium px-3 py-1.5 rounded-xl bg-rose-500/10 text-rose-300 border border-rose-500/20 flex items-center space-x-2"
              >
                <span>{skill}</span>
                <span className="bg-rose-500/20 px-1.5 py-0.2 rounded-md text-[10px] font-bold text-rose-400">
                  {count} {count === 1 ? "job" : "jobs"}
                </span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* History Table & Search Filter */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <h3 className="text-base font-bold text-white">Saved Resume vs JD Analyses</h3>

          {/* Search Bar */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by job title or company..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {filteredHistory.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs space-y-2">
            <FileSearch className="w-8 h-8 mx-auto text-slate-600" />
            <p>
              {history.length === 0
                ? "No analyses saved yet. Go to 'ATS Analysis' to compare a resume and job description!"
                : "No matching records found for search term."}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredHistory.map((item) => (
              <div
                key={item.id}
                className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 hover:border-slate-700 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                {/* Left: Job & Date */}
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-white text-sm">{item.jobTitle}</span>
                    {item.companyName && (
                      <span className="text-xs text-slate-400 font-normal">@ {item.companyName}</span>
                    )}
                  </div>

                  <div className="flex items-center space-x-3 text-xs text-slate-500">
                    <span className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3 text-slate-500" />
                      <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                    </span>

                    <span>• {item.matchedSkills?.length || 0} skills matched</span>
                  </div>
                </div>

                {/* Center: ATS Score Badge */}
                <div className="flex items-center space-x-3">
                  <div
                    className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center space-x-1.5 ${
                      item.atsScore >= 80
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        : item.atsScore >= 60
                        ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                        : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                    }`}
                  >
                    <span>ATS Score:</span>
                    <span className="text-sm font-black">{item.atsScore}/100</span>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onSelectAnalysis(item)}
                    className="flex items-center space-x-1 text-xs font-semibold px-3 py-1.5 rounded-lg bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600/30 border border-indigo-500/30 transition-all"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>View Analysis</span>
                  </button>

                  <button
                    onClick={() => onStartInterview(item.jobTitle, item.companyName)}
                    className="flex items-center space-x-1 text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition-all"
                    title="Mock Interview for this role"
                  >
                    <MessageSquareCode className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Interview</span>
                  </button>

                  <button
                    onClick={() => onDeleteAnalysis(item.id)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-all ml-1"
                    title="Delete record"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
