import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { Plus, Trash2, Clock } from "lucide-react";

interface Task {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
}

const getStoredTasks = (): Task[] => {
  try {
    return JSON.parse(localStorage.getItem("timeline_tasks") || "[]");
  } catch { return []; }
};

const TimelinePage = () => {
  const [tasks, setTasks] = useState<Task[]>(getStoredTasks);
  const [title, setTitle] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  useEffect(() => {
    localStorage.setItem("timeline_tasks", JSON.stringify(tasks));
  }, [tasks]);

  const addTask = () => {
    if (!title || !startTime || !endTime) return;
    setTasks([...tasks, { id: crypto.randomUUID(), title, startTime, endTime }]);
    setTitle(""); setStartTime(""); setEndTime("");
  };

  const removeTask = (id: string) => setTasks(tasks.filter((t) => t.id !== id));

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-2xl font-bold text-foreground mb-6">Timeline Manager</h1>

        <div className="bg-card rounded-xl border p-6 mb-6">
          <h2 className="text-sm font-semibold text-foreground mb-3">Add Task</h2>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Task title" className="col-span-2 px-3 py-2 rounded-lg border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
            <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="px-3 py-2 rounded-lg border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
            <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="px-3 py-2 rounded-lg border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <button onClick={addTask} className="mt-3 flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
            <Plus className="h-4 w-4" /> Add
          </button>
        </div>

        {tasks.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No tasks yet. Add your first task above.</p>
        ) : (
          <div className="space-y-3">
            {tasks.sort((a, b) => a.startTime.localeCompare(b.startTime)).map((t) => (
              <div key={t.id} className="bg-card rounded-xl border p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-primary" />
                  <div>
                    <p className="text-sm font-medium text-foreground">{t.title}</p>
                    <p className="text-xs text-muted-foreground">{t.startTime} — {t.endTime}</p>
                  </div>
                </div>
                <button onClick={() => removeTask(t.id)} className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
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
