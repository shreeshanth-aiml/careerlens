import React from "react";
import { Briefcase, Building2, Sparkles, FileCode2 } from "lucide-react";
import { SAMPLE_JOB_DESCRIPTIONS } from "../data/sampleData";

interface JobDescriptionInputProps {
  jobTitle: string;
  setJobTitle: (val: string) => void;
  companyName: string;
  setCompanyName: (val: string) => void;
  jobDescriptionText: string;
  setJobDescriptionText: (val: string) => void;
}

export const JobDescriptionInput: React.FC<JobDescriptionInputProps> = ({
  jobTitle,
  setJobTitle,
  companyName,
  setCompanyName,
  jobDescriptionText,
  setJobDescriptionText,
}) => {
  const handleSelectPreset = (presetIndex: number) => {
    const preset = SAMPLE_JOB_DESCRIPTIONS[presetIndex];
    if (preset) {
      setJobTitle(preset.title);
      setCompanyName(preset.company);
      setJobDescriptionText(preset.text);
    }
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl relative">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Briefcase className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-white">2. Target Job Description</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Specify job role details and paste the target posting to calculate ATS compatibility.
          </p>
        </div>

        {/* Quick presets */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-medium text-slate-400 flex items-center mr-1">
            <Sparkles className="w-3 h-3 text-amber-400 mr-1" /> Presets:
          </span>
          {SAMPLE_JOB_DESCRIPTIONS.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSelectPreset(idx)}
              className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all hover:text-white"
            >
              {preset.title}
            </button>
          ))}
        </div>
      </div>

      {/* Role & Company Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center space-x-1">
            <Briefcase className="w-3.5 h-3.5 text-blue-400" />
            <span>Job Title / Role</span>
          </label>
          <input
            type="text"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            placeholder="e.g. Senior Full Stack Engineer"
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center space-x-1">
            <Building2 className="w-3.5 h-3.5 text-blue-400" />
            <span>Company Name (Optional)</span>
          </label>
          <input
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="e.g. Google, Stripe, InnovateAI"
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Job Description Textarea */}
      <div>
        <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center space-x-1">
          <FileCode2 className="w-3.5 h-3.5 text-blue-400" />
          <span>Job Posting Text</span>
        </label>
        <textarea
          value={jobDescriptionText}
          onChange={(e) => setJobDescriptionText(e.target.value)}
          placeholder="Paste full job description requirements, responsibilities, and skill sets..."
          rows={7}
          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-y font-mono"
        />
        <div className="flex justify-end text-xs text-slate-500 mt-1">
          <span>{jobDescriptionText.length} characters</span>
        </div>
      </div>
    </div>
  );
};
