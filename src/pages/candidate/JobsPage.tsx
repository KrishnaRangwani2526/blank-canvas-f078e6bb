// @ts-nocheck
import { useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Briefcase, Trophy, Clock, CheckCircle2, XCircle } from "lucide-react";

const statusConfig: Record<string, { label: string; icon: any; color: string }> = {
  applied: { label: "Applied", icon: Clock, color: "text-yellow-500" },
  reviewed: { label: "Under Review", icon: Clock, color: "text-blue-500" },
  shortlisted: { label: "Shortlisted", icon: CheckCircle2, color: "text-green-500" },
  rejected: { label: "Rejected", icon: XCircle, color: "text-destructive" },
  hired: { label: "Hired", icon: CheckCircle2, color: "text-green-600" },
};

const JobsPage = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: jobs = [], isLoading } = useQuery({
    queryKey: ["jobs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("jobs")
        .select("*")
        .eq("status", "active")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Fetch ALL application data including rank, ats_score, status
  const { data: myApplications = [], refetch: refetchApps } = useQuery({
    queryKey: ["my-applications", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("applications")
        .select("*")
        .eq("user_id", user!.id);
      return data || [];
    },
    enabled: !!user,
  });

  // For each applied job, get total applicant count
  const { data: jobApplicantCounts = {} } = useQuery({
    queryKey: ["job-applicant-counts", myApplications.map(a => a.job_id).join(",")],
    queryFn: async () => {
      const jobIds = myApplications.map(a => a.job_id);
      if (jobIds.length === 0) return {};
      const counts: Record<string, number> = {};
      for (const jid of jobIds) {
        const { count } = await supabase
          .from("applications")
          .select("*", { count: "exact", head: true })
          .eq("job_id", jid);
        counts[jid] = count || 0;
      }
      return counts;
    },
    enabled: myApplications.length > 0,
  });

  const appByJobId = useMemo(() => {
    const map: Record<string, any> = {};
    myApplications.forEach((a) => { map[a.job_id] = a; });
    return map;
  }, [myApplications]);

  const applyMutation = useMutation({
    mutationFn: async (jobId: string) => {
      const { error } = await supabase.from("applications").insert({
        job_id: jobId,
        user_id: user!.id,
        status: "applied",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Application submitted!");
      refetchApps();
      queryClient.invalidateQueries({ queryKey: ["job-applicant-counts"] });
    },
    onError: (err: any) => toast.error(err.message || "Failed to apply."),
  });

  const extractSkills = (requirements: any): string[] => {
    if (!requirements) return [];
    if (Array.isArray(requirements)) {
      return requirements.map((r: any) => (typeof r === "string" ? r : r?.name || "")).filter(Boolean);
    }
    return [];
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex items-center gap-3 mb-6">
          <Briefcase className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Jobs</h1>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-card rounded-xl border p-6 animate-pulse">
                <div className="h-5 w-48 bg-secondary rounded mb-3" />
                <div className="h-3 w-32 bg-secondary rounded mb-2" />
                <div className="h-3 w-64 bg-secondary rounded" />
              </div>
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center text-muted-foreground">
              No active job postings found.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {jobs.map((job: any) => {
              const app = appByJobId[job.id];
              const isApplied = !!app;
              const jobSkills = extractSkills(job.requirements);
              const totalApplicants = jobApplicantCounts[job.id] || 0;
              const myRank = app?.rank;
              const myStatus = app?.status || "applied";
              const statusInfo = statusConfig[myStatus] || statusConfig.applied;
              const StatusIcon = statusInfo.icon;

              return (
                <Card key={job.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6 space-y-3">
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div className="flex-1">
                        <p className="text-xl font-semibold text-foreground">{job.title}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {job.location || "Remote"} · {job.work_mode} · {job.job_type}
                        </p>
                        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                          {job.description || "No description available."}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        {!isApplied ? (
                          <Button
                            onClick={() => applyMutation.mutate(job.id)}
                            disabled={applyMutation.isPending}
                          >
                            Apply
                          </Button>
                        ) : (
                          <>
                            {/* Status badge */}
                            <div className={`flex items-center gap-1.5 text-sm font-medium ${statusInfo.color}`}>
                              <StatusIcon className="h-4 w-4" />
                              {statusInfo.label}
                            </div>

                            {/* Rank display */}
                            {myRank ? (
                              <div className="flex items-center gap-1.5 bg-primary/10 rounded-full px-3 py-1">
                                <Trophy className="h-3.5 w-3.5 text-primary" />
                                <span className="text-sm font-bold text-primary">
                                  {myRank}/{totalApplicants}
                                </span>
                              </div>
                            ) : (
                              <span className="text-xs text-muted-foreground">Rank pending</span>
                            )}
                          </>
                        )}
                      </div>
                    </div>

                    {/* Skills */}
                    {jobSkills.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {jobSkills.map((skill: string) => (
                          <Badge key={skill} variant="secondary" className="text-xs">{skill}</Badge>
                        ))}
                      </div>
                    )}

                    {/* Result section when applied */}
                    {isApplied && app?.ats_score != null && (
                      <div className="mt-2 p-3 rounded-lg bg-secondary/50 text-sm">
                        <span className="text-muted-foreground">ATS Match Score: </span>
                        <span className="font-semibold text-foreground">{app.ats_score}%</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default JobsPage;
