// @ts-nocheck
import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { toast } from "sonner";

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
        tech_stack: repoForm.tech_stack.split(",").map(s => s.trim()).filter(Boolean),
        github_link: repoForm.github_link,
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
        tech_stack: projectForm.tech_stack.split(",").map(s => s.trim()).filter(Boolean),
        project_link: projectForm.project_link,
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
      const content = `${project.title} ${project.description || ""} ${project.tech_stack?.join(" ") || ""}`.trim();
      if (!content) throw new Error("No content to analyze");
      const result = await extractSkills(content);
      if (result?.skills?.length && user) {
        const skillsToAdd = result.skills.map(s => ({ user_id: user.id, name: s.name }));
        await supabase.from("skills").upsert(skillsToAdd, { onConflict: "user_id,name", ignoreDuplicates: false });
        refetch();
        toast.success(`Added ${result.skills.length} skills from project`);
      }
      setJustAdded(null);
    } catch { toast.error("Failed to extract skills"); }
    finally { setExtractingProj(null); }
  };

  const handleDeleteProject = async (projectId: string) => {
    setDeletingProj(projectId);
    try {
      await supabase.from("projects").delete().eq("id", projectId);
      refetch();
      toast.success("Project deleted");
    } catch { toast.error("Failed to delete"); }
    finally { setDeletingProj(null); }
  };

  const FormCard = ({ title, icon: Icon, form, setForm, onSave, onCancel, linkLabel }: any) => (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Icon className="h-5 w-5 text-primary" /> {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Input placeholder="Title *" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
        <Textarea placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} />
        <Input placeholder="Tech Stack (comma separated)" value={form.tech_stack} onChange={e => setForm({ ...form, tech_stack: e.target.value })} />
        <Input placeholder={linkLabel} value={form[linkLabel === "GitHub Repo Link" ? "github_link" : "project_link"]}
          onChange={e => setForm({ ...form, [linkLabel === "GitHub Repo Link" ? "github_link" : "project_link"]: e.target.value })} />
        <Input type="date" placeholder="Date" value={form.start_date} onChange={e => setForm({ ...form, start_date: e.target.value })} />
        <div className="flex gap-2">
          <Button onClick={onSave} disabled={saving}>{saving ? "Saving..." : title === "Add GitHub Repo" ? "Add Repo" : "Add Project"}</Button>
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          <div className="w-56 md:w-64 flex-shrink-0">
            <div className="sticky top-20 overflow-y-auto max-h-[calc(100vh-5rem)] scrollbar-hide">
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
              <FormCard
                title="Add GitHub Repo" icon={GitBranch} form={repoForm} setForm={setRepoForm}
                onSave={handleAddRepo} onCancel={() => setShowRepoForm(false)} linkLabel="GitHub Repo Link"
              />
            )}

            {/* Add Project Form */}
            {showProjectForm && (
              <FormCard
                title="Add Project" icon={FolderGit2} form={projectForm} setForm={setProjectForm}
                onSave={handleAddProject} onCancel={() => setShowProjectForm(false)} linkLabel="Project Link"
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
                {projects.map((project) => (
                  <Card key={project.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {project.github_link ? <GitBranch className="h-4 w-4 text-muted-foreground" /> : <FolderGit2 className="h-4 w-4 text-muted-foreground" />}
                          <h3 className="text-base font-semibold text-foreground">{project.title}</h3>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteProject(project.id)} disabled={deletingProj === project.id} className="h-8 w-8 p-0 text-destructive hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      {project.description && (
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{project.description}</p>
                      )}

                      {project.tech_stack?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {project.tech_stack.map((tech) => (
                            <Badge key={tech} variant="secondary" className="text-xs">{tech}</Badge>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                        {project.start_date && <span>{new Date(project.start_date).toLocaleDateString()}</span>}
                      </div>

                      <div className="flex items-center gap-2">
                        {(project.github_link || project.project_link) && (
                          <a
                            href={project.github_link || project.project_link || "#"}
                            target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                          >
                            <ExternalLink className="h-3 w-3" />
                            {project.github_link ? "Show Repo" : "Show Project"}
                          </a>
                        )}
                        {/* Show "Add Skill" button if just added or always */}
                        <Button
                          size="sm" variant="outline"
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
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectsPage;
