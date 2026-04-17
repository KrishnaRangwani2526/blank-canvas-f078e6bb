// @ts-nocheck
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Briefcase,
  Users,
  UserCheck,
  TrendingUp,
  Plus,
  ArrowUpRight,
  Sparkles,
  Activity,
  Target,
  Send,
} from "lucide-react";
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

  const activeJobs = jobs.filter((j: any) => j.status === "active").length;
  const shortlisted = applications.filter((a: any) => a.status === "shortlisted" || a.status === "selected").length;
  const offered = applications.filter((a: any) => a.status === "offered" || a.status === "accepted").length;
  const conversionRate = applications.length
    ? Math.round((offered / applications.length) * 100)
    : 0;

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Hero band */}
        <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-primary/10 via-background to-accent/30 p-6 md:p-8">
          <div className="absolute -top-12 -right-12 h-44 w-44 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-success/10 blur-3xl" />
          <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <Badge variant="secondary" className="mb-2 gap-1">
                <Sparkles className="h-3 w-3" /> Hiring Hub
              </Badge>
              <h1 className="text-2xl md:text-3xl font-heading font-bold">
                Welcome back, {company?.name || "Company"}
              </h1>
              <p className="text-sm text-muted-foreground mt-1 max-w-md">
                Track your pipeline at a glance — from open roles to offers sent.
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => navigate("/jobs/create")} className="gap-2">
                <Plus className="h-4 w-4" /> Post Job
              </Button>
              <Button variant="outline" onClick={() => navigate("/selected")} className="gap-2">
                <Send className="h-4 w-4" /> Send Offers
              </Button>
            </div>
          </div>
        </div>

        {/* Pipeline funnel */}
        <Card className="overflow-hidden">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
                  Hiring Pipeline
                </p>
                <h2 className="font-heading font-semibold text-lg">Funnel overview</h2>
              </div>
              <Badge variant="outline" className="gap-1">
                <Activity className="h-3 w-3" /> Live
              </Badge>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: "Active Jobs", value: activeJobs, icon: Briefcase, tint: "bg-primary/10 text-primary" },
                { label: "Applications", value: applications.length, icon: Users, tint: "bg-accent text-accent-foreground" },
                { label: "Shortlisted", value: shortlisted, icon: TrendingUp, tint: "bg-warning/10 text-warning" },
                { label: "Offered", value: offered, icon: UserCheck, tint: "bg-success/10 text-success" },
              ].map((s, i) => (
                <div
                  key={s.label}
                  className="relative rounded-xl border border-border bg-card p-4 hover:shadow-md transition-shadow"
                >
                  <div className={`inline-flex h-9 w-9 items-center justify-center rounded-lg ${s.tint}`}>
                    <s.icon className="h-4 w-4" />
                  </div>
                  <p className="text-2xl font-heading font-bold mt-3">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                  {i < 3 && (
                    <div className="hidden md:block absolute right-[-10px] top-1/2 -translate-y-1/2 z-10">
                      <div className="h-px w-5 bg-gradient-to-r from-border to-transparent" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Two-column innovation grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Active jobs (spans 2) */}
          <Card className="lg:col-span-2">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
                    Recent
                  </p>
                  <h2 className="font-heading font-semibold text-lg">Job Openings</h2>
                </div>
                <Button variant="ghost" size="sm" onClick={() => navigate("/jobs")} className="gap-1">
                  View all <ArrowUpRight className="h-3.5 w-3.5" />
                </Button>
              </div>
              {jobs.length === 0 ? (
                <div className="text-center py-10 border border-dashed border-border rounded-lg">
                  <Briefcase className="h-8 w-8 mx-auto text-muted-foreground opacity-40" />
                  <p className="text-sm text-muted-foreground mt-2">No jobs yet — post your first one.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {jobs.slice(0, 5).map((job: any) => {
                    const jobApps = applications.filter((a: any) => a.job_id === job.id).length;
                    return (
                      <div
                        key={job.id}
                        onClick={() => navigate(`/jobs/${job.id}`)}
                        className="group flex items-center gap-3 p-3 rounded-lg hover:bg-secondary/60 cursor-pointer transition-colors"
                      >
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Briefcase className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{job.title}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {job.location} · {job.work_mode} · {jobApps} applicant{jobApps === 1 ? "" : "s"}
                          </p>
                        </div>
                        <Badge
                          variant="secondary"
                          className={
                            job.status === "active"
                              ? "bg-success/10 text-success"
                              : "bg-muted text-muted-foreground"
                          }
                        >
                          {job.status}
                        </Badge>
                        <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Right: Conversion + Quick actions */}
          <div className="space-y-6">
            <Card className="bg-gradient-to-br from-primary/5 to-success/5 border-primary/20">
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="h-4 w-4 text-primary" />
                  <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
                    Offer Conversion
                  </p>
                </div>
                <div className="flex items-end gap-2">
                  <p className="text-4xl font-heading font-bold">{conversionRate}%</p>
                  <p className="text-xs text-muted-foreground mb-1.5">of applications</p>
                </div>
                <div className="mt-4 h-2 w-full rounded-full bg-secondary overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-success transition-all"
                    style={{ width: `${Math.min(conversionRate, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  {offered} offers sent across {applications.length} applications
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5 space-y-2">
                <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-2">
                  Quick Actions
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-between"
                  onClick={() => navigate("/selected")}
                >
                  Selected Candidates <ArrowUpRight className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-between"
                  onClick={() => navigate("/jobs")}
                >
                  Manage Jobs <ArrowUpRight className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-between"
                  onClick={() => navigate("/employees")}
                >
                  Team Directory <ArrowUpRight className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-between"
                  onClick={() => navigate("/requests")}
                >
                  Requests <ArrowUpRight className="h-3.5 w-3.5" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent activity ticker */}
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
                  Activity
                </p>
                <h2 className="font-heading font-semibold text-lg">Latest Applications</h2>
              </div>
              <Badge variant="outline">{applications.length} total</Badge>
            </div>
            {applications.length === 0 ? (
              <p className="text-sm text-muted-foreground py-6 text-center">No applications yet.</p>
            ) : (
              <div className="divide-y divide-border">
                {applications.slice(0, 6).map((app: any) => (
                  <div key={app.id} className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">
                          New application · {app.jobs?.title || "Job"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(app.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="capitalize text-xs">
                      {app.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
