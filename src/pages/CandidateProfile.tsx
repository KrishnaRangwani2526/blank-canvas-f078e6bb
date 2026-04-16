// @ts-nocheck
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Code, FileText, Brain, BookOpen, BarChart3, Loader2 } from "lucide-react";
import { ATSResultModal } from "@/components/ATSResultModal";
import { ResumePreviewModal } from "@/components/ResumePreviewModal";
import { useCompanyATSAnalysis } from "@/hooks/useCompanyATSAnalysis";
import { useCompanyResumeGeneration } from "@/hooks/useCompanyResumeGeneration";

export default function CandidateProfile() {
  const { id } = useParams();
  const navigate = useNavigate();

  // State for showing analysis results
  const [showATSScore, setShowATSScore] = useState(false);
  const [showResume, setShowResume] = useState(false);
  const [showProfileATS, setShowProfileATS] = useState(false);

  // Hooks for company-side analysis
  const { analyzeCandidate: analyzeForMatch, result: atsMatchResult, loading: atsMatchLoading } = useCompanyATSAnalysis();
  const { analyzeCandidate: analyzeProfileOnly, result: profileATSResult, loading: profileATSLoading } = useCompanyATSAnalysis();
  const { generateCandidateResume, resume, loading: resumeLoading } = useCompanyResumeGeneration();

  const { data: candidate, isLoading } = useQuery({
    queryKey: ["candidate", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("candidates").select("*").eq("id", id!).single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  if (isLoading) return <DashboardLayout><p>Loading...</p></DashboardLayout>;
  if (!candidate) return <DashboardLayout><p>Candidate not found</p></DashboardLayout>;

  const projects = (candidate.projects as any[]) || [];
  const education = (candidate.education as any[]) || [];
  const experience = (candidate.experience as any[]) || [];

  const handleATSScore = async () => {
    setShowATSScore(true);
    setShowResume(false);
    setShowProfileATS(false);
    await analyzeForMatch(candidate.id);
  };

  const handleResume = async () => {
    setShowResume(true);
    setShowATSScore(false);
    setShowProfileATS(false);
    await generateCandidateResume(candidate.id);
  };

  const handleCandidateATS = async () => {
    setShowProfileATS(true);
    setShowATSScore(false);
    setShowResume(false);
    await analyzeProfileOnly(candidate.id);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <Button variant="ghost" onClick={() => navigate("/candidates")} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Back to Candidates
        </Button>

        <div className="flex items-start gap-4">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-2xl font-bold text-primary">{candidate.name[0]}</span>
          </div>
          <div>
            <h1 className="text-2xl font-heading font-bold">{candidate.name}</h1>
            <p className="text-muted-foreground">{candidate.email}</p>
            {candidate.bio && <p className="text-sm mt-1">{candidate.bio}</p>}
          </div>
        </div>

        {/* HR Action Buttons */}
        <div className="flex flex-wrap gap-2">
          <Button 
            variant={showATSScore ? "default" : "outline"} 
            className="gap-2" 
            onClick={handleATSScore}
            disabled={atsMatchLoading}
          >
            {atsMatchLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <BarChart3 className="h-4 w-4" />}
            {atsMatchLoading ? "Analyzing..." : "Calculate ATS Score"}
          </Button>
          <Button 
            variant={showResume ? "default" : "outline"} 
            className="gap-2" 
            onClick={handleResume}
            disabled={resumeLoading}
          >
            {resumeLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
            {resumeLoading ? "Generating..." : "View Resume"}
          </Button>
          <Button 
            variant={showProfileATS ? "default" : "outline"} 
            className="gap-2" 
            onClick={handleCandidateATS}
            disabled={profileATSLoading}
          >
            {profileATSLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Brain className="h-4 w-4" />}
            {profileATSLoading ? "Analyzing..." : "Candidate ATS"}
          </Button>
        </div>

        {/* Analysis Results */}
        {(showATSScore || showResume || showProfileATS) && (
          <Card className="bg-card border-border p-4">
            {showATSScore && <ATSResultModal result={atsMatchResult} loading={atsMatchLoading} title="ATS Match Score" />}
            {showResume && <ResumePreviewModal resume={resume} loading={resumeLoading} />}
            {showProfileATS && <ATSResultModal result={profileATSResult} loading={profileATSLoading} title="Candidate ATS Profile" />}
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {candidate.about && (
              <Card>
                <CardHeader><CardTitle className="font-heading">About</CardTitle></CardHeader>
                <CardContent><p className="text-sm">{candidate.about}</p></CardContent>
              </Card>
            )}

            <Card>
              <CardHeader><CardTitle className="font-heading">Skills</CardTitle></CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {(candidate.skills || []).map((skill) => (
                    <Badge key={skill} variant="secondary">{skill}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="font-heading">Experience</CardTitle></CardHeader>
              <CardContent>
                {experience.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No experience listed.</p>
                ) : (
                  <div className="space-y-4">
                    {experience.map((exp: any, i: number) => (
                      <div key={i} className="border-l-2 border-primary/20 pl-4">
                        <p className="font-medium">{exp.role}</p>
                        <p className="text-sm text-muted-foreground">{exp.company}</p>
                        <p className="text-xs text-muted-foreground">{exp.startDate} — {exp.endDate || "Present"}</p>
                        {exp.description && <p className="text-sm mt-1">{exp.description}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="font-heading">Projects</CardTitle></CardHeader>
              <CardContent>
                {projects.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No projects listed.</p>
                ) : (
                  <div className="space-y-3">
                    {projects.map((proj: any, i: number) => (
                      <div key={i} className="p-3 rounded-lg bg-secondary/50">
                        <p className="font-medium">{proj.title}</p>
                        <p className="text-sm text-muted-foreground">{proj.description}</p>
                        {proj.link && <a href={proj.link} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">View Project →</a>}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader><CardTitle className="font-heading text-lg">Education</CardTitle></CardHeader>
              <CardContent>
                {education.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No education listed.</p>
                ) : (
                  <div className="space-y-3">
                    {education.map((edu: any, i: number) => (
                      <div key={i}>
                        <p className="font-medium text-sm">{edu.school}</p>
                        <p className="text-xs text-muted-foreground">{edu.degree} in {edu.field}</p>
                        <p className="text-xs text-muted-foreground">{edu.startDate} — {edu.endDate}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="font-heading text-lg">Links</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {candidate.github_url && <a href={candidate.github_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-primary hover:underline"><Code className="h-4 w-4" /> GitHub</a>}
                {candidate.kaggle_url && <a href={candidate.kaggle_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-primary hover:underline"><BookOpen className="h-4 w-4" /> Kaggle</a>}
                {candidate.leetcode_url && <a href={candidate.leetcode_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-primary hover:underline"><BarChart3 className="h-4 w-4" /> LeetCode</a>}
                {!candidate.github_url && !candidate.kaggle_url && !candidate.leetcode_url && <p className="text-sm text-muted-foreground">No links provided.</p>}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
