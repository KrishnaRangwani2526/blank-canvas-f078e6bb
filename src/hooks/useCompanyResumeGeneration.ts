import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { ResumeData } from "@/hooks/useResumeMaker";

export function useCompanyResumeGeneration() {
  const [loading, setLoading] = useState(false);
  const [resume, setResume] = useState<ResumeData | null>(null);

  const generateCandidateResume = async (candidateId: string) => {
    setLoading(true);
    try {
      // Fetch candidate data
      const { data: candidateData, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", candidateId)
        .single();

      if (error || !candidateData) throw new Error("Candidate not found");

      // Simulate generation delay
      await new Promise((r) => setTimeout(r, 1500));

      const generatedResume: ResumeData = {
        name: candidateData.full_name || "Unknown",
        email: "contact@example.com",
        phone: "+1 (555) 000-0000",
        location: candidateData.location || "Remote",
        bio: candidateData.about || "Professional developer",
        skills: [],
        experience: [],
        education: [],
        projects: [],
      };

      setResume(generatedResume);
      return generatedResume;
    } catch (err: any) {
      toast.error(err.message || "Failed to generate resume");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { generateCandidateResume, resume, loading };
}
