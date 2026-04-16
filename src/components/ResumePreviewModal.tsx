import type { ResumeData } from "@/hooks/useResumeMaker";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Download } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

interface ResumePreviewModalProps {
  resume: ResumeData | null;
  loading: boolean;
}

export function ResumePreviewModal({ resume, loading }: ResumePreviewModalProps) {
  const resumeRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  const handleDownloadPDF = async () => {
    if (!resumeRef.current || !resume) return;
    setDownloading(true);
    try {
      const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
        import("jspdf"),
        import("html2canvas"),
      ]);

      const canvas = await html2canvas(resumeRef.current, {
        scale: 2,
        backgroundColor: "#ffffff",
        useCORS: true,
      });
      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const fileName = `${(resume.name || "resume").replace(/\s+/g, "_")}_Resume.pdf`;
      pdf.save(fileName);
      toast.success("Resume downloaded");
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Failed to download PDF");
    } finally {
      setDownloading(false);
    }
  };

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
    <div className="space-y-3">
      <div className="flex justify-end">
        <Button onClick={handleDownloadPDF} disabled={downloading} size="sm" className="gap-2">
          {downloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
          {downloading ? "Preparing..." : "Download PDF"}
        </Button>
      </div>
      <Card className="bg-card border-border overflow-hidden">
        <CardContent className="p-4 space-y-3 text-xs max-h-[600px] overflow-y-auto">
          <div ref={resumeRef} className="bg-white text-black p-6 space-y-3">
            {/* Header */}
            <div className="border-b border-gray-300 pb-2">
              <h1 className="text-lg font-bold">{resume.name}</h1>
              <div className="flex flex-wrap gap-2 text-[10px] text-gray-600 mt-0.5">
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
                <p className="font-bold uppercase text-[10px] mb-0.5">Professional Summary</p>
                <p className="text-[10px]">{resume.bio}</p>
              </div>
            )}

            {/* Skills */}
            {resume.skills.length > 0 && (
              <div>
                <p className="font-bold uppercase text-[10px] mb-0.5">Skills</p>
                <p className="text-[10px]">{resume.skills.slice(0, 12).join(" • ")}</p>
              </div>
            )}

            {/* Experience */}
            {resume.experience.length > 0 && (
              <div>
                <p className="font-bold uppercase text-[10px] mb-1">Experience</p>
                <div className="space-y-1">
                  {resume.experience.slice(0, 3).map((exp, i) => (
                    <div key={i} className="border-l-2 border-gray-400 pl-2">
                      <p className="font-semibold text-[10px]">{exp.role}</p>
                      <p className="text-gray-600 text-[9px]">{exp.company} • {exp.duration}</p>
                      {exp.description && <p className="text-[9px] mt-0.5 whitespace-pre-line">{exp.description}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Projects */}
            {resume.projects.length > 0 && (
              <div>
                <p className="font-bold uppercase text-[10px] mb-1">Projects</p>
                <div className="space-y-1">
                  {resume.projects.slice(0, 3).map((proj, i) => (
                    <div key={i} className="border-l-2 border-gray-400 pl-2">
                      <p className="font-semibold text-[10px]">{proj.name}</p>
                      <p className="text-gray-600 text-[9px]">{proj.description}</p>
                      {proj.tech && proj.tech.length > 0 && (
                        <p className="text-gray-500 text-[9px] italic">{proj.tech.join(", ")}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Certificates */}
            {resume.certificates && resume.certificates.length > 0 && (
              <div>
                <p className="font-bold uppercase text-[10px] mb-1">Certificates</p>
                <div className="space-y-0.5">
                  {resume.certificates.map((cert, i) => (
                    <div key={i} className="border-l-2 border-gray-400 pl-2">
                      <p className="font-semibold text-[10px]">{cert.title}</p>
                      <p className="text-gray-600 text-[9px]">{cert.issuer}{cert.date ? ` • ${cert.date}` : ""}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Education */}
            {resume.education.length > 0 && (
              <div>
                <p className="font-bold uppercase text-[10px] mb-1">Education</p>
                <div className="space-y-0.5">
                  {resume.education.slice(0, 3).map((edu, i) => (
                    <div key={i} className="border-l-2 border-gray-400 pl-2">
                      <p className="font-semibold text-[10px]">{edu.school}</p>
                      <p className="text-gray-600 text-[9px]">{edu.degree} • {edu.field} • {edu.year}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
