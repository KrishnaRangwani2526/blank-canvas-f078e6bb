import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { ATSResult } from "./useAtsAnalyzer";

export function useCompanyATSAnalysis() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ATSResult | null>(null);

  const analyzeCandidate = async (candidateId: string, jobRequirements?: string) => {
    setLoading(true);
    try {
      // Fetch candidate data
      const { data: candidateData, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", candidateId)
        .single();

      if (error || !candidateData) throw new Error("Candidate not found");

      // Simulate analysis
      await new Promise((r) => setTimeout(r, 2000));

      const demoResult: ATSResult = {
        ats_score: 72,
        summary: `${candidateData.full_name} has a strong technical profile with solid project experience.`,
        profile_summary: {
          bio: candidateData.bio || "Professional developer",
          top_skills: [],
          current_projects: [],
          certifications: {
            has_certs: false,
            list: [],
            summary: "Check certifications section",
          },
          experience_highlights: [],
        },
        score_breakdown: [
          { category: "Skills Quality & Relevance", score: 78, max: 100, detail: "Strong backend stack but missing cloud-native tools" },
          { category: "Project Depth & Impact", score: 75, max: 100, detail: "Good real-world projects" },
          { category: "Work Experience", score: 60, max: 100, detail: "Solid foundation" },
          { category: "GitHub Activity", score: 70, max: 100, detail: "Active contributions" },
          { category: "Coding Practice", score: 80, max: 100, detail: "Good problem-solving track record" },
          { category: "Certifications & Education", score: 50, max: 100, detail: "Room for growth" },
        ],
        profile_gaps: [
          { area: "System Design", severity: "high", detail: "No evidence of designing distributed systems." },
          { area: "Cloud & DevOps Certifications", severity: "high", detail: "Consider cloud platform certifications." },
          { area: "Open Source Contributions", severity: "medium", detail: "Limited OSS activity." },
        ],
        strengths: [
          "Diverse skill set",
          "Project-driven learning",
          "Professional development experience",
          "Active profile",
        ],
        weaknesses: [
          "Limited visible credentials",
          "System design gaps",
          "Limited open-source contributions",
        ],
        consistency_score: 65,
        recommendations: [
          "Review candidate's technical depth in your core tech stack",
          "Assess GitHub repositories for code quality",
          "Evaluate problem-solving with technical interview",
          "Consider cultural fit and team dynamics",
        ],
        learning_roadmap: [],
        ...(jobRequirements
          ? {
              match_percentage: 64,
              matched_skills: [],
              missing_skills: ["Kubernetes", "Terraform", "GraphQL"],
              gap_analysis:
                "Profile shows strong foundational skills but lacks cloud-native and infrastructure-as-code experience required for this role.",
            }
          : {}),
      };

      setResult(demoResult);
      return demoResult;
    } catch (err: any) {
      toast.error(err.message || "Failed to analyze candidate");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { analyzeCandidate, result, loading };
}
