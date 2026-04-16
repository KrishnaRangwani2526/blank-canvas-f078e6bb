// @ts-nocheck
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Briefcase, Users, UserCheck, TrendingUp, Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const { company } = useAuth();
  const navigate = useNavigate();

  const { data: jobs = [] } = useQuery({
    queryKey: ["jobs", company?.id],
    queryFn: async () => {
      if (!company?.id) return [];
      const { data } = await supabase
        .from("jobs")
        .select("*")
        .eq("company_id", company.id)
        .order("created_at", { ascending: false });
      return data || [];
    },
    enabled: !!company?.id,
  });

  const { data: employees = [] } = useQuery({
    queryKey: ["employees", company?.id],
    queryFn: async () => {
      if (!company?.id) return [];
      const { data } = await supabase
        .from("employees")
        .select("*")
        .eq("company_id", company.id);
      return data || [];
    },
    enabled: !!company?.id,
  });

  const { data: applications = [] } = useQuery({
    queryKey: ["applications", company?.id],
    queryFn: async () => {
      if (!company?.id) return [];
      const { data } = await supabase
        .from("applications")
        .select("*, jobs!inner(*)")
        .eq("jobs.company_id", company.id)
        .order("created_at", { ascending: false });
      return data || [];
    },
    enabled: !!company?.id,
  });

  const activeJobs = jobs.filter((j) => j.status === "active").length;

  const stats = [
    { label: "Active Jobs", value: activeJobs, icon: Briefcase, color: "text-primary" },
    { label: "Total Applications", value: applications.length, icon: Users, color: "text-success" },
    { label: "Employees", value: employees.length, icon: UserCheck, color: "text-warning" },
    { label: "Shortlisted", value: applications.filter((a) => a.status === "shortlisted").length, icon: TrendingUp, color: "text-primary" },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-heading font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground text-sm">Welcome back, {company?.name || "Company"}</p>
          </div>
          <Button onClick={() => navigate("/jobs/create")} className="gap-2">
            <Plus className="h-4 w-4" /> Post Job
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <Card key={stat.label}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-3xl font-heading font-bold mt-1">{stat.value}</p>
                  </div>
                  <stat.icon className={`h-8 w-8 ${stat.color} opacity-80`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-heading text-lg">Recent Job Openings</CardTitle>
            </CardHeader>
            <CardContent>
              {jobs.length === 0 ? (
                <p className="text-sm text-muted-foreground">No job openings yet. Create your first job posting!</p>
              ) : (
                <div className="space-y-3">
                  {jobs.slice(0, 5).map((job) => (
                    <div key={job.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                      <div>
                        <p className="font-medium text-sm">{job.title}</p>
                        <p className="text-xs text-muted-foreground">{job.location} · {job.work_mode} · {job.job_type}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${job.status === "active" ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}`}>
                        {job.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-heading text-lg">Recent Applications</CardTitle>
            </CardHeader>
            <CardContent>
              {applications.length === 0 ? (
                <p className="text-sm text-muted-foreground">No applications received yet.</p>
              ) : (
                <div className="space-y-3">
                  {applications.slice(0, 5).map((app) => (
                    <div key={app.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                      <div>
                        <p className="font-medium text-sm">Application #{app.id.slice(0, 8)}</p>
                        <p className="text-xs text-muted-foreground">{new Date(app.created_at).toLocaleDateString()}</p>
                      </div>
                      <span className="text-xs px-2 py-1 rounded-full bg-accent text-accent-foreground capitalize">{app.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={() => navigate("/jobs")}>View All Jobs</Button>
          <Button variant="outline" onClick={() => navigate("/candidates")}>Browse Candidates</Button>
          <Button variant="outline" onClick={() => navigate("/employees")}>Manage Team</Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
