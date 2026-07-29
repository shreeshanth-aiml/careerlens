import React, { useState, useEffect, useRef } from "react";
import {
  MessageSquareCode,
  Mic,
  MicOff,
  Send,
  Sparkles,
  CheckCircle2,
  HelpCircle,
  Award,
  ChevronRight,
  ChevronLeft,
  RotateCcw,
  Loader2,
  Zap,
  Volume2,
  AlertCircle,
  ThumbsUp,
  TrendingUp,
} from "lucide-react";
import { InterviewQuestion, AnswerEvaluation, QuestionAnswerState } from "../types";
import { generateInterviewQuestionsApi, evaluateAnswerApi } from "../services/apiClient";

interface MockInterviewProps {
  initialJobRole?: string;
  initialCompanyName?: string;
  initialJobDescriptionText?: string;
  initialResumeText?: string;
}

export const MockInterview: React.FC<MockInterviewProps> = ({
  initialJobRole = "",
  initialCompanyName = "",
  initialJobDescriptionText = "",
  initialResumeText = "",
}) => {
  // Config form state
  const [jobRole, setJobRole] = useState(initialJobRole || "Full Stack AI Developer");
  const [companyName, setCompanyName] = useState(initialCompanyName || "");
  const [jobDescriptionText, setJobDescriptionText] = useState(initialJobDescriptionText || "");

  // Session state
  const [isGenerating, setIsGenerating] = useState(false);
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, QuestionAnswerState>>({});
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [sessionCompleted, setSessionCompleted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Web Speech API state
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check Speech Recognition support
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechSupported(false);
    }
  }, []);

  const handleStartListening = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Web Speech API is not supported in this browser. You can type your answer manually.");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        let currentTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }

        const currentQId = questions[currentQuestionIndex]?.id;
        if (currentQId !== undefined) {
          setAnswers((prev) => {
            const existingText = prev[currentQId]?.userAnswer || "";
            // Append or update
            return {
              ...prev,
              [currentQId]: {
                ...prev[currentQId],
                questionId: currentQId,
                userAnswer: currentTranscript,
              },
            };
          });
        }
      };

      recognition.onerror = (e: any) => {
        console.error("Speech recognition error:", e);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      console.error(e);
      setIsListening(false);
    }
  };

  const handleStopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const handleGenerateQuestions = async () => {
    if (!jobRole.trim()) {
      setErrorMsg("Please specify a Job Role to generate interview questions.");
      return;
    }

    setErrorMsg(null);
    setIsGenerating(true);
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setSessionCompleted(false);

    try {
      const qList = await generateInterviewQuestionsApi({
        jobRole,
        companyName,
        jobDescriptionText,
        resumeText: initialResumeText,
      });

      if (qList && qList.length > 0) {
        setQuestions(qList);
      } else {
        throw new Error("No questions returned.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Something went wrong generating questions.");
    } finally {
      setIsGenerating(false);
    }
  };

  const currentQuestion = questions[currentQuestionIndex];
  const currentAnswerState = currentQuestion ? answers[currentQuestion.id] : undefined;

  const handleAnswerChange = (val: string) => {
    if (!currentQuestion) return;
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: {
        questionId: currentQuestion.id,
        userAnswer: val,
        evaluation: prev[currentQuestion.id]?.evaluation,
      },
    }));
  };

  const handleEvaluateAnswer = async () => {
    if (!currentQuestion || !currentAnswerState?.userAnswer?.trim()) {
      alert("Please enter or record an answer before submitting for evaluation.");
      return;
    }

    if (isListening) handleStopListening();

    setIsEvaluating(true);
    setErrorMsg(null);

    try {
      const evalData = await evaluateAnswerApi({
        question: currentQuestion.question,
        category: currentQuestion.category,
        intent: currentQuestion.intent,
        userAnswer: currentAnswerState.userAnswer,
        jobRole,
      });

      setAnswers((prev) => ({
        ...prev,
        [currentQuestion.id]: {
          ...prev[currentQuestion.id],
          evaluation: evalData,
        },
      }));
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to score your answer.");
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      setSessionCompleted(true);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  // Calculate overall session average score
  const getOverallSessionScore = () => {
    const evalList = (Object.values(answers) as QuestionAnswerState[])
      .map((a) => a.evaluation?.overallScore)
      .filter((s): s is number => typeof s === "number");

    if (evalList.length === 0) return 0;
    const sum = evalList.reduce((acc, curr) => acc + curr, 0);
    return Math.round((sum / evalList.length) * 10) / 10;
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <MessageSquareCode className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-white">AI Mock Interview Simulator</h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Gemini generates role-specific interview questions. Speak or type your answers for instant clarity, relevance, and technical depth scoring.
            </p>
          </div>

          {questions.length > 0 && !sessionCompleted && (
            <button
              onClick={() => {
                if (confirm("Reset current interview session?")) {
                  setQuestions([]);
                  setSessionCompleted(false);
                }
              }}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white border border-slate-700 text-xs transition-all self-start sm:self-auto"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>New Interview</span>
            </button>
          )}
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Mode 1: Form to Generate Questions */}
      {questions.length === 0 && !isGenerating && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5 max-w-2xl mx-auto">
          <div className="text-center space-y-1 pb-4 border-b border-slate-800">
            <h3 className="text-lg font-bold text-white">Setup Your Interview Context</h3>
            <p className="text-xs text-slate-400">
              Customize the job title and description so Gemini can synthesize 5 targeted questions.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Target Role Title *
              </label>
              <input
                type="text"
                value={jobRole}
                onChange={(e) => setJobRole(e.target.value)}
                placeholder="e.g. Senior Full Stack AI Developer"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Company Name (Optional)
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. Google, OpenAI, Anthropic"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Job Posting Details (Optional)
              </label>
              <textarea
                value={jobDescriptionText}
                onChange={(e) => setJobDescriptionText(e.target.value)}
                placeholder="Paste job posting details for higher precision interview questions..."
                rows={4}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <button
              onClick={handleGenerateQuestions}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center space-x-2"
            >
              <Sparkles className="w-4 h-4 text-cyan-300" />
              <span>Generate 5 Tailored Interview Questions</span>
            </button>
          </div>
        </div>
      )}

      {/* Loading State for Question Generation */}
      {isGenerating && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center space-y-4 shadow-xl max-w-xl mx-auto">
          <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20 animate-ping" />
            <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Generating Tailored Interview Questions</h3>
            <p className="text-xs text-slate-400 mt-1">
              Gemini is crafting 5 technical, behavioral, and situational questions for <span className="text-indigo-400 font-semibold">{jobRole}</span>...
            </p>
          </div>
        </div>
      )}

      {/* Mode 2: Active Question View */}
      {questions.length > 0 && !sessionCompleted && currentQuestion && (
        <div className="space-y-6">
          {/* Question Progress Header */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between shadow-lg">
            <div className="flex items-center space-x-3">
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-indigo-600 text-white">
                Question {currentQuestionIndex + 1} of {questions.length}
              </span>
              <span className="text-xs text-slate-400 capitalize hidden sm:inline">
                Category: <strong className="text-slate-200">{currentQuestion.category}</strong>
              </span>
            </div>

            {/* Pagination Dots */}
            <div className="flex space-x-1.5">
              {questions.map((q, idx) => {
                const isAnswered = !!answers[q.id]?.evaluation;
                const isCurrent = idx === currentQuestionIndex;
                return (
                  <button
                    key={idx}
                    onClick={() => setCurrentQuestionIndex(idx)}
                    className={`w-3 h-3 rounded-full transition-all ${
                      isCurrent
                        ? "bg-indigo-500 ring-2 ring-indigo-400/50 scale-125"
                        : isAnswered
                        ? "bg-emerald-500"
                        : "bg-slate-800 hover:bg-slate-700"
                    }`}
                    title={`Question ${idx + 1}`}
                  />
                );
              })}
            </div>
          </div>

          {/* Main Question Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5 relative">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  {currentQuestion.category} Interview Question
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-white leading-snug pt-1">
                  "{currentQuestion.question}"
                </h3>
              </div>
            </div>

            {/* Interviewer Intent & Key Points Hint */}
            <div className="bg-slate-950/80 rounded-xl p-3.5 border border-slate-800 text-xs space-y-2">
              <div className="flex items-center space-x-1.5 text-indigo-400 font-semibold">
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Interviewer Intent:</span>
                <span className="text-slate-300 font-normal">{currentQuestion.intent}</span>
              </div>

              {currentQuestion.suggestedKeyPoints && (
                <div className="pt-2 border-t border-slate-900 flex flex-wrap gap-1.5 items-center">
                  <span className="text-[11px] text-slate-400 font-medium mr-1">Suggested concepts to include:</span>
                  {currentQuestion.suggestedKeyPoints.map((pt, pidx) => (
                    <span
                      key={pidx}
                      className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700"
                    >
                      • {pt}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Answer Box & Speech Recognition */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
                  <MessageSquareCode className="w-4 h-4 text-indigo-400" />
                  <span>Your Answer (Speak or Type):</span>
                </label>

                {/* Speech Recognition Toggle */}
                {speechSupported ? (
                  <button
                    type="button"
                    onClick={isListening ? handleStopListening : handleStartListening}
                    className={`flex items-center space-x-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl transition-all ${
                      isListening
                        ? "bg-rose-600 text-white animate-pulse shadow-lg shadow-rose-600/40"
                        : "bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
                    }`}
                  >
                    {isListening ? (
                      <>
                        <MicOff className="w-3.5 h-3.5" />
                        <span>Stop Listening (Recording...)</span>
                      </>
                    ) : (
                      <>
                        <Mic className="w-3.5 h-3.5 text-rose-400" />
                        <span>Voice Input (Speech-to-Text)</span>
                      </>
                    )}
                  </button>
                ) : (
                  <span className="text-[11px] text-slate-500 italic">
                    (Mic input unavailable in browser)
                  </span>
                )}
              </div>

              {/* Listening Banner */}
              {isListening && (
                <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 flex items-center justify-between animate-pulse">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                    <span>Listening... Speak clearly into your microphone. Transcribing live...</span>
                  </div>
                  <Volume2 className="w-4 h-4 text-rose-400" />
                </div>
              )}

              <textarea
                value={currentAnswerState?.userAnswer || ""}
                onChange={(e) => handleAnswerChange(e.target.value)}
                placeholder="Type your response here, or click 'Voice Input' to speak naturally..."
                rows={6}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 leading-relaxed font-sans"
              />

              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>{(currentAnswerState?.userAnswer || "").length} characters</span>

                {/* Submit / Score Button */}
                <button
                  disabled={isEvaluating || !(currentAnswerState?.userAnswer?.trim())}
                  onClick={handleEvaluateAnswer}
                  className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isEvaluating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Gemini Scoring Answer...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-cyan-300" />
                      <span>Score Answer with Gemini</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Answer Evaluation Card */}
            {currentAnswerState?.evaluation && (
              <div className="bg-slate-950 rounded-xl p-5 border border-indigo-500/30 space-y-4 animate-fadeIn">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                  <div className="flex items-center space-x-2">
                    <Award className="w-5 h-5 text-indigo-400" />
                    <h4 className="font-bold text-white text-base">Gemini Score & Feedback</h4>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-slate-400">Overall Question Score:</span>
                    <span className="text-xl font-black text-indigo-400 px-3 py-1 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                      {currentAnswerState.evaluation.overallScore} / 10
                    </span>
                  </div>
                </div>

                {/* Detailed Score Gauges */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 text-center">
                    <span className="text-[11px] font-semibold text-slate-400 block">Clarity</span>
                    <span className="text-lg font-bold text-cyan-400">
                      {currentAnswerState.evaluation.clarityScore} / 10
                    </span>
                  </div>
                  <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 text-center">
                    <span className="text-[11px] font-semibold text-slate-400 block">Relevance</span>
                    <span className="text-lg font-bold text-emerald-400">
                      {currentAnswerState.evaluation.relevanceScore} / 10
                    </span>
                  </div>
                  <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 text-center">
                    <span className="text-[11px] font-semibold text-slate-400 block">Technical Depth</span>
                    <span className="text-lg font-bold text-amber-400">
                      {currentAnswerState.evaluation.technicalDepthScore} / 10
                    </span>
                  </div>
                </div>

                {/* Feedback */}
                <div>
                  <p className="text-xs text-slate-300 leading-relaxed bg-slate-900 p-3 rounded-lg border border-slate-800">
                    {currentAnswerState.evaluation.feedback}
                  </p>
                </div>

                {/* Strengths & Improvements */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  {/* Strengths */}
                  <div className="bg-emerald-950/20 p-3 rounded-lg border border-emerald-500/20 space-y-1.5">
                    <p className="font-semibold text-emerald-400 flex items-center space-x-1">
                      <ThumbsUp className="w-3 h-3" />
                      <span>Strengths</span>
                    </p>
                    <ul className="space-y-1 text-slate-300 list-disc list-inside">
                      {currentAnswerState.evaluation.strengths?.map((s, sidx) => (
                        <li key={sidx}>{s}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Improvements */}
                  <div className="bg-amber-950/20 p-3 rounded-lg border border-amber-500/20 space-y-1.5">
                    <p className="font-semibold text-amber-400 flex items-center space-x-1">
                      <TrendingUp className="w-3 h-3" />
                      <span>Areas for Improvement</span>
                    </p>
                    <ul className="space-y-1 text-slate-300 list-disc list-inside">
                      {currentAnswerState.evaluation.improvements?.map((imp, iidx) => (
                        <li key={iidx}>{imp}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Model Answer Snippet */}
                {currentAnswerState.evaluation.modelAnswerSnippet && (
                  <div className="bg-indigo-950/30 p-3.5 rounded-lg border border-indigo-500/20 text-xs space-y-1">
                    <p className="font-semibold text-indigo-300 flex items-center space-x-1">
                      <Zap className="w-3.5 h-3.5 text-amber-400" />
                      <span>Model Answer Snippet (Top 5% Response Example)</span>
                    </p>
                    <p className="text-slate-200 italic leading-relaxed">
                      "{currentAnswerState.evaluation.modelAnswerSnippet}"
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Question Footer Navigation */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              <button
                disabled={currentQuestionIndex === 0}
                onClick={handlePrevQuestion}
                className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous Question</span>
              </button>

              <button
                onClick={handleNextQuestion}
                className="flex items-center space-x-1.5 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition-all"
              >
                <span>
                  {currentQuestionIndex === questions.length - 1
                    ? "Finish & View Full Report"
                    : "Next Question"}
                </span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mode 3: Session Complete Summary */}
      {sessionCompleted && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl space-y-6 max-w-3xl mx-auto text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-white">Mock Interview Completed!</h3>
            <p className="text-xs sm:text-sm text-slate-400">
              You answered all 5 tailored questions for <span className="text-indigo-400 font-semibold">{jobRole}</span>.
            </p>
          </div>

          {/* Average Score Badge */}
          <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 inline-block space-y-1">
            <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold block">
              Average Interview Performance Score
            </span>
            <span className="text-5xl font-black text-indigo-400">
              {getOverallSessionScore()} <span className="text-xl font-normal text-slate-400">/ 10</span>
            </span>
          </div>

          {/* Individual Question Scores Breakdown */}
          <div className="space-y-3 text-left">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Question Score Summary
            </h4>
            {questions.map((q, idx) => {
              const evalObj = answers[q.id]?.evaluation;
              return (
                <div
                  key={idx}
                  className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between text-xs"
                >
                  <div className="space-y-0.5 max-w-md">
                    <span className="text-[10px] text-indigo-400 font-bold uppercase">Q{idx + 1} ({q.category})</span>
                    <p className="text-slate-200 font-medium truncate">{q.question}</p>
                  </div>

                  {evalObj ? (
                    <span className="font-bold text-indigo-400 px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 shrink-0">
                      {evalObj.overallScore} / 10
                    </span>
                  ) : (
                    <span className="text-slate-500 italic shrink-0">Skipped</span>
                  )}
                </div>
              );
            })}
          </div>

          <div className="pt-4 flex justify-center space-x-3">
            <button
              onClick={handleGenerateQuestions}
              className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all flex items-center space-x-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Retry Mock Interview</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
