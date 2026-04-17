// @ts-nocheck
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Eye, Trash2, Briefcase, MapPin, Users } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";

export default function Jobs() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { company } = useAuth();
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const { data: jobs = [], isLoading } = useQuery({
    queryKey: ["jobs", company?.id],
    queryFn: async () => {
      if (!company?.id) return [];
      const { data, error } = await supabase
        .from("jobs")
        .select("*")
        .eq("company_id", company.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!company?.id,
  });

  const deleteJob = useMutation({
    mutationFn: async (id: string) => {
      const { error, count } = await supabase
        .from("jobs")
        .delete({ count: 'exact' })
        .eq("id", id);
      if (error) throw error;
      if (count === 0) throw new Error("You do not have permission to delete this job or it doesn't exist.");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      toast.success("Job deleted");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete job");
    }
  });

  const filtered = jobs.filter((j) => {
    if (statusFilter !== "all" && j.status !== statusFilter) return false;
    if (typeFilter !== "all" && j.job_type !== typeFilter) return false;
    return true;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Hero header */}
        <div className="rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-heading font-bold">Job Openings</h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              {jobs.length} total · {jobs.filter((j: any) => j.status === "active").length} active
            </p>
          </div>
          <Button onClick={() => navigate("/jobs/create")} className="gap-2 w-full sm:w-auto">
            <Plus className="h-4 w-4" /> Create Job
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[160px]"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full sm:w-[160px]"><SelectValue placeholder="Type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="full-time">Full-time</SelectItem>
              <SelectItem value="internship">Internship</SelectItem>
              <SelectItem value="freelance">Freelance</SelectItem>
              <SelectItem value="part-time">Part-time</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <p className="text-muted-foreground text-sm">Loading...</p>
        ) : filtered.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Briefcase className="h-10 w-10 mx-auto text-muted-foreground opacity-40 mb-3" />
              <p className="text-muted-foreground">No jobs found. Create your first job posting!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((job) => (
              <Card key={job.id} className="hover:shadow-md hover:border-primary/40 transition-all group overflow-hidden">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <div className="h-10 w-10 shrink-0 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Briefcase className="h-5 w-5 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-heading font-semibold truncate">{job.title}</h3>
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground mt-1">
                          <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{job.location || "Remote"}</span>
                          <span>·</span>
                          <span className="capitalize">{job.work_mode}</span>
                          <span>·</span>
                          <span className="capitalize">{job.job_type}</span>
                        </div>
                      </div>
                    </div>
                    <Badge variant={job.status === "active" ? "default" : "secondary"} className="capitalize shrink-0">
                      {job.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 pt-3 border-t border-border/60">
                    <Button variant="outline" size="sm" className="flex-1 gap-1" onClick={() => navigate(`/jobs/${job.id}`)}>
                      <Eye className="h-3.5 w-3.5" /> View
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1 gap-1" onClick={() => navigate(`/jobs/${job.id}/candidates`)}>
                      <Users className="h-3.5 w-3.5" /> Candidates
                    </Button>
                    <Button variant="ghost" size="icon" className="shrink-0" onClick={() => deleteJob.mutate(job.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
