// @ts-nocheck
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Briefcase, ChevronRight, FileText, Send, ArrowLeft, Mail, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export default function SelectedCandidates() {
  const { company } = useAuth();
  const queryClient = useQueryClient();
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [offerOpen, setOfferOpen] = useState(false);
  const [activeApp, setActiveApp] = useState<any>(null);
  const [offerForm, setOfferForm] = useState({
    role: "",
    salary: "",
    startDate: "",
    message: "",
  });
  const [sending, setSending] = useState(false);

  // Fetch jobs for this company
  const { data: jobs = [], isLoading: jobsLoading } = useQuery({
    queryKey: ["selected-jobs", company?.id],
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

  // Fetch selected/shortlisted/offered applications for active job
  const { data: candidates = [], isLoading: candLoading } = useQuery({
    queryKey: ["selected-candidates", activeJobId],
    queryFn: async () => {
      if (!activeJobId) return [];
      const { data: apps } = await supabase
        .from("applications")
        .select("*")
        .eq("job_id", activeJobId)
        .in("status", ["selected", "shortlisted", "offered", "accepted"])
        .order("ats_score", { ascending: false });

      if (!apps || apps.length === 0) return [];

      // Hydrate candidate info
      const userIds = apps.map((a: any) => a.user_id).filter(Boolean);
      const candidateIds = apps.map((a: any) => a.candidate_id).filter(Boolean);

      const [{ data: profiles }, { data: cands }] = await Promise.all([
        supabase.from("profiles").select("*").in("user_id", userIds.length ? userIds : ["__none__"]),
        supabase.from("candidates").select("*").in("id", candidateIds.length ? candidateIds : ["__none__"]),
      ]);

      return apps.map((a: any) => {
        const prof = profiles?.find((p: any) => p.user_id === a.user_id || p.id === a.user_id);
        const cand = cands?.find((c: any) => c.id === a.candidate_id);
        return {
          ...a,
          name: cand?.name || prof?.full_name || prof?.display_name || a.candidate_name || "Candidate",
          email: cand?.email || prof?.email || a.candidate_email || "Not Provided",
          avatar_url: cand?.avatar_url || prof?.avatar_url || "",
        };
      });
    },
    enabled: !!activeJobId,
  });

  const activeJob = jobs.find((j: any) => j.id === activeJobId);

  const openOfferDialog = (app: any) => {
    setActiveApp(app);
    setOfferForm({
      role: activeJob?.title || "",
      salary: activeJob?.salary_range || "",
      startDate: new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0],
      message: `Dear ${app.name},\n\nWe are delighted to extend an offer for the position of ${activeJob?.title} at ${company?.name}. Based on your strong performance throughout our evaluation process, we believe you will be a great addition to our team.\n\nPlease review the details below and confirm your acceptance.\n\nBest regards,\n${company?.name} Hiring Team`,
    });
    setOfferOpen(true);
  };

  const generateOfferPDF = async () => {
    const [{ default: jsPDF }] = await Promise.all([import("jspdf")]);
    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const margin = 20;
    let y = 25;

    // Header
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(20);
    pdf.text(company?.name || "Company", pageWidth / 2, y, { align: "center" });
    y += 8;
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    pdf.text("Official Offer Letter", pageWidth / 2, y, { align: "center" });
    y += 4;
    pdf.setDrawColor(180);
    pdf.line(margin, y, pageWidth - margin, y);
    y += 12;

    pdf.setFontSize(11);
    pdf.text(`Date: ${new Date().toLocaleDateString()}`, margin, y);
    y += 10;

    pdf.setFont("helvetica", "bold");
    pdf.text(`To: ${activeApp.name}`, margin, y);
    y += 6;
    pdf.setFont("helvetica", "normal");
    if (activeApp.email) {
      pdf.text(activeApp.email, margin, y);
      y += 6;
    }
    y += 6;

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(14);
    pdf.text(`Subject: Offer for ${offerForm.role}`, margin, y);
    y += 10;

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(11);
    const messageLines = pdf.splitTextToSize(offerForm.message, pageWidth - 2 * margin);
    pdf.text(messageLines, margin, y);
    y += messageLines.length * 5 + 8;

    // Details box
    pdf.setDrawColor(100);
    pdf.setFillColor(245, 245, 250);
    pdf.rect(margin, y, pageWidth - 2 * margin, 38, "FD");
    y += 8;
    pdf.setFont("helvetica", "bold");
    pdf.text("Offer Details", margin + 5, y);
    y += 7;
    pdf.setFont("helvetica", "normal");
    pdf.text(`Position: ${offerForm.role}`, margin + 5, y);
    y += 6;
    pdf.text(`Compensation: ${offerForm.salary || "To be discussed"}`, margin + 5, y);
    y += 6;
    pdf.text(`Proposed Start Date: ${offerForm.startDate}`, margin + 5, y);
    y += 14;

    pdf.setFont("helvetica", "italic");
    pdf.setFontSize(10);
    pdf.text("This offer is contingent upon successful completion of background verification.", margin, y);
    y += 12;

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(11);
    pdf.text("Sincerely,", margin, y);
    y += 6;
    pdf.text(company?.name || "Hiring Team", margin, y);

    const fileName = `Offer_${activeApp.name.replace(/\s+/g, "_")}_${offerForm.role.replace(/\s+/g, "_")}.pdf`;
    pdf.save(fileName);
  };

  const handleSendOffer = async () => {
    if (!activeApp) return;
    setSending(true);
    try {
      // 1. Generate PDF
      await generateOfferPDF();

      // 2. Update application status in DB
      const { error: updErr } = await supabase
        .from("applications")
        .update({ status: "offered", updated_at: new Date().toISOString() })
        .eq("id", activeApp.id);
      if (updErr) throw updErr;

      // 3. Create notification for the candidate (with metadata for accept/decline)
      if (activeApp.user_id) {
        await supabase.from("notifications").insert({
          user_id: activeApp.user_id,
          type: "offer",
          // title omitted — column not present in notifications schema
          message: `${company?.name} has sent you an offer for ${offerForm.role}. Compensation: ${offerForm.salary || "TBD"}. Start date: ${offerForm.startDate}.`,
          is_read: false,
          company_id: company?.id ?? null,
          metadata: {
            application_id: activeApp.id,
            job_id: activeJobId,
            company_id: company?.id,
            company_name: company?.name,
            role: offerForm.role,
            salary: offerForm.salary,
            start_date: offerForm.startDate,
            status: "pending",
          },
        });
      }

      toast.success("Offer letter sent and PDF downloaded");
      setOfferOpen(false);
      queryClient.invalidateQueries({ queryKey: ["selected-candidates", activeJobId] });
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Failed to send offer");
    } finally {
      setSending(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {!activeJobId ? (
          <>
            <div>
              <h1 className="text-2xl font-heading font-bold">Selected Candidates</h1>
              <p className="text-muted-foreground text-sm">
                Choose a job opening to view shortlisted candidates and send offer letters.
              </p>
            </div>

            {jobsLoading ? (
              <p className="text-muted-foreground text-sm">Loading jobs…</p>
            ) : jobs.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Briefcase className="h-10 w-10 mx-auto text-muted-foreground opacity-50" />
                  <p className="mt-3 text-muted-foreground">No jobs posted yet.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {jobs.map((job: any) => (
                  <Card
                    key={job.id}
                    className="cursor-pointer hover:border-primary transition-all hover:shadow-md group"
                    onClick={() => setActiveJobId(job.id)}
                  >
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <Briefcase className="h-4 w-4 text-primary" />
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
                          </div>
                          <h3 className="font-heading font-semibold mt-2 truncate">{job.title}</h3>
                          <p className="text-xs text-muted-foreground mt-1 truncate">
                            {job.location} · {job.work_mode}
                          </p>
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="sm" onClick={() => setActiveJobId(null)}>
                  <ArrowLeft className="h-4 w-4 mr-1" /> Back
                </Button>
                <div>
                  <h1 className="text-xl font-heading font-bold">{activeJob?.title}</h1>
                  <p className="text-xs text-muted-foreground">Selected & shortlisted candidates</p>
                </div>
              </div>
            </div>

            {candLoading ? (
              <p className="text-muted-foreground text-sm">Loading candidates…</p>
            ) : candidates.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <FileText className="h-10 w-10 mx-auto text-muted-foreground opacity-50" />
                  <p className="mt-3 text-muted-foreground">No selected candidates yet.</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Mark candidates as "selected" or "shortlisted" from the Jobs page to see them here.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {candidates.map((c: any) => (
                  <Card key={c.id} className="hover:shadow-md hover:border-primary/40 transition-all overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className="h-11 w-11 shrink-0 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-primary-foreground font-semibold shadow-sm">
                            {c.name?.[0]?.toUpperCase() || "C"}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-medium truncate">{c.name}</p>
                            <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
                              <Mail className="h-3 w-3 shrink-0" />
                              <span className="truncate">{c.email || "hr@gmail.com"}</span>
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap sm:justify-end">
                          {c.ats_score != null && (
                            <Badge variant="outline" className="text-xs">
                              ATS {c.ats_score}
                            </Badge>
                          )}
                          <Badge
                            className={
                              c.status === "offered" || c.status === "accepted"
                                ? "bg-success/10 text-success"
                                : "bg-primary/10 text-primary"
                            }
                          >
                            {c.status === "offered" && <CheckCircle2 className="h-3 w-3 mr-1" />}
                            {c.status}
                          </Badge>
                          <Button
                            size="sm"
                            disabled={c.status === "offered" || c.status === "accepted"}
                            onClick={() => openOfferDialog(c)}
                            className="gap-1 ml-auto sm:ml-0"
                          >
                            <Send className="h-3.5 w-3.5" />
                            {c.status === "offered" || c.status === "accepted" ? "Sent" : "Send Offer"}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Offer Dialog */}
      <Dialog open={offerOpen} onOpenChange={setOfferOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-heading">Send Offer Letter</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label htmlFor="role">Role</Label>
              <Input
                id="role"
                value={offerForm.role}
                onChange={(e) => setOfferForm({ ...offerForm, role: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="salary">Compensation</Label>
                <Input
                  id="salary"
                  placeholder="e.g. $90,000/year"
                  value={offerForm.salary}
                  onChange={(e) => setOfferForm({ ...offerForm, salary: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="start">Start date</Label>
                <Input
                  id="start"
                  type="date"
                  value={offerForm.startDate}
                  onChange={(e) => setOfferForm({ ...offerForm, startDate: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="msg">Message</Label>
              <Textarea
                id="msg"
                rows={6}
                value={offerForm.message}
                onChange={(e) => setOfferForm({ ...offerForm, message: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOfferOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSendOffer} disabled={sending} className="gap-1">
              <Send className="h-4 w-4" />
              {sending ? "Sending…" : "Send & Download PDF"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
