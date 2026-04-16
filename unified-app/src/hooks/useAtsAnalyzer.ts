// @ts-nocheck
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "./useProfile";
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
  match_percentage?: number;
  matched_skills?: string[];
  missing_skills?: string[];
  gap_analysis?: string;
}

export function useAtsAnalyzer() {
  const { user } = useAuth();
  const { profile, skills, experience, projects, education } = useProfile(user?.id);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ATSResult | null>(null);

  const analyzeProfile = async (jobRequirements?: string) => {
    if (!profile) {
      toast.error("Please complete your profile first");
      return null;
    }

    setLoading(true);
    try {
      // Simulate ATS analysis delay
      await new Promise((r) => setTimeout(r, 2000));

      const demoResult: ATSResult = {
        ats_score: 72,
        summary:
          "Strong technical profile with solid project experience. GitHub activity shows consistent coding patterns. Areas for improvement include expanding certifications and deepening expertise in system design and distributed systems.",
        profile_summary: {
          bio: profile.bio || "Professional developer focused on building quality software",
          top_skills: skills.slice(0, 6).map((s) => s.name),
          current_projects: projects.slice(0, 2).map((p) => ({
            name: p.title,
            description: p.description || "",
            tech: p.tech_stack || [],
          })),
          certifications: {
            has_certs: education.length > 0,
            list: education.map((e) => e.degree),
            summary: education.length > 0 ? "Has relevant education credentials" : "Consider adding certifications",
          },
          experience_highlights: experience.slice(0, 3).map((e) => `${e.role} at ${e.company}`),
        },
        score_breakdown: [
          { category: "Skills Quality & Relevance", score: 78, max: 100, detail: "Strong backend stack but missing cloud-native tools" },
          { category: "Project Depth & Impact", score: 75, max: 100, detail: "Good real-world projects; needs more production-scale systems" },
          { category: "Work Experience", score: 60, max: 100, detail: String(experience.length) + " roles — solid foundation" },
          { category: "GitHub Activity", score: 70, max: 100, detail: "Active repos but consider more consistent contributions" },
          { category: "Coding Practice", score: 80, max: 100, detail: "Good problem-solving track record" },
          { category: "Certifications & Education", score: 50, max: 100, detail: education.length > 0 ? "Has education background" : "Consider adding credentials" },
        ],
        profile_gaps: [
          { area: "System Design", severity: "high", detail: "No evidence of designing distributed systems. Many senior roles filter for this." },
          { area: "Cloud & DevOps Certifications", severity: "high", detail: "Consider obtaining AWS or GCP certifications to boost ATS visibility." },
          { area: "Open Source Contributions", severity: "medium", detail: "Limited OSS activity. Contributing boosts credibility." },
          { area: "Technical Writing", severity: "medium", detail: "No blog posts or documentation portfolio. Consider creating content." },
          { area: "CI/CD & Infrastructure", severity: "low", detail: "Consider adding Kubernetes or Terraform experience." },
        ],
        strengths: [
          profile.github_url ? "Active GitHub profile" : "Building online presence",
          "Diverse skill set",
          "Project-driven learning",
          "Professional development experience",
        ],
        weaknesses: [
          education.length === 0 ? "Limited visible credentials" : "Could strengthen certifications",
          projects.length === 0 ? "No showcase projects" : "Could expand project portfolio",
          "System design gaps",
          "Limited open-source contributions",
        ],
        consistency_score: 65,
        recommendations: [
          "Build a production-grade REST API with comprehensive testing",
          "Contribute to 2-3 popular open-source projects",
          "Obtain a cloud platform certification",
          "Write technical blog posts documenting your architectures",
          "Practice system design problems regularly",
        ],
        learning_roadmap: [
          "Master containerization and orchestration (Week 1-3)",
          "Build a microservices project (Week 4-6)",
          "Learn CI/CD pipelines (Week 7-8)",
          "Study system design patterns (Week 9-12)",
          "Prepare and obtain a cloud certification (Week 13-16)",
        ],
        ...(jobRequirements
          ? {
              match_percentage: 64,
              matched_skills: skills.slice(0, 4).map((s) => s.name),
              missing_skills: ["Kubernetes", "Terraform", "GraphQL"],
              gap_analysis:
                "Profile shows strong foundational skills but lacks cloud-native and infrastructure-as-code experience required for this role. Focus on containerization and IaC tools.",
            }
          : {}),
      };

      setResult(demoResult);
      return demoResult;
    } catch (err: any) {
      toast.error(err.message || "Failed to analyze profile");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { analyzeProfile, result, loading };
}
