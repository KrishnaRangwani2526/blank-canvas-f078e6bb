import type { ResumeData } from "@/hooks/useResumeMaker";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useRef } from "react";

interface ResumePreviewModalProps {
  resume: ResumeData | null;
  loading: boolean;
}

export function ResumePreviewModal({ resume, loading }: ResumePreviewModalProps) {
  const resumeRef = useRef<HTMLDivElement>(null);

  if (!resume && !loading) return null;

  if (loading) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="p-8 text-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto mb-2" />
          <p className="text-xs text-muted-foreground">Generating resume...</p>
        </CardContent>
      </Card>
    );
  }

  if (!resume) return null;

  return (
    <Card className="bg-card border-border overflow-hidden" ref={resumeRef}>
      <CardContent className="p-4 space-y-3 text-xs max-h-80 overflow-y-auto">
        {/* Header */}
        <div className="border-b pb-2">
          <h1 className="text-sm font-bold text-foreground">{resume.name}</h1>
          <div className="flex flex-wrap gap-2 text-[10px] text-muted-foreground mt-0.5">
            {resume.email && <span>{resume.email}</span>}
            {resume.phone && <span>•</span>}
            {resume.phone && <span>{resume.phone}</span>}
            {resume.location && <span>•</span>}
            {resume.location && <span>{resume.location}</span>}
          </div>
        </div>

        {/* Professional Summary */}
        {resume.bio && (
          <div>
            <p className="font-bold text-foreground uppercase text-[10px] mb-0.5">Professional Summary</p>
            <p className="text-foreground text-[10px]">{resume.bio}</p>
          </div>
        )}

        {/* Skills */}
        {resume.skills.length > 0 && (
          <div>
            <p className="font-bold text-foreground uppercase text-[10px] mb-0.5">Skills</p>
            <p className="text-foreground text-[10px]">{resume.skills.slice(0, 12).join(" • ")}</p>
          </div>
        )}

        {/* Experience */}
        {resume.experience.length > 0 && (
          <div>
            <p className="font-bold text-foreground uppercase text-[10px] mb-1">Experience</p>
            <div className="space-y-1">
              {resume.experience.slice(0, 3).map((exp, i) => (
                <div key={i} className="border-l border-primary/30 pl-2">
                  <p className="font-semibold text-foreground text-[10px]">{exp.role}</p>
                  <p className="text-muted-foreground text-[9px]">{exp.company}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Projects */}
        {resume.projects.length > 0 && (
          <div>
            <p className="font-bold text-foreground uppercase text-[10px] mb-1">Projects</p>
            <div className="space-y-1">
              {resume.projects.slice(0, 2).map((proj, i) => (
                <div key={i} className="border-l border-accent/30 pl-2">
                  <p className="font-semibold text-foreground text-[10px]">{proj.name}</p>
                  <p className="text-muted-foreground text-[9px]">{proj.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education */}
        {resume.education.length > 0 && (
          <div>
            <p className="font-bold text-foreground uppercase text-[10px] mb-1">Education</p>
            <div className="space-y-0.5">
              {resume.education.slice(0, 2).map((edu, i) => (
                <div key={i} className="border-l border-secondary/50 pl-2">
                  <p className="font-semibold text-foreground text-[10px]">{edu.school}</p>
                  <p className="text-muted-foreground text-[9px]">{edu.degree}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
