// @ts-nocheck
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { HRCandidateList } from "@/components/HRCandidateList";
import { ArrowLeft, Filter, Plus } from "lucide-react";
import { useJobRanking } from "@/hooks/useRanking";

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

interface Job {
  id: string;
  title: string;
  description?: string;
  required_skills: string[];
  consider_github?: boolean;
  consider_leetcode?: boolean;
  consider_kaggle?: boolean;
}

export default function JobCandidatesPage() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState<JobCandidate[]>([]);
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [considerGithub, setConsiderGithub] = useState(true);
  const [considerLeetcode, setConsiderLeetcode] = useState(true);
  const [considerKaggle, setConsiderKaggle] = useState(true);

  const { data: job, isLoading: jobLoading } = useQuery({
    queryKey: ["job", jobId],
    queryFn: async () => {
      const { data, error } = await supabase.from("jobs").select("*").eq("id", jobId!).single();
      if (error) throw error;
      return data as Job;
    },
    enabled: !!jobId,
  });

  const rankMutation = useJobRanking();

  // Fetch ranked candidates using the API
  const fetchRankedCandidates = async () => {
    if (!job) return;
    try {
      const result = await rankMutation.mutateAsync({
        job_id: job.id,
        required_skills: selectedSkills.length > 0 ? selectedSkills : job.required_skills,
      });
      // Transform the API response to match the component's expected format
      const transformedCandidates: JobCandidate[] = result.candidates.map((candidate, index) => ({
        candidate_id: candidate.id,
        candidate_name: candidate.name,
        job_rank: candidate.rank,
        ats_score: candidate.ats_score,
        relevant_skill_ranks: {}, // TODO: calculate from skills
        average_relevant_rank: 0, // TODO: calculate
        skills: candidate.skills,
        streak_consistency: 0, // TODO: get from platforms
      }));
      setCandidates(transformedCandidates);
    } catch (error) {
      console.error("Error fetching candidates:", error);
    }
  };

  useEffect(() => {
    if (job) {
      fetchRankedCandidates();
    }
  }, [job, selectedSkills]);

  const handleViewProfile = (candidateId: string) => {
    navigate(`/hr/candidates/${candidateId}`);
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
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/jobs")}
                className="mr-2"
              >
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
              <Button gap="2">
                <Filter className="h-4 w-4" />
                Filter Rankings
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Filter Job Rankings</DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                {/* Required Skills */}
                <div className="space-y-2">
                  <Label>Required Skills</Label>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {(job.required_skills || []).map((skill) => (
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

                {/* Platform Considerations */}
                <div className="border-t pt-4 space-y-2">
                  <Label>Consider Platform Metrics</Label>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="github"
                        checked={considerGithub}
                        onCheckedChange={(checked) => setConsiderGithub(checked as boolean)}
                      />
                      <Label htmlFor="github" className="font-normal cursor-pointer">
                        GitHub (Total Commits)
                      </Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="leetcode"
                        checked={considerLeetcode}
                        onCheckedChange={(checked) => setConsiderLeetcode(checked as boolean)}
                      />
                      <Label htmlFor="leetcode" className="font-normal cursor-pointer">
                        LeetCode (Total Solved)
                      </Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="kaggle"
                        checked={considerKaggle}
                        onCheckedChange={(checked) => setConsiderKaggle(checked as boolean)}
                      />
                      <Label htmlFor="kaggle" className="font-normal cursor-pointer">
                        Kaggle (Competitions)
                      </Label>
                    </div>
                  </div>
                </div>

                <Button className="w-full" onClick={() => {
                  // Re-fetch with new filters
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
          {(job.required_skills || []).map((skill) => (
            <div
              key={skill}
              className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full"
            >
              {skill}
            </div>
          ))}
        </div>

        {/* Candidates List */}
        <HRCandidateList
          candidates={candidates}
          jobTitle={job.title}
          onViewProfile={handleViewProfile}
          isLoading={false}
        />
      </div>
    </DashboardLayout>
  );
}
