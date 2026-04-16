import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Eye, Pencil, Trash2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Jobs() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const { data: jobs = [], isLoading } = useQuery({
    queryKey: ["jobs"],
    queryFn: async () => {
      const { data, error } = await supabase.from("jobs").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const deleteJob = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("jobs").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      toast.success("Job deleted");
    },
  });

  const filtered = jobs.filter((j) => {
    if (statusFilter !== "all" && j.status !== statusFilter) return false;
    if (typeFilter !== "all" && j.job_type !== typeFilter) return false;
    return true;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-heading font-bold">Job Openings</h1>
          <Button onClick={() => navigate("/jobs/create")} className="gap-2">
            <Plus className="h-4 w-4" /> Create Job
          </Button>
        </div>

        <div className="flex gap-3">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[140px]"><SelectValue placeholder="Type" /></SelectTrigger>
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
          <p className="text-muted-foreground">Loading...</p>
        ) : filtered.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground">No jobs found. Create your first job posting!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filtered.map((job) => (
              <Card key={job.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-5 flex items-center justify-between">
                  <div className="space-y-1">
                    <h3 className="font-heading font-semibold">{job.title}</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{job.location || "Remote"}</span>
                      <span>·</span>
                      <span className="capitalize">{job.work_mode}</span>
                      <span>·</span>
                      <span className="capitalize">{job.job_type}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={job.status === "active" ? "default" : "secondary"} className="capitalize">
                      {job.status}
                    </Badge>
                    <Button variant="ghost" size="icon" onClick={() => navigate(`/jobs/${job.id}`)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => navigate(`/jobs/${job.id}/edit`)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => deleteJob.mutate(job.id)}>
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
