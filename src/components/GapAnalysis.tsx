import React, { useState } from "react";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Copy,
  Check,
  Zap,
  Award,
  ArrowRight,
  Sparkles,
  FileText,
  Target,
  ListChecks,
  ListPlus,
  MessageSquareCode,
  TrendingUp,
} from "lucide-react";
import { AnalysisResult } from "../types";

interface GapAnalysisProps {
  result: AnalysisResult;
  onStartInterview: (jobTitle: string, companyName?: string, jobDescriptionText?: string) => void;
}

export const GapAnalysis: React.FC<GapAnalysisProps> = ({ result, onStartInterview }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "bulletRewrites" | "skillsGap" | "actionPlan">("overview");

  const handleCopyBullet = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Score color helper
  const getScoreColor = (score: number) => {
    if (score >= 80) return { text: "text-emerald-400", border: "border-emerald-500", bg: "bg-emerald-500/10", stroke: "#10b981" };
    if (score >= 60) return { text: "text-amber-400", border: "border-amber-500", bg: "bg-amber-500/10", stroke: "#f59e0b" };
    return { text: "text-rose-400", border: "border-rose-500", bg: "bg-rose-500/10", stroke: "#f43f5e" };
  };

  const scoreTheme = getScoreColor(result.atsScore);

  return (
    <div className="space-y-6">
      {/* Header Banner & ATS Score Gauge Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
        {/* Subtle glow background */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Circular ATS Score Meter */}
          <div className="lg:col-span-4 flex flex-col items-center justify-center p-4 bg-slate-950/80 rounded-2xl border border-slate-800/80">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              ATS Match Rating
            </p>

            <div className="relative w-36 h-36 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  className="stroke-slate-800"
                  strokeWidth="8"
                  fill="transparent"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  stroke={scoreTheme.stroke}
                  strokeWidth="8"
                  strokeDasharray={263.89}
                  strokeDashoffset={263.89 - (263.89 * result.atsScore) / 100}
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>

              <div className="absolute text-center">
                <span className={`text-4xl font-black ${scoreTheme.text}`}>
                  {result.atsScore}
                </span>
                <span className="text-sm font-semibold text-slate-400">/100</span>
              </div>
            </div>

            <div className={`mt-3 px-3 py-1 rounded-full text-xs font-bold ${scoreTheme.bg} ${scoreTheme.text} border ${scoreTheme.border}/30`}>
              {result.scoreCategory || (result.atsScore >= 80 ? "Strong Fit" : result.atsScore >= 60 ? "Moderate Fit" : "Needs Optimization")}
            </div>
          </div>

          {/* Job Overview & Summary */}
          <div className="lg:col-span-8 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div>
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <span>{result.jobTitle}</span>
                  {result.companyName && (
                    <span className="text-sm font-normal text-slate-400">@ {result.companyName}</span>
                  )}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Analyzed on {new Date(result.createdAt).toLocaleDateString()} with Gemini 3.6 Flash
                </p>
              </div>

              <button
                onClick={() => onStartInterview(result.jobTitle, result.companyName, result.jobSummary?.keyResponsibilities?.join("\n"))}
                className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 transition-all transform hover:-translate-y-0.5"
              >
                <MessageSquareCode className="w-4 h-4" />
                <span>Practice Mock Interview</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Match Reasoning */}
            <div>
              <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1 flex items-center space-x-1.5">
                <Target className="w-3.5 h-3.5 text-indigo-400" />
                <span>ATS Recruiter Match Reasoning</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
                {result.matchReasoning}
              </p>
            </div>

            {/* Quick Stat Pill Highlights */}
            <div className="grid grid-cols-3 gap-3 pt-1">
              <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800 text-center">
                <span className="block text-lg font-bold text-emerald-400">{result.matchedSkills?.length || 0}</span>
                <span className="text-[11px] text-slate-400">Matched Skills</span>
              </div>
              <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800 text-center">
                <span className="block text-lg font-bold text-rose-400">{result.missingCriticalSkills?.length || 0}</span>
                <span className="text-[11px] text-slate-400">Critical Skill Gaps</span>
              </div>
              <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800 text-center">
                <span className="block text-lg font-bold text-indigo-400">{result.bulletPointRewrites?.length || 0}</span>
                <span className="text-[11px] text-slate-400">Bullet Rewrites</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Internal Navigation Sub-Tabs */}
      <div className="flex border-b border-slate-800 overflow-x-auto space-x-2 text-xs font-semibold pb-1">
        <button
          onClick={() => setActiveTab("overview")}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl transition-all ${
            activeTab === "overview"
              ? "bg-indigo-600 text-white shadow"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Skills Breakdown</span>
        </button>

        <button
          onClick={() => setActiveTab("bulletRewrites")}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl transition-all ${
            activeTab === "bulletRewrites"
              ? "bg-indigo-600 text-white shadow"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>Quantified Bullet Rewrites ({result.bulletPointRewrites?.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab("skillsGap")}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl transition-all ${
            activeTab === "skillsGap"
              ? "bg-indigo-600 text-white shadow"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
          }`}
        >
          <ListPlus className="w-4 h-4" />
          <span>Extracted Resume & Job Comparison</span>
        </button>

        <button
          onClick={() => setActiveTab("actionPlan")}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl transition-all ${
            activeTab === "actionPlan"
              ? "bg-indigo-600 text-white shadow"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Optimization Plan</span>
        </button>
      </div>

      {/* Tab 1: Matched vs Missing Skills */}
      {(activeTab === "overview" || activeTab === "skillsGap") && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Matched Skills */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-white text-sm">Matched Qualifications & Skills</h3>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {result.matchedSkills?.length || 0} Found
              </span>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              {result.matchedSkills && result.matchedSkills.length > 0 ? (
                result.matchedSkills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center space-x-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
                  >
                    <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                    <span>{skill}</span>
                  </span>
                ))
              ) : (
                <p className="text-xs text-slate-500 italic">No direct skill matches detected in the initial scan.</p>
              )}
            </div>
          </div>

          {/* Missing Critical & Secondary Skills */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
                  <XCircle className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-white text-sm">Missing / Weak Skill Gaps</h3>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
                {(result.missingCriticalSkills?.length || 0) + (result.missingSecondarySkills?.length || 0)} Missing
              </span>
            </div>

            {/* Critical Skills */}
            <div>
              <p className="text-[11px] font-semibold text-rose-400 uppercase tracking-wider mb-2 flex items-center space-x-1">
                <AlertTriangle className="w-3 h-3" />
                <span>High Priority Requirements (Missing)</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {result.missingCriticalSkills && result.missingCriticalSkills.length > 0 ? (
                  result.missingCriticalSkills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center space-x-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-rose-500/10 text-rose-300 border border-rose-500/20"
                    >
                      <XCircle className="w-3 h-3 text-rose-400 shrink-0" />
                      <span>{skill}</span>
                    </span>
                  ))
                ) : (
                  <p className="text-xs text-slate-500 italic">No critical skill gaps identified!</p>
                )}
              </div>
            </div>

            {/* Secondary Skills */}
            {result.missingSecondarySkills && result.missingSecondarySkills.length > 0 && (
              <div>
                <p className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider mb-2">
                  Secondary / Preferred Skills
                </p>
                <div className="flex flex-wrap gap-2">
                  {result.missingSecondarySkills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center space-x-1 text-xs font-medium px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/20"
                    >
                      <span>• {skill}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Specific Quantified Bullet Point Rewrites */}
      {(activeTab === "overview" || activeTab === "bulletRewrites") && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <Zap className="w-5 h-5 text-amber-400" />
                <span>Quantified Resume Bullet Point Rewrites</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Gemini rewrote your resume points to include high-impact metrics and required job keywords.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {result.bulletPointRewrites && result.bulletPointRewrites.length > 0 ? (
              result.bulletPointRewrites.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-slate-950 rounded-xl p-4 border border-slate-800 hover:border-slate-700 transition-all space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      Suggestion #{idx + 1}
                    </span>
                    <span className="text-[11px] text-amber-400 font-medium flex items-center space-x-1">
                      <Sparkles className="w-3 h-3" />
                      <span>Impact: {item.impactMetrics}</span>
                    </span>
                  </div>

                  {/* Before & After comparison */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    {/* Original */}
                    <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800/80">
                      <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                        Before (Weak / Original):
                      </span>
                      <p className="text-slate-400 italic">"{item.original}"</p>
                    </div>

                    {/* Improved */}
                    <div className="bg-indigo-950/40 p-3 rounded-lg border border-indigo-500/30 relative group">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-semibold text-indigo-400 uppercase tracking-wider">
                          After (Optimized & Quantified):
                        </span>
                        <button
                          onClick={() => handleCopyBullet(item.improved, idx)}
                          className="flex items-center space-x-1 text-[11px] font-medium px-2 py-0.5 rounded bg-indigo-600/30 text-indigo-300 hover:bg-indigo-600/50 transition-all"
                          title="Copy to clipboard"
                        >
                          {copiedIndex === idx ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span className="text-emerald-400">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>
                      <p className="text-slate-100 font-medium leading-relaxed">{item.improved}</p>
                    </div>
                  </div>

                  {/* Explanation & Keywords */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs pt-1 border-t border-slate-900">
                    <p className="text-slate-400 text-[11px]">
                      <span className="font-semibold text-slate-300">Why it works:</span> {item.explanation}
                    </p>
                    <div className="flex flex-wrap gap-1 shrink-0">
                      {item.addedKeywords?.map((kw, kidx) => (
                        <span
                          key={kidx}
                          className="text-[10px] font-medium px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20"
                        >
                          +{kw}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500">No bullet rewrites available.</p>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Action Plan */}
      {(activeTab === "overview" || activeTab === "actionPlan") && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center space-x-2 pb-3 border-b border-slate-800">
            <ListChecks className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-bold text-white">Recommended Action Plan</h3>
          </div>

          <div className="space-y-3">
            {result.actionPlan && result.actionPlan.length > 0 ? (
              result.actionPlan.map((step, idx) => (
                <div key={idx} className="flex items-start space-x-3 bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                  <div className="w-6 h-6 rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-xs font-bold text-indigo-400 shrink-0 mt-0.5">
                    {idx + 1}
                  </div>
                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">{step}</p>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500">No action plan generated.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
