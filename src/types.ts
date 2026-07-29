export interface ResumeExtraction {
  candidateName?: string;
  skills: string[];
  experienceSummary: string;
  keywords: string[];
  education?: string[];
}

export interface JobExtraction {
  roleTitle: string;
  companyName?: string;
  requiredSkills: string[];
  preferredSkills: string[];
  keyResponsibilities: string[];
  keywords: string[];
}

export interface BulletRewrite {
  original: string;
  improved: string;
  explanation: string;
  impactMetrics: string;
  addedKeywords: string[];
}

export interface AnalysisResult {
  id: string;
  createdAt: string;
  jobTitle: string;
  companyName?: string;
  atsScore: number;
  scoreCategory: 'Excellent' | 'Good' | 'Moderate' | 'Needs Improvement';
  matchReasoning: string;
  matchedSkills: string[];
  missingCriticalSkills: string[];
  missingSecondarySkills: string[];
  bulletPointRewrites: BulletRewrite[];
  actionPlan: string[];
  resumeSummary: ResumeExtraction;
  jobSummary: JobExtraction;
}

export interface InterviewQuestion {
  id: number;
  question: string;
  category: 'technical' | 'behavioral' | 'situational' | 'domain';
  intent: string;
  suggestedKeyPoints: string[];
}

export interface AnswerEvaluation {
  clarityScore: number; // 0-10
  relevanceScore: number; // 0-10
  technicalDepthScore: number; // 0-10
  overallScore: number; // 0-10
  feedback: string;
  strengths: string[];
  improvements: string[];
  modelAnswerSnippet: string;
}

export interface QuestionAnswerState {
  questionId: number;
  userAnswer: string;
  evaluation?: AnswerEvaluation;
  isEvaluating?: boolean;
}

export interface InterviewSession {
  id: string;
  createdAt: string;
  roleTitle: string;
  companyName?: string;
  questions: InterviewQuestion[];
  answers: Record<number, QuestionAnswerState>;
  completed: boolean;
  overallScore?: number;
}
