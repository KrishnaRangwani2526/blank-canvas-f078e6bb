// @ts-nocheck
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "./useProfile";
import { useStreakData } from "./useStreakData";
import { toast } from "sonner";

export interface ATSResult {
  ats_score: number;
  summary: string;
  profile_summary: {
    bio: string;
    top_skills: string[];
    current_projects: Array<{ name: string; description: string; tech: string[] }>;
    certifications: { has_certs: boolean; list: string[]; summary: string };
    experience_highlights: string[];
  };
  score_breakdown: Array<{ category: string; score: number; max: number; detail: string }>;
  profile_gaps: Array<{ area: string; severity: "high" | "medium" | "low"; detail: string }>;
  strengths: string[];
  weaknesses: string[];
  consistency_score: number;
  recommendations: string[];
  learning_roadmap: string[];
  streak_analysis?: {
    github_streak: number;
    leetcode_streak: number;
    aspiring_streak: number;
    consistency_rating: "excellent" | "good" | "moderate" | "low";
    insight: string;
  };
  match_percentage?: number;
  matched_skills?: string[];
  missing_skills?: string[];
  gap_analysis?: string;
}

export function useAtsAnalyzer() {
  const { user } = useAuth();
  const { profile, skills, experience, projects, education } = useProfile(user?.id);
  const { data: streakData } = useStreakData();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ATSResult | null>(null);

  const analyzeProfile = async (jobRequirements?: string) => {
    if (!profile) {
      toast.error("Please complete your profile first");
      return null;
    }

    setLoading(true);
    try {
      const profileContext = {
        bio: profile.bio || profile.about,
        skills: skills.map((s) => s.name),
        experience: experience.map((e) => ({ role: e.role, company: e.company, description: e.description })),
        projects: projects.map((p) => ({ title: p.title, description: p.description, tech: p.tech_stack })),
        education: education.map((e) => ({ degree: e.degree, field: e.field_of_study })),
        streaks: {
          github_streak: streakData?.github?.streak ?? 0,
          github_weekly_commits: streakData?.github?.weekly_commits ?? 0,
          leetcode_streak: streakData?.leetcode?.streak ?? 0,
          leetcode_weekly_solved: streakData?.leetcode?.weekly_solved ?? 0,
          aspiring_streak: streakData?.aspiring?.streak ?? 0,
          aspiring_total_activities: streakData?.aspiring?.total_activities ?? 0,
        },
      };

      const prompt = `You are a senior technical recruiter and career coach analyzing a real engineering candidate. Your job is to deliver SPECIFIC, EVIDENCE-BASED insights — never generic advice.

CANDIDATE PROFILE (raw data):
${JSON.stringify(profileContext, null, 2)}

${jobRequirements ? `TARGET JOB REQUIREMENTS:\n${jobRequirements}\n\n` : ''}

ANALYSIS RULES (follow strictly):
1. Reference the candidate's ACTUAL data by name — quote specific project titles, skill names, companies, and streak numbers.
2. Every recommendation must be ACTIONABLE this week (e.g. "Refactor the '${projects[0]?.title || 'X'}' project README to highlight metrics" — not "improve your projects").
3. Score breakdown details must EXPLAIN the score (e.g. "Scored 65/100 because while you list React and TypeScript, your projects don't demonstrate state management or testing — both expected at mid-level").
4. Streak analysis: a streak of 0 means inactive; <7 = building habit; 7-21 = solid; >21 = excellent. Reference the actual numbers.
5. The 'summary' field should be a thoughtful 2-3 sentence paragraph that reads like a recruiter wrote it after reviewing the profile — mention at least one concrete strength and one concrete gap.
6. Recommendations: provide 5-7 prioritized items, each tying back to a specific gap in the candidate's data.
7. Learning roadmap: 4-6 week-by-week steps that build on what the candidate already knows toward what they're missing.
8. Avoid filler phrases like "consider improving" or "showcase your skills" — be concrete.

Return JSON matching exactly:
{
  "ats_score": number (0-100),
  "summary": "thoughtful 2-3 sentence recruiter-style overview citing specifics from the profile",
  "profile_summary": {
    "bio": "string",
    "top_skills": ["skill1", ...],
    "current_projects": [{"name": "string", "description": "string", "tech": ["string"]}],
    "certifications": {"has_certs": boolean, "list": ["string"], "summary": "string"},
    "experience_highlights": ["string"]
  },
  "score_breakdown": [
    {"category": "Skills Quality & Relevance", "score": number, "max": 100, "detail": "specific reasoning citing actual skills"},
    {"category": "Project Depth & Impact", "score": number, "max": 100, "detail": "specific reasoning citing actual project names"},
    {"category": "Work Experience", "score": number, "max": 100, "detail": "specific reasoning citing companies/roles"},
    {"category": "Coding Consistency (Streaks)", "score": number, "max": 100, "detail": "reference actual GitHub/LeetCode/Aspiring streak numbers"}
  ],
  "profile_gaps": [{"area": "specific gap", "severity": "high" | "medium" | "low", "detail": "why this matters and what's missing"}],
  "strengths": ["specific strength tied to profile data"],
  "weaknesses": ["specific weakness tied to profile data"],
  "consistency_score": number (0-100, derived from streaks: 0 streak ≈ 20, 7+ ≈ 60, 21+ ≈ 85, 30+ ≈ 95),
  "recommendations": ["specific actionable item 1", ...5-7 items],
  "learning_roadmap": ["Week 1: specific action", "Week 2: ...", ...4-6 weeks],
  "streak_analysis": {
    "github_streak": ${streakData?.github?.streak ?? 0},
    "leetcode_streak": ${streakData?.leetcode?.streak ?? 0},
    "aspiring_streak": ${streakData?.aspiring?.streak ?? 0},
    "consistency_rating": "excellent" | "good" | "moderate" | "low",
    "insight": "thoughtful 2 sentence insight referencing the actual streak numbers and what they say about the candidate's habits"
  }
  ${jobRequirements ? `, "match_percentage": number, "matched_skills": ["string"], "missing_skills": ["string"], "gap_analysis": "specific narrative explaining the fit"` : ''}
}

Return ONLY the raw JSON object — no markdown, no code fences, no commentary.`;

      const { generateJSONWithGemini } = await import("@/lib/gemini");
      const generatedResult = await generateJSONWithGemini(prompt);
      
      const completeResult: ATSResult = {
        ...generatedResult,
      };

      setResult(completeResult);
      return completeResult;
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to analyze profile with AI");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { analyzeProfile, result, loading };
}
