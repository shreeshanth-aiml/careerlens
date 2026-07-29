import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

const app = express();
const PORT = 3000;

// High body limit to support base64 encoded PDF files
app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ extended: true, limit: "25mb" }));

// Initialize Gemini API client on server
const getAiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is missing.");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
};

// Health Check API
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

/**
 * 1. Resume + Job Description Analysis API
 */
app.post("/api/analyze", async (req, res) => {
  try {
    const { resumePdfBase64, resumeText, jobDescriptionText, jobTitle, companyName } = req.body;

    if (!jobDescriptionText || jobDescriptionText.trim().length < 10) {
      return res.status(400).json({ error: "Job description is required and must contain meaningful content." });
    }

    if (!resumePdfBase64 && (!resumeText || resumeText.trim().length < 10)) {
      return res.status(400).json({ error: "Please provide either a PDF resume or text content for the resume." });
    }

    const ai = getAiClient();

    // Prepare contents array
    const parts: Array<any> = [];

    if (resumePdfBase64) {
      // Clean up base64 prefix if present
      const cleanBase64 = resumePdfBase64.replace(/^data:application\/pdf;base64,/, "");
      parts.push({
        inlineData: {
          mimeType: "application/pdf",
          data: cleanBase64,
        },
      });
      parts.push({
        text: "Above is the candidate's Resume PDF document.",
      });
    } else if (resumeText) {
      parts.push({
        text: `Candidate's Resume Content:\n${resumeText}`,
      });
    }

    const jobInfoText = `
Target Job Title: ${jobTitle || "Not Specified"}
Target Company: ${companyName || "Not Specified"}
Target Job Description:
${jobDescriptionText}
`;

    parts.push({
      text: jobInfoText,
    });

    const promptInstructions = `
Analyze the provided candidate Resume against the Target Job Description.
Act as an expert ATS (Applicant Tracking System) recruiter and senior hiring manager.

Your task is to:
1. Extract candidate resume details (Candidate Name if present, skills list, experience summary, key keywords).
2. Extract job details (Required skills, preferred skills, key responsibilities, key keywords).
3. Compare the resume against the job description to calculate an ATS compatibility score (0 to 100) and provide detailed match reasoning.
4. Categorize matched skills, missing critical skills (high priority required skills missing in resume), and missing secondary skills.
5. Provide 3 to 5 specific, high-impact resume bullet point rewrites tailored directly to this job description. Each rewrite MUST show the original/weak statement or responsibility from the resume and an improved, quantified bullet point with metrics/keywords added.
6. Provide a step-by-step action plan (3 to 5 actionable tips) for the candidate to optimize their resume for this application.

Return ONLY valid JSON according to the schema.
`;

    parts.push({ text: promptInstructions });

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: { parts },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            atsScore: { type: Type.NUMBER, description: "ATS Score between 0 and 100" },
            scoreCategory: {
              type: Type.STRING,
              description: "One of: Excellent, Good, Moderate, Needs Improvement",
            },
            matchReasoning: { type: Type.STRING, description: "Clear explanation of the ATS compatibility score" },
            matchedSkills: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Skills present in both resume and job description",
            },
            missingCriticalSkills: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Must-have requirements in JD missing from resume",
            },
            missingSecondarySkills: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Nice-to-have or secondary skills missing",
            },
            bulletPointRewrites: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  original: { type: Type.STRING, description: "Original weak bullet point or task" },
                  improved: { type: Type.STRING, description: "Optimized bullet point with quantified metrics and keywords" },
                  explanation: { type: Type.STRING, description: "Why this change makes the resume stronger" },
                  impactMetrics: { type: Type.STRING, description: "The metrics/quantified results added" },
                  addedKeywords: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                },
                required: ["original", "improved", "explanation", "impactMetrics", "addedKeywords"],
              },
            },
            actionPlan: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "3 to 5 actionable steps to boost ATS score",
            },
            resumeSummary: {
              type: Type.OBJECT,
              properties: {
                candidateName: { type: Type.STRING },
                skills: { type: Type.ARRAY, items: { type: Type.STRING } },
                experienceSummary: { type: Type.STRING },
                keywords: { type: Type.ARRAY, items: { type: Type.STRING } },
              },
              required: ["skills", "experienceSummary", "keywords"],
            },
            jobSummary: {
              type: Type.OBJECT,
              properties: {
                roleTitle: { type: Type.STRING },
                companyName: { type: Type.STRING },
                requiredSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
                preferredSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
                keyResponsibilities: { type: Type.ARRAY, items: { type: Type.STRING } },
                keywords: { type: Type.ARRAY, items: { type: Type.STRING } },
              },
              required: ["roleTitle", "requiredSkills", "preferredSkills", "keyResponsibilities", "keywords"],
            },
          },
          required: [
            "atsScore",
            "scoreCategory",
            "matchReasoning",
            "matchedSkills",
            "missingCriticalSkills",
            "missingSecondarySkills",
            "bulletPointRewrites",
            "actionPlan",
            "resumeSummary",
            "jobSummary",
          ],
        },
      },
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error("Received empty response from Gemini API.");
    }

    const parsedData = JSON.parse(responseText);

    const result = {
      id: "analysis_" + Date.now(),
      createdAt: new Date().toISOString(),
      jobTitle: jobTitle || parsedData.jobSummary?.roleTitle || "Target Role",
      companyName: companyName || parsedData.jobSummary?.companyName || "",
      ...parsedData,
    };

    return res.json(result);
  } catch (error: any) {
    console.error("Analysis Error:", error);
    return res.status(500).json({
      error: error.message || "Failed to parse and analyze resume against job description.",
    });
  }
});

/**
 * 2. Generate Mock Interview Questions API
 */
app.post("/api/interview/questions", async (req, res) => {
  try {
    const { jobRole, companyName, jobDescriptionText, resumeText } = req.body;

    if (!jobRole && !jobDescriptionText) {
      return res.status(400).json({ error: "Please provide either a Job Role or Job Description." });
    }

    const ai = getAiClient();

    const prompt = `
Generate exactly 5 tailored interview questions for a candidate applying for:
Job Role: ${jobRole || "Target Position"}
Company: ${companyName || "Target Company"}
${jobDescriptionText ? `Job Description:\n${jobDescriptionText}` : ""}
${resumeText ? `Candidate Resume Highlights:\n${resumeText}` : ""}

Create a balanced set of 5 interview questions covering:
1. Technical Skills / Core Competencies
2. System Design / Architecture / Problem Solving
3. Behavioral (STAR method: Situation, Task, Action, Result)
4. Domain Knowledge / Industry Practice
5. Situational / Leadership / Cultural fit

Return ONLY valid JSON matching the schema.
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.INTEGER, description: "Question index 1 to 5" },
                  question: { type: Type.STRING, description: "The interview question" },
                  category: {
                    type: Type.STRING,
                    description: "One of: technical, behavioral, situational, domain",
                  },
                  intent: { type: Type.STRING, description: "What the interviewer is assessing" },
                  suggestedKeyPoints: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "Key concepts the ideal answer should mention",
                  },
                },
                required: ["id", "question", "category", "intent", "suggestedKeyPoints"],
              },
            },
          },
          required: ["questions"],
        },
      },
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error("Empty response from Gemini for question generation.");
    }

    const data = JSON.parse(responseText);
    return res.json({
      sessionId: "session_" + Date.now(),
      jobRole: jobRole || "Target Role",
      companyName: companyName || "",
      questions: data.questions || [],
    });
  } catch (error: any) {
    console.error("Interview Question Generation Error:", error);
    return res.status(500).json({ error: error.message || "Failed to generate interview questions." });
  }
});

/**
 * 3. Evaluate User Answer API
 */
app.post("/api/interview/evaluate", async (req, res) => {
  try {
    const { question, category, intent, userAnswer, jobRole } = req.body;

    if (!question || !userAnswer) {
      return res.status(400).json({ error: "Question and User Answer are required." });
    }

    const ai = getAiClient();

    const prompt = `
Evaluate the candidate's interview response for the target role: ${jobRole || "Software Professional"}.

Interview Question: "${question}"
Question Intent: "${intent || "General assessment"}"
Question Category: "${category || "general"}"

Candidate's Answer:
"${userAnswer}"

Score the answer objectively from 0 to 10 on:
1. Clarity (Communication, structure, confidence, articulation)
2. Relevance (Directly addresses the question, uses proper examples/frameworks like STAR)
3. Technical Depth (Accuracy, specificity, metrics, technical/domain rigor)
4. Overall Score (Weighted combined score 0-10)

Provide constructive written feedback, bullet points for key strengths, bullet points for specific improvements, and a concise model answer snippet demonstrating a top 5% response.

Return ONLY valid JSON matching the schema.
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            clarityScore: { type: Type.NUMBER, description: "Score 0 to 10" },
            relevanceScore: { type: Type.NUMBER, description: "Score 0 to 10" },
            technicalDepthScore: { type: Type.NUMBER, description: "Score 0 to 10" },
            overallScore: { type: Type.NUMBER, description: "Score 0 to 10" },
            feedback: { type: Type.STRING, description: "Summary evaluation and critique" },
            strengths: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "What the user did well",
            },
            improvements: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Specific tips to improve this answer",
            },
            modelAnswerSnippet: {
              type: Type.STRING,
              description: "Sample ideal response snippet or bullet points",
            },
          },
          required: [
            "clarityScore",
            "relevanceScore",
            "technicalDepthScore",
            "overallScore",
            "feedback",
            "strengths",
            "improvements",
            "modelAnswerSnippet",
          ],
        },
      },
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error("Empty evaluation response from Gemini.");
    }

    const data = JSON.parse(responseText);
    return res.json(data);
  } catch (error: any) {
    console.error("Answer Evaluation Error:", error);
    return res.status(500).json({ error: error.message || "Failed to evaluate interview answer." });
  }
});

// Start Express server and mount Vite middleware
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`CareerLens server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
