// @ts-nocheck
import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Plus, ExternalLink, Clock, CheckCircle2, Trash2, Target } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const LearningPage = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", link: "", deadline_start: "", deadline_end: "", target_hours: "2", proof: "" });

  const { data: goals = [], isLoading } = useQuery({
    queryKey: ["learning-goals", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("learning_goals")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const addMutation = useMutation({
    mutationFn: async () => {
      if (!form.title || !form.link) throw new Error("Title and link are required");
      const { error } = await supabase.from("learning_goals").insert({
        user_id: user!.id,
        title: form.title,
        link: form.link,
        deadline: form.deadline_end || null,
        proof: form.target_hours ? `Target: ${form.target_hours}hr/day | ${form.deadline_start} to ${form.deadline_end}` : null,
        completed: false,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["learning-goals"] });
      queryClient.invalidateQueries({ queryKey: ["learning-streak"] });
      setForm({ title: "", link: "", deadline_start: "", deadline_end: "", target_hours: "2", proof: "" });
      setShowForm(false);
      toast.success("Learning goal added!");
    },
    onError: (err: any) => toast.error(err.message),
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, completed }: { id: string; completed: boolean }) => {
      const { error } = await supabase.from("learning_goals").update({ completed: !completed }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["learning-goals"] });
      queryClient.invalidateQueries({ queryKey: ["learning-streak"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("learning_goals").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["learning-goals"] });
      queryClient.invalidateQueries({ queryKey: ["learning-streak"] });
      toast.success("Goal removed");
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <Link to="/" className="p-2 rounded-md hover:bg-secondary transition-colors">
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </Link>
          <h1 className="text-2xl font-bold text-foreground">Aspiring Learning</h1>
        </div>

        {goals.length === 0 && !showForm && (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground mb-4">No learning goals added yet.</p>
              <Button onClick={() => setShowForm(true)} className="gap-1.5">
                <Plus className="h-4 w-4" /> Add Learning Goal
              </Button>
            </CardContent>
          </Card>
        )}

        {(goals.length > 0 || showForm) && (
          <div className="space-y-4">
            {!showForm && (
              <Button onClick={() => setShowForm(true)} className="gap-1.5">
                <Plus className="h-4 w-4" /> Add Goal
              </Button>
            )}

            {showForm && (
              <Card className="animate-fade-in">
                <CardHeader>
                  <CardTitle className="text-lg">New Learning Goal</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Input placeholder="Goal title *" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                  <Input placeholder="Learning link (URL) *" value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} />
                  <div>
                    <p className="text-xs text-muted-foreground mb-1.5 flex items-center gap-1"><Clock className="h-3 w-3" /> Timeline</p>
                    <div className="grid grid-cols-2 gap-2">
                      <Input type="date" placeholder="Start date" value={form.deadline_start} onChange={(e) => setForm({ ...form, deadline_start: e.target.value })} />
                      <Input type="date" placeholder="End date" value={form.deadline_end} onChange={(e) => setForm({ ...form, deadline_end: e.target.value })} />
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1.5 flex items-center gap-1"><Target className="h-3 w-3" /> Target</p>
                    <div className="flex items-center gap-2">
                      <Input type="number" min="0.5" step="0.5" value={form.target_hours} onChange={(e) => setForm({ ...form, target_hours: e.target.value })} className="w-20" />
                      <span className="text-sm text-muted-foreground">hours / day</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => addMutation.mutate()} disabled={addMutation.isPending}>
                      {addMutation.isPending ? "Saving..." : "Save"}
                    </Button>
                    <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {goals.map((goal: any) => (
              <Card key={goal.id} className={goal.completed ? "opacity-70" : ""}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className={`text-sm font-semibold text-card-foreground ${goal.completed ? "line-through" : ""}`}>
                        {goal.title}
                      </p>
                      {goal.link && (
                        <a href={goal.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-primary mt-1 hover:underline">
                          <ExternalLink className="h-3 w-3" /> Learning Resource
                        </a>
                      )}
                      {goal.deadline && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                          <Clock className="h-3 w-3" /> Deadline: {goal.deadline}
                        </div>
                      )}
                      {goal.proof && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                          <Target className="h-3 w-3" /> {goal.proof}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => toggleMutation.mutate({ id: goal.id, completed: goal.completed })}
                        className={`p-1.5 rounded-md hover:bg-secondary transition-colors ${goal.completed ? "text-green-500" : "text-muted-foreground"}`}
                      >
                        <CheckCircle2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => deleteMutation.mutate(goal.id)}
                        className="p-1.5 rounded-md hover:bg-secondary text-destructive transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LearningPage;
