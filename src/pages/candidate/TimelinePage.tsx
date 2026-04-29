// @ts-nocheck
import { useState } from "react";
import Navbar from "@/components/Navbar";
import { Plus, Trash2, Clock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const TimelinePage = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  const { data: tasks = [] } = useQuery({
    queryKey: ["timeline-tasks", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("timeline_tasks")
        .select("*")
        .eq("user_id", user.id)
        .order("start_time", { ascending: true });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  const addMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("timeline_tasks").insert({
        user_id: user.id,
        title,
        start_time: startTime,
        end_time: endTime,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["timeline-tasks"] });
      setTitle(""); setStartTime(""); setEndTime("");
    },
  });

  const removeMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("timeline_tasks").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["timeline-tasks"] }),
  });

  const addTask = () => {
    if (!title || !startTime || !endTime) return;
    addMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12">
        <h1 className="text-2xl font-bold text-foreground mb-6">Timeline Manager</h1>

        <div className="bg-card rounded-xl border p-6 mb-6">
          <h2 className="text-sm font-semibold text-foreground mb-3">Add Task</h2>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Task title" className="sm:col-span-2 px-3 py-2 rounded-lg border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
            <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="px-3 py-2 rounded-lg border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
            <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="px-3 py-2 rounded-lg border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <button onClick={addTask} disabled={addMutation.isPending} className="mt-3 flex w-full sm:w-auto items-center justify-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
            <Plus className="h-4 w-4" /> Add
          </button>
        </div>

        {tasks.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No tasks yet. Add your first task above.</p>
        ) : (
          <div className="space-y-3">
            {tasks.map((t: any) => (
              <div key={t.id} className="bg-card rounded-xl border p-4 flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <Clock className="h-4 w-4 text-primary" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground break-words">{t.title}</p>
                    <p className="text-xs text-muted-foreground">{t.start_time} — {t.end_time}</p>
                  </div>
                </div>
                <button onClick={() => removeMutation.mutate(t.id)} className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TimelinePage;
