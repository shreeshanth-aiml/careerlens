import React, { useState, useEffect } from "react";
import { Navbar } from "./components/Navbar";
import { ResumeUpload } from "./components/ResumeUpload";
import { JobDescriptionInput } from "./components/JobDescriptionInput";
import { GapAnalysis } from "./components/GapAnalysis";
import { MockInterview } from "./components/MockInterview";
import { Dashboard } from "./components/Dashboard";
import { AnalysisResult } from "./types";
import { analyzeResumeApi } from "./services/apiClient";
import {
  Sparkles,
  Loader2,
  AlertCircle,
  FileSearch,
  ArrowRight,
  CheckCircle2,
  Zap,
} from "lucide-react";

const STORAGE_KEY = "careerlens_history_v1";

export default function App() {
  const [activeTab, setActiveTab] = useState<"analyze" | "interview" | "dashboard">("analyze");

  // Resume State
  const [pdfBase64, setPdfBase64] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [resumeText, setResumeText] = useState<string>("");
  const [resumeMode, setResumeMode] = useState<"pdf" | "text">("pdf");

  // Job Description State
  const [jobTitle, setJobTitle] = useState<string>("Senior Full Stack AI Engineer");
  const [companyName, setCompanyName] = useState<string>("InnovateAI Labs");
  const [jobDescriptionText, setJobDescriptionText] = useState<string>(
    `About the Role:
We are looking for a Senior Full Stack AI Engineer to join our core team. You will lead the development of generative AI features, serverless backend microservices, and reactive web applications using Next.js/React, TypeScript, and Python.

Key Responsibilities:
- Architect server-side integrations with Large Language Models (Gemini API, OpenAI).
- Build production-grade REST and GraphQL endpoints in Node.js/Express.
- Optimize web application performance, core web vitals, and state management.
- Implement cloud deployments using AWS, Docker, and GitHub Actions CI/CD pipelines.

Requirements:
- 4+ years of full-stack web development experience with TypeScript, React, and Node.js.
- Demonstrated experience integrating LLMs / Gemini API into web applications.
- Strong proficiency in SQL (PostgreSQL), vector indexing, and NoSQL databases.
- Deep expertise in Docker containerization, CI/CD automation, and cloud security.`
  );

  // Analysis state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState<string>("");
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [currentResult, setCurrentResult] = useState<AnalysisResult | null>(null);

  // History / Local Storage state
  const [history, setHistory] = useState<AnalysisResult[]>([]);

  // Load history on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setHistory(JSON.parse(saved));
      }
    } catch (e) {
      console.error("Failed to load history from localStorage:", e);
    }
  }, []);

  // Save history helper
  const saveToHistory = (newResult: AnalysisResult) => {
    setHistory((prev) => {
      const updated = [newResult, ...prev.filter((i) => i.id !== newResult.id)];
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error("Failed to save history:", e);
      }
      return updated;
    });
  };

  const handleDeleteAnalysis = (id: string) => {
    setHistory((prev) => {
      const updated = prev.filter((item) => item.id !== id);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
    if (currentResult?.id === id) {
      setCurrentResult(null);
    }
  };

  const handleClearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.error(e);
    }
  };

  // Perform Analysis API Call
  const handleRunAnalysis = async () => {
    setAnalysisError(null);

    if (resumeMode === "pdf" && !pdfBase64) {
      setAnalysisError("Please upload a PDF resume or switch to 'Plain Text' mode.");
      return;
    }
    if (resumeMode === "text" && (!resumeText || resumeText.trim().length < 20)) {
      setAnalysisError("Please enter meaningful resume text before running analysis.");
      return;
    }
    if (!jobDescriptionText || jobDescriptionText.trim().length < 20) {
      setAnalysisError("Please enter a target Job Description posting.");
      return;
    }

    setIsAnalyzing(true);
    setAnalysisStep("Reading & Encoding Resume Data...");

    try {
      setTimeout(() => setAnalysisStep("Extracting candidate skills with Gemini 3.6 Flash..."), 600);
      setTimeout(() => setAnalysisStep("Evaluating ATS compatibility & calculating score..."), 1500);
      setTimeout(() => setAnalysisStep("Synthesizing quantified bullet point rewrites..."), 2400);

      const data = await analyzeResumeApi({
        resumePdfBase64: resumeMode === "pdf" ? pdfBase64 : undefined,
        resumeText: resumeMode === "text" ? resumeText : undefined,
        jobDescriptionText,
        jobTitle,
        companyName,
      });

      setCurrentResult(data);
      saveToHistory(data);

      // Smooth scroll down to results
      setTimeout(() => {
        const resultElement = document.getElementById("analysis-results");
        if (resultElement) {
          resultElement.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
    } catch (err: any) {
      console.error(err);
      setAnalysisError(err.message || "Failed to analyze resume. Please check your inputs.");
    } finally {
      setIsAnalyzing(false);
      setAnalysisStep("");
    }
  };

  // Trigger Mock Interview with prefilled data
  const handleStartInterviewForRole = (
    role: string,
    company?: string,
    jdText?: string
  ) => {
    setJobTitle(role);
    if (company) setCompanyName(company);
    if (jdText) setJobDescriptionText(jdText);
    setActiveTab("interview");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Select historical analysis to view
  const handleSelectAnalysis = (item: AnalysisResult) => {
    setCurrentResult(item);
    setActiveTab("analyze");
    setTimeout(() => {
      const resultElement = document.getElementById("analysis-results");
      if (resultElement) {
        resultElement.scrollIntoView({ behavior: "smooth" });
      }
    }, 100);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white flex flex-col">
      {/* Top Header Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        savedCount={history.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Tab 1: ATS Analysis */}
        {activeTab === "analyze" && (
          <div className="space-y-8">
            {/* Hero Heading */}
            <div className="text-center max-w-3xl mx-auto space-y-3">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-gradient-to-r from-indigo-500/10 via-blue-500/10 to-cyan-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>Multimodal Gemini 3.6 Flash Engine</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
                Optimize Your Resume for <br className="hidden sm:inline" />
                <span className="bg-gradient-to-r from-indigo-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  ATS Screening & Recruiters
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto leading-relaxed">
                Upload your PDF resume and paste the job posting. Get an instant ATS compatibility score, identified missing keywords, and 3-5 quantified bullet point rewrites.
              </p>
            </div>

            {/* Error Banner */}
            {analysisError && (
              <div className="max-w-3xl mx-auto p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center space-x-3">
                <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
                <p className="font-medium">{analysisError}</p>
              </div>
            )}

            {/* Step Inputs Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
              <ResumeUpload
                pdfBase64={pdfBase64}
                setPdfBase64={setPdfBase64}
                fileName={fileName}
                setFileName={setFileName}
                resumeText={resumeText}
                setResumeText={setResumeText}
                mode={resumeMode}
                setMode={setResumeMode}
              />

              <JobDescriptionInput
                jobTitle={jobTitle}
                setJobTitle={setJobTitle}
                companyName={companyName}
                setCompanyName={setCompanyName}
                jobDescriptionText={jobDescriptionText}
                setJobDescriptionText={setJobDescriptionText}
              />
            </div>

            {/* Action Trigger Button */}
            <div className="flex justify-center pt-2">
              <button
                disabled={isAnalyzing}
                onClick={handleRunAnalysis}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-black text-sm sm:text-base shadow-xl shadow-indigo-600/30 hover:shadow-indigo-600/50 transition-all transform hover:-translate-y-0.5 flex items-center justify-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin text-cyan-300" />
                    <span>{analysisStep || "Analyzing Resume with Gemini..."}</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5 text-amber-300" />
                    <span>Run ATS Compatibility & Gap Analysis</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>

            {/* Analysis Results View */}
            <div id="analysis-results">
              {currentResult ? (
                <GapAnalysis
                  result={currentResult}
                  onStartInterview={handleStartInterviewForRole}
                />
              ) : (
                <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-12 text-center text-slate-500 text-xs space-y-3">
                  <FileSearch className="w-10 h-10 mx-auto text-slate-600" />
                  <p className="text-sm font-medium text-slate-400">No active analysis loaded</p>
                  <p className="max-w-md mx-auto">
                    Fill in your resume and job description above, then click "Run ATS Compatibility & Gap Analysis" to see your score, missing skills, and bullet point rewrites.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Mock Interview Simulator */}
        {activeTab === "interview" && (
          <MockInterview
            initialJobRole={jobTitle}
            initialCompanyName={companyName}
            initialJobDescriptionText={jobDescriptionText}
            initialResumeText={resumeText}
          />
        )}

        {/* Tab 3: History & Analytics Dashboard */}
        {activeTab === "dashboard" && (
          <Dashboard
            history={history}
            onSelectAnalysis={handleSelectAnalysis}
            onStartInterview={handleStartInterviewForRole}
            onDeleteAnalysis={handleDeleteAnalysis}
            onClearHistory={handleClearHistory}
          />
        )}
      </main>

      {/* Clean Modern Footer */}
      <footer className="mt-auto border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-slate-400">CareerLens</span>
            <span>• Powered by Google Gemini 3.6 Flash</span>
          </div>
          <p>Strictly server-side API processing • Zero client API key leaks</p>
        </div>
      </footer>
    </div>
  );
}
