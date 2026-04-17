// @ts-nocheck
import { useState } from "react";
import Navbar from "@/components/Navbar";
import LeftSidebar from "@/components/LeftSidebar";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { Plus, ExternalLink, Brain, Trash2, GitBranch, FolderGit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useSkillExtractor } from "@/hooks/useSkillExtractor";
import { formatTechStackForStorage, isGitHubRepoLink, joinTechStack, normalizeTechStack, saveExtractedSkills } from "@/lib/profile-data";
import { toast } from "sonner";

type ProjectFormState = {
  title: string;
  description: string;
  tech_stack: string;
  github_link?: string;
  project_link?: string;
  start_date: string;
};

interface FormCardProps {
  title: string;
  form: ProjectFormState;
  saving: boolean;
  icon: typeof GitBranch;
  linkLabel: string;
  onSave: () => void;
  onCancel: () => void;
  onChange: (field: keyof ProjectFormState, value: string) => void;
}

const ProjectFormCard = ({ title, icon: Icon, form, saving, linkLabel, onSave, onCancel, onChange }: FormCardProps) => {
  const linkField = linkLabel === "GitHub Repo Link" ? "github_link" : "project_link";

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Icon className="h-5 w-5 text-primary" /> {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Input placeholder="Title *" value={form.title} onChange={(e) => onChange("title", e.target.value)} />
        <Textarea placeholder="Description" value={form.description} onChange={(e) => onChange("description", e.target.value)} rows={3} />
        <Input placeholder="Tech Stack (comma separated)" value={form.tech_stack} onChange={(e) => onChange("tech_stack", e.target.value)} />
        <Input placeholder={linkLabel} value={form[linkField] || ""} onChange={(e) => onChange(linkField, e.target.value)} />
        <Input type="date" placeholder="Date" value={form.start_date} onChange={(e) => onChange("start_date", e.target.value)} />
        <div className="flex gap-2">
          <Button type="button" onClick={onSave} disabled={saving}>{saving ? "Saving..." : title === "Add GitHub Repo" ? "Add Repo" : "Add Project"}</Button>
          <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        </div>
      </CardContent>
    </Card>
  );
};

const ProjectsPage = () => {
  const { user, loading: authLoading } = useAuth();
  const { projects, refetch } = useProfile();
  const { extractSkills } = useSkillExtractor();
  const [extractingProj, setExtractingProj] = useState<string | null>(null);
  const [deletingProj, setDeletingProj] = useState<string | null>(null);

  // Form states
  const [showRepoForm, setShowRepoForm] = useState(false);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [repoForm, setRepoForm] = useState({ title: "", description: "", tech_stack: "", github_link: "", start_date: "" });
  const [projectForm, setProjectForm] = useState({ title: "", description: "", tech_stack: "", project_link: "", start_date: "" });
  const [saving, setSaving] = useState(false);
  const [justAdded, setJustAdded] = useState<string | null>(null);

  if (authLoading) return <div className="min-h-screen bg-background flex items-center justify-center"><p className="text-muted-foreground">Loading...</p></div>;
  if (!user) return <Navigate to="/auth" replace />;

  const handleAddRepo = async () => {
    if (!repoForm.title || !repoForm.github_link) { toast.error("Title and GitHub link are required"); return; }
    setSaving(true);
    try {
      const { data, error } = await supabase.from("projects").insert({
        user_id: user.id,
        title: repoForm.title,
        description: repoForm.description,
        tech_stack: formatTechStackForStorage(repoForm.tech_stack),
        project_link: repoForm.github_link,
        start_date: repoForm.start_date || null,
      }).select().single();
      if (error) throw error;
      toast.success("Repository added!");
      setJustAdded(data.id);
      setShowRepoForm(false);
      setRepoForm({ title: "", description: "", tech_stack: "", github_link: "", start_date: "" });
      refetch();
    } catch (err: any) { toast.error(err.message); }
    finally { setSaving(false); }
  };

  const handleAddProject = async () => {
    if (!projectForm.title) { toast.error("Title is required"); return; }
    setSaving(true);
    try {
      const { data, error } = await supabase.from("projects").insert({
        user_id: user.id,
        title: projectForm.title,
        description: projectForm.description,
        tech_stack: formatTechStackForStorage(projectForm.tech_stack),
        project_link: projectForm.project_link || null,
        start_date: projectForm.start_date || null,
      }).select().single();
      if (error) throw error;
      toast.success("Project added!");
      setJustAdded(data.id);
      setShowProjectForm(false);
      setProjectForm({ title: "", description: "", tech_stack: "", project_link: "", start_date: "" });
      refetch();
    } catch (err: any) { toast.error(err.message); }
    finally { setSaving(false); }
  };

  const handleExtractSkills = async (project: any) => {
    setExtractingProj(project.id);
    try {
      const content = `${project.title} ${project.description || ""} ${joinTechStack(project.tech_stack)}`.trim();
      if (!content) throw new Error("No content to analyze");
      const result = await extractSkills(content);
      if (result?.skills?.length && user) {
        const insertedCount = await saveExtractedSkills(user.id, result.skills);
        refetch();
        toast.success(insertedCount > 0 ? `Added ${insertedCount} skills from project` : "Skills were extracted, but all were already in your profile");
      } else {
        toast.error("No skills were detected from this project");
      }
      setJustAdded(null);
    } catch (error: any) { toast.error(error.message || "Failed to extract skills"); }
    finally { setExtractingProj(null); }
  };

  const handleDeleteProject = async (projectId: string) => {
    setDeletingProj(projectId);
    try {
      const { error } = await supabase.from("projects").delete().eq("id", projectId);
      if (error) throw error;
      refetch();
      toast.success("Project deleted");
    } catch { toast.error("Failed to delete"); }
    finally { setDeletingProj(null); }
  };

  const updateRepoForm = (field: keyof ProjectFormState, value: string) => {
    setRepoForm((current) => ({ ...current, [field]: value }));
  };

  const updateProjectForm = (field: keyof ProjectFormState, value: string) => {
    setProjectForm((current) => ({ ...current, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-56 md:w-64 flex-shrink-0">
            <div className="md:sticky md:top-20 overflow-visible md:overflow-y-auto md:max-h-[calc(100vh-5rem)] scrollbar-hide">
              <LeftSidebar />
            </div>
          </div>

          <div className="flex-1 min-w-0 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-foreground">Projects</h1>
                <p className="text-muted-foreground text-sm">Manage projects and extract skills</p>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => { setShowRepoForm(true); setShowProjectForm(false); }} variant="outline" className="gap-1.5">
                  <GitBranch className="h-4 w-4" /> Add GitHub Repo
                </Button>
                <Button onClick={() => { setShowProjectForm(true); setShowRepoForm(false); }} className="gap-1.5">
                  <Plus className="h-4 w-4" /> Add Project
                </Button>
              </div>
            </div>

            {/* Add Repo Form */}
            {showRepoForm && (
               <ProjectFormCard
                 title="Add GitHub Repo" icon={GitBranch} form={repoForm}
                 saving={saving}
                 onSave={handleAddRepo} onCancel={() => setShowRepoForm(false)} linkLabel="GitHub Repo Link"
                 onChange={updateRepoForm}
              />
            )}

            {/* Add Project Form */}
            {showProjectForm && (
               <ProjectFormCard
                 title="Add Project" icon={FolderGit2} form={projectForm}
                 saving={saving}
                 onSave={handleAddProject} onCancel={() => setShowProjectForm(false)} linkLabel="Project Link"
                 onChange={updateProjectForm}
              />
            )}

            {projects.length === 0 && !showRepoForm && !showProjectForm ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <FolderGit2 className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No projects yet</h3>
                  <p className="text-muted-foreground text-center mb-4">Add GitHub repos or projects to showcase your work</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {projects.map((project) => {
                  const techStack = normalizeTechStack(project.tech_stack);
                  const isRepo = isGitHubRepoLink(project.project_link);

                  return (
                    <Card key={project.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {isRepo ? <GitBranch className="h-4 w-4 text-muted-foreground" /> : <FolderGit2 className="h-4 w-4 text-muted-foreground" />}
                            <h3 className="text-base font-semibold text-foreground">{project.title}</h3>
                          </div>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteProject(project.id)} disabled={deletingProj === project.id} className="h-8 w-8 p-0 text-destructive hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        {project.description && (
                          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{project.description}</p>
                        )}

                        {techStack.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-3">
                            {techStack.map((tech: string) => (
                              <Badge key={tech} variant="secondary" className="text-xs">{tech}</Badge>
                            ))}
                          </div>
                        )}

                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                          {project.start_date && <span>{new Date(project.start_date).toLocaleDateString()}</span>}
                        </div>

                        <div className="flex items-center gap-2">
                          {project.project_link && (
                            <a
                              href={project.project_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                            >
                              <ExternalLink className="h-3 w-3" />
                              {isRepo ? "Show Repo" : "Show Project"}
                            </a>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleExtractSkills(project)}
                            disabled={extractingProj === project.id}
                            className="gap-1 text-xs h-7"
                          >
                            <Brain className={`h-3 w-3 ${extractingProj === project.id ? "animate-pulse" : ""}`} />
                            {extractingProj === project.id ? "Extracting..." : "Add Skill"}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectsPage;
