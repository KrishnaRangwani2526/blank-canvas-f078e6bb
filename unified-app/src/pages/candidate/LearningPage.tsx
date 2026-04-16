import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Plus, ExternalLink, Clock, CheckCircle2, Trash2 } from "lucide-react";
import Navbar from "@/components/Navbar";

interface LearningGoal {
  id: string;
  link: string;
  title: string;
  deadline: string;
  proof: string;
  completed: boolean;
}

const LearningPage = () => {
  const [goals, setGoals] = useState<LearningGoal[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", link: "", deadline: "", proof: "" });

  const addGoal = () => {
    if (!form.title || !form.link) return;
    setGoals([
      ...goals,
      { ...form, id: Date.now().toString(), completed: false },
    ]);
    setForm({ title: "", link: "", deadline: "", proof: "" });
    setShowForm(false);
  };

  const toggleComplete = (id: string) => {
    setGoals(goals.map((g) => (g.id === id ? { ...g, completed: !g.completed } : g)));
  };

  const removeGoal = (id: string) => {
    setGoals(goals.filter((g) => g.id !== id));
  };

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
          <div className="bg-card rounded-lg border p-12 text-center">
            <p className="text-muted-foreground mb-4">No learning goals added yet.</p>
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 px-5 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:opacity-90 transition-opacity"
            >
              <Plus className="h-4 w-4" /> Add Learning Goal
            </button>
          </div>
        )}

        {(goals.length > 0 || showForm) && (
          <div className="space-y-4">
            {!showForm && (
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:opacity-90 transition-opacity"
              >
                <Plus className="h-4 w-4" /> Add Goal
              </button>
            )}

            {showForm && (
              <div className="bg-card rounded-lg border p-6 animate-fade-in space-y-4">
                <input
                  placeholder="Goal title"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <input
                  placeholder="Learning link (URL)"
                  value={form.link}
                  onChange={(e) => setForm({ ...form, link: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <input
                  type="date"
                  value={form.deadline}
                  onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <input
                  placeholder="Proof of completion (URL)"
                  value={form.proof}
                  onChange={(e) => setForm({ ...form, proof: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <div className="flex gap-2">
                  <button
                    onClick={addGoal}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:opacity-90"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setShowForm(false)}
                    className="px-4 py-2 border rounded-md text-sm text-foreground hover:bg-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {goals.map((goal) => (
              <div
                key={goal.id}
                className={`bg-card rounded-lg border p-5 animate-fade-in ${goal.completed ? "opacity-70" : ""}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className={`text-sm font-semibold text-card-foreground ${goal.completed ? "line-through" : ""}`}>
                      {goal.title}
                    </p>
                    <a
                      href={goal.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-link mt-1 hover:underline"
                    >
                      <ExternalLink className="h-3 w-3" /> Learning Resource
                    </a>
                    {goal.deadline && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                        <Clock className="h-3 w-3" /> Deadline: {goal.deadline}
                      </div>
                    )}
                    {goal.proof && (
                      <a
                        href={goal.proof}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-accent mt-1 hover:underline"
                      >
                        <CheckCircle2 className="h-3 w-3" /> Proof of completion
                      </a>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => toggleComplete(goal.id)}
                      className={`p-1.5 rounded-md hover:bg-secondary transition-colors ${goal.completed ? "text-accent" : "text-muted-foreground"}`}
                    >
                      <CheckCircle2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => removeGoal(goal.id)}
                      className="p-1.5 rounded-md hover:bg-secondary text-destructive transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LearningPage;
