// @ts-nocheck
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Plus, Trash2, GripVertical } from "lucide-react";

interface Skill {
  name: string;
  priority: number;
}

export default function CreateJob() {
  const navigate = useNavigate();
  const { company } = useAuth();
  const [loading, setLoading] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [jobType, setJobType] = useState("full-time");
  const [workMode, setWorkMode] = useState("onsite");

  const [skills, setSkills] = useState<Skill[]>([{ name: "", priority: 1 }]);
  const [githubEnabled, setGithubEnabled] = useState(false);
  const [githubWeight, setGithubWeight] = useState(1);
  const [kaggleEnabled, setKaggleEnabled] = useState(false);
  const [kaggleWeight, setKaggleWeight] = useState(1);
  const [leetcodeEnabled, setLeetcodeEnabled] = useState(false);
  const [leetcodeWeight, setLeetcodeWeight] = useState(1);

  const addSkill = () => setSkills([...skills, { name: "", priority: skills.length + 1 }]);
  const removeSkill = (index: number) => setSkills(skills.filter((_, i) => i !== index));
  const updateSkill = (index: number, field: keyof Skill, value: string | number) => {
    const updated = [...skills];
    updated[index] = { ...updated[index], [field]: value };
    setSkills(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company) {
      toast.error("Company profile is missing. Please sign out and sign back in, or recreate your account.");
      return;
    }
    setLoading(true);

    try {
      const { data: jobData, error } = await supabase.from("jobs").insert({
        company_id: company.id,
        title,
        description,
        location,
        job_type: jobType,
        work_mode: workMode,
        requirements: skills.filter((s) => s.name.trim()) as any,
        github_requirement: githubEnabled ? { enabled: true, weight: githubWeight } as any : null,
        kaggle_requirement: kaggleEnabled ? { enabled: true, weight: kaggleWeight } as any : null,
        leetcode_requirement: leetcodeEnabled ? { enabled: true, weight: leetcodeWeight } as any : null,
        priority_order: skills.filter((s) => s.name.trim()).map((s) => ({ skill: s.name, priority: s.priority })) as any,
        ats_config: { threshold: 70, auto_reject: false } as any,
        status: "active" as any,
      }).select("id").single();

      if (error || !jobData?.id) throw error || new Error("Failed to create job.");
      const jobId = jobData.id;

      const { data: candidates } = await supabase.from("profiles").select("user_id").not("user_id", "is", null);
      if (candidates?.length) {
        await supabase.from("notifications").insert(
          candidates.map((candidate) => ({
            company_id: company.id,
            message: `New job posted: ${title}`,
            is_read: false,
            metadata: {
              recipient_type: "candidate",
              recipient_id: candidate.user_id,
              job_id: jobId,
              type: "job_posting",
            },
            type: "job_posting",
            created_at: new Date().toISOString(),
          }))
        );
      }

      toast.success("Job created successfully!");
      navigate("/jobs");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto animate-fade-in">
        <h1 className="text-2xl font-heading font-bold mb-6">Create Job Opening</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="font-heading text-lg">Basic Information</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Job Title</Label>
                <Input required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Senior Frontend Engineer" />
              </div>
              <div className="space-y-2">
                <Label>Location</Label>
                <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="San Francisco, CA" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Job Type</Label>
                  <Select value={jobType} onValueChange={setJobType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full-time">Full-time</SelectItem>
                      <SelectItem value="part-time">Part-time</SelectItem>
                      <SelectItem value="internship">Internship</SelectItem>
                      <SelectItem value="freelance">Freelance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Work Mode</Label>
                  <Select value={workMode} onValueChange={setWorkMode}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="onsite">Onsite</SelectItem>
                      <SelectItem value="remote">Remote</SelectItem>
                      <SelectItem value="hybrid">Hybrid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="font-heading text-lg">Job Description</CardTitle></CardHeader>
            <CardContent>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the role, responsibilities, and what you're looking for..." rows={6} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="font-heading text-lg">Required Skills</CardTitle>
                <Button type="button" variant="outline" size="sm" onClick={addSkill} className="gap-1">
                  <Plus className="h-3 w-3" /> Add Skill
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {skills.map((skill, index) => (
                <div key={index} className="flex items-center gap-3">
                  <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                  <Input
                    value={skill.name}
                    onChange={(e) => updateSkill(index, "name", e.target.value)}
                    placeholder="e.g. React, Python, AWS..."
                    className="flex-1"
                  />
                  <div className="flex items-center gap-2 w-32">
                    <Label className="text-xs text-muted-foreground whitespace-nowrap">Priority</Label>
                    <Input
                      type="number"
                      min={1}
                      max={10}
                      value={skill.priority}
                      onChange={(e) => updateSkill(index, "priority", parseInt(e.target.value) || 1)}
                      className="w-16"
                    />
                  </div>
                  {skills.length > 1 && (
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeSkill(index)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="font-heading text-lg">Platform Requirements</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {[
                { label: "GitHub", enabled: githubEnabled, setEnabled: setGithubEnabled, weight: githubWeight, setWeight: setGithubWeight },
                { label: "Kaggle", enabled: kaggleEnabled, setEnabled: setKaggleEnabled, weight: kaggleWeight, setWeight: setKaggleWeight },
                { label: "LeetCode", enabled: leetcodeEnabled, setEnabled: setLeetcodeEnabled, weight: leetcodeWeight, setWeight: setLeetcodeWeight },
              ].map((platform) => (
                <div key={platform.label} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                  <div className="flex items-center gap-3">
                    <Switch checked={platform.enabled} onCheckedChange={platform.setEnabled} />
                    <span className="font-medium text-sm">{platform.label} Requirement</span>
                  </div>
                  {platform.enabled && (
                    <div className="flex items-center gap-2">
                      <Label className="text-xs text-muted-foreground">Weight</Label>
                      <Input
                        type="number"
                        min={1}
                        max={10}
                        value={platform.weight}
                        onChange={(e) => platform.setWeight(parseInt(e.target.value) || 1)}
                        className="w-16"
                      />
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="font-heading text-lg">ATS Configuration</CardTitle></CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">ATS scoring configuration will be available in a future update. Default settings will be applied.</p>
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button type="submit" disabled={loading}>{loading ? "Creating..." : "Create Job Opening"}</Button>
            <Button type="button" variant="outline" onClick={() => navigate("/jobs")}>Cancel</Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
