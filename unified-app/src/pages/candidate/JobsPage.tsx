// @ts-nocheck
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const JobsPage = () => {
  const { user } = useAuth();

  const { data: jobs = [], isLoading, error } = useQuery({
    queryKey: ["jobs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("jobs")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const newJobs = useMemo(
    () => jobs.filter((job: any) => new Date(job.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000)),
    [jobs]
  );
  const appliedJobIds = useMemo(() => new Set<string>(), []);

  const handleApply = async (jobId: string) => {
    if (!user) {
      toast.error("Sign in before applying for jobs.");
      return;
    }

    try {
      const { error } = await supabase.from("applications").insert({
        job_id: jobId,
        user_id: user.id,
        status: "applied",
        created_at: new Date().toISOString(),
      });

      if (error) throw error;
      toast.success("Application submitted successfully.");
    } catch (err) {
      toast.error("Unable to apply right now. Please try again later.");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-12">
        <h1 className="text-2xl font-bold text-foreground mb-2">Jobs</h1>
        <p className="text-muted-foreground text-sm mb-8">
          The shared jobs feed shows active postings from the company dashboard.
        </p>

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
        ) : (
          <>
            {newJobs.length > 0 && (
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm text-primary">
                {newJobs.length} new job posting{newJobs.length > 1 ? "s" : ""} published in the last 24 hours.
              </div>
            )}
            {error ? (
              <Card>
                <CardContent className="p-6 text-sm text-destructive">Unable to load jobs: {(error as Error).message}</CardContent>
              </Card>
            ) : jobs.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center text-muted-foreground">
                  No active job postings were found. Check back after the company dashboard publishes listings.
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {jobs.map((job: any) => (
                  <Card key={job.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="text-xl font-semibold text-foreground">{job.title}</p>
                        <p className="text-sm text-muted-foreground mt-1">{job.company_name || "Company posting"} · {job.location || "Remote"}</p>
                        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{job.description || "No description available."}</p>
                      </div>
                      <div className="flex flex-wrap gap-3">
                        <span className="rounded-full border border-border bg-secondary px-3 py-1 text-xs text-muted-foreground capitalize">{job.job_type || "Full-time"}</span>
                        <span className="rounded-full border border-border bg-secondary px-3 py-1 text-xs text-muted-foreground capitalize">{job.status || "active"}</span>
                        <Button onClick={() => handleApply(job.id)}>{appliedJobIds.has(job.id) ? "Applied" : "Apply"}</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default JobsPage;
