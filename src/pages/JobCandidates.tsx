// @ts-nocheck
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { HRCandidateList } from "@/components/HRCandidateList";
import { ArrowLeft, Filter } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface JobCandidate {
  candidate_id: string;
  candidate_name: string;
  job_rank: number;
  ats_score: number;
  relevant_skill_ranks: Record<string, number>;
  average_relevant_rank: number;
  skills: string[];
  streak_consistency: number;
}

function extractSkillNames(requirements: any): string[] {
  if (!requirements) return [];
  if (Array.isArray(requirements)) {
    return requirements
      .map((r: any) => (typeof r === "string" ? r : r?.name || ""))
      .filter(Boolean);
  }
  return [];
}

export default function JobCandidatesPage() {
  const { id: jobId } = useParams();
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState<JobCandidate[]>([]);
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [rankLoading, setRankLoading] = useState(false);

  const { data: job, isLoading: jobLoading } = useQuery({
    queryKey: ["job", jobId],
    queryFn: async () => {
      const { data, error } = await supabase.from("jobs").select("*").eq("id", jobId!).single();
      if (error) throw error;
      return data;
    },
    enabled: !!jobId,
  });

  const requiredSkills = extractSkillNames(job?.requirements);

  // Fetch and rank candidates from applications
  const fetchRankedCandidates = async () => {
    if (!job) return;
    setRankLoading(true);
    try {
      const skills = selectedSkills.length > 0 ? selectedSkills : requiredSkills;

      // Get all applications for this job
      const { data: applications } = await supabase
        .from("applications")
        .select("*")
        .eq("job_id", job.id);

      if (!applications || applications.length === 0) {
        setCandidates([]);
        setRankLoading(false);
        return;
      }

      const userIds = applications.map((a) => a.candidate_id);

      // Fetch profiles and skills for applicants
      const [profilesRes, skillsRes] = await Promise.all([
        supabase.from("profiles").select("*").in("user_id", userIds),
        supabase.from("skills").select("*").in("user_id", userIds),
      ]);

      const profiles = profilesRes.data || [];
      const allSkills = skillsRes.data || [];

      const ranked: JobCandidate[] = profiles.map((profile) => {
        const userSkills = allSkills.filter((s) => s.user_id === profile.user_id);
        const skillNames = userSkills.map((s) => s.name);

        // Calculate ATS score based on skill match
        const matchedSkills = skillNames.filter((s) =>
          skills.some((rs) => rs.toLowerCase() === s.toLowerCase())
        );
        const atsScore = skills.length > 0
          ? (matchedSkills.length / skills.length) * 100
          : 50;

        // Build relevant skill ranks
        const relevantRanks: Record<string, number> = {};
        matchedSkills.forEach((skill, i) => {
          relevantRanks[skill] = i + 1;
        });

        return {
          candidate_id: profile.user_id,
          candidate_name: profile.full_name || profile.display_name || "Unknown",
          job_rank: 0,
          ats_score: Math.round(atsScore * 10) / 10,
          relevant_skill_ranks: relevantRanks,
          average_relevant_rank: matchedSkills.length > 0 ? matchedSkills.length : 0,
          skills: skillNames,
          streak_consistency: 0,
        };
      });

      // Sort by ATS score descending and assign ranks
      ranked.sort((a, b) => b.ats_score - a.ats_score);
      ranked.forEach((c, i) => {
        c.job_rank = i + 1;
      });

      // Save ranks and ATS scores back to applications table
      for (const c of ranked) {
        const app = applications.find((a) => a.candidate_id === c.candidate_id);
        if (app) {
          await supabase
            .from("applications")
            .update({ rank: c.job_rank, ats_score: c.ats_score })
            .eq("id", app.id);
        }
      }

      setCandidates(ranked);
    } catch (error) {
      console.error("Error fetching candidates:", error);
    } finally {
      setRankLoading(false);
    }
  };

  useEffect(() => {
    if (job) {
      fetchRankedCandidates();
    }
  }, [job]);

  const handleViewProfile = (candidateId: string) => {
    navigate(`/candidates/${candidateId}`);
  };

  if (jobLoading) {
    return (
      <DashboardLayout>
        <div className="animate-pulse">Loading job details...</div>
      </DashboardLayout>
    );
  }

  if (!job) {
    return (
      <DashboardLayout>
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground mb-4">Job not found</p>
            <Button onClick={() => navigate("/jobs")}>Back to Jobs</Button>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={() => navigate("/jobs")} className="mr-2">
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h1 className="text-3xl font-bold">{job.title}</h1>
            </div>
            {job.description && (
              <p className="text-secondary-foreground">{job.description}</p>
            )}
          </div>

          <Dialog open={filterOpen} onOpenChange={setFilterOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Filter className="h-4 w-4" />
                Filter Rankings
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Filter Job Rankings</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Required Skills</Label>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {requiredSkills.map((skill) => (
                      <div key={skill} className="flex items-center gap-2">
                        <Checkbox
                          id={skill}
                          checked={selectedSkills.includes(skill)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedSkills([...selectedSkills, skill]);
                            } else {
                              setSelectedSkills(selectedSkills.filter((s) => s !== skill));
                            }
                          }}
                        />
                        <Label htmlFor={skill} className="font-normal cursor-pointer">
                          {skill}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
                <Button className="w-full" onClick={() => {
                  fetchRankedCandidates();
                  setFilterOpen(false);
                }}>
                  Apply Filters
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Required Skills Tags */}
        <div className="flex flex-wrap gap-2">
          {requiredSkills.map((skill) => (
            <div key={skill} className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full">
              {skill}
            </div>
          ))}
        </div>

        <HRCandidateList
          candidates={candidates}
          jobTitle={job.title}
          onViewProfile={handleViewProfile}
          isLoading={rankLoading}
        />
      </div>
    </DashboardLayout>
  );
}
