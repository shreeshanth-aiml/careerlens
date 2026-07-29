import React, { useState, useRef } from "react";
import { Upload, FileText, CheckCircle, Trash2, Sparkles, FileType, AlertCircle } from "lucide-react";
import { SAMPLE_RESUME } from "../data/sampleData";

interface ResumeUploadProps {
  pdfBase64: string | null;
  setPdfBase64: (val: string | null) => void;
  fileName: string | null;
  setFileName: (val: string | null) => void;
  resumeText: string;
  setResumeText: (val: string) => void;
  mode: "pdf" | "text";
  setMode: (mode: "pdf" | "text") => void;
}

export const ResumeUpload: React.FC<ResumeUploadProps> = ({
  pdfBase64,
  setPdfBase64,
  fileName,
  setFileName,
  resumeText,
  setResumeText,
  mode,
  setMode,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (file: File) => {
    setErrorMsg(null);
    if (file.type !== "application/pdf") {
      setErrorMsg("Please upload a valid PDF file (.pdf)");
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      setErrorMsg("File size exceeds 15MB limit. Please upload a smaller PDF.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setPdfBase64(result);
      setFileName(file.name);
    };
    reader.onerror = () => {
      setErrorMsg("Failed to read PDF file.");
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleClear = () => {
    setPdfBase64(null);
    setFileName(null);
    setResumeText("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleLoadSample = () => {
    setErrorMsg(null);
    setMode("text");
    setResumeText(SAMPLE_RESUME);
    setPdfBase64(null);
    setFileName("sample_resume_alex_chen.pdf");
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <FileType className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-white">1. Resume Input</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Upload your PDF resume or paste plain text for multimodal Gemini parsing.
          </p>
        </div>

        {/* Input Format Switch & Sample Button */}
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={handleLoadSample}
            className="flex items-center space-x-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-600/30 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Load Sample</span>
          </button>

          <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex text-xs font-medium">
            <button
              onClick={() => setMode("pdf")}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                mode === "pdf" ? "bg-indigo-600 text-white shadow" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              PDF Upload
            </button>
            <button
              onClick={() => setMode("text")}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                mode === "text" ? "bg-indigo-600 text-white shadow" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Plain Text
            </button>
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* PDF Upload Mode */}
      {mode === "pdf" ? (
        pdfBase64 && fileName ? (
          <div className="p-4 rounded-xl bg-slate-950 border border-emerald-500/30 flex items-center justify-between">
            <div className="flex items-center space-x-3 overflow-hidden">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                <CheckCircle className="w-5 h-5" />
              </div>
              <div className="truncate">
                <p className="text-sm font-semibold text-white truncate">{fileName}</p>
                <p className="text-xs text-emerald-400 font-medium">PDF Ready for Gemini Multimodal Analysis</p>
              </div>
            </div>

            <button
              onClick={handleClear}
              className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-rose-400 hover:bg-slate-700 transition-all ml-2"
              title="Remove File"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
              isDragging
                ? "border-indigo-500 bg-indigo-500/10 scale-[0.99]"
                : "border-slate-800 hover:border-slate-700 bg-slate-950/40 hover:bg-slate-950/80"
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
              accept="application/pdf"
              className="hidden"
            />
            <div className="w-12 h-12 mx-auto rounded-full bg-slate-800/80 border border-slate-700 flex items-center justify-center text-indigo-400 mb-3">
              <Upload className="w-6 h-6" />
            </div>
            <p className="text-sm font-medium text-slate-200">
              Drag & drop your <span className="text-indigo-400 font-semibold">PDF Resume</span> here
            </p>
            <p className="text-xs text-slate-500 mt-1">Supports PDF up to 15MB • Preserves structure & tables</p>
          </div>
        )
      ) : (
        /* Text Paste Mode */
        <div>
          <textarea
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            placeholder="Paste your full resume text here (Summary, Experience, Skills, Education)..."
            rows={8}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-y font-mono"
          />
          <div className="flex justify-between items-center text-xs text-slate-500 mt-2">
            <span>{resumeText.length} characters</span>
            {resumeText && (
              <button
                onClick={handleClear}
                className="text-rose-400 hover:underline"
              >
                Clear text
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
