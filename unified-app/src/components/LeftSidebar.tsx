// @ts-nocheck
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Trophy, Flame, BookOpen, Clock, Calendar, Sparkles, FolderGit2 } from "lucide-react";

interface Task { id: string; title: string; startTime: string; endTime: string; }

const streakDays = [1,1,1,0,1,1,0,1,1,1,1,0,0,1,1,1,0,1,1,1,1,1,0,1,1,0,1,1,1,0];

const learningItems = ["Machine Learning with Python", "System Design Fundamentals"];

const getCurrentTask = (tasks: Task[]): Task | null => {
  const now = new Date();
  const hhmm = `${String(now.getHours()).padStart(2,"0")}:${String(now.getMinutes()).padStart(2,"0")}`;
  return tasks.find((t) => t.startTime <= hhmm && t.endTime > hhmm) || null;
};

const LeftSidebar = () => {
  const currentStreak = 7;
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  const { user } = useAuth();
  const { data: skills = [] } = useQuery({
    queryKey: ["user-skills", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("skills")
        .select("name")
        .eq("user_id", user?.id)
        .order("updated_at", { ascending: false })
        .limit(4);

      if (error) throw error;
      return data as { name: string }[];
    },
    enabled: Boolean(user?.id),
  });

  useEffect(() => {
    const update = () => {
      try {
        const tasks: Task[] = JSON.parse(localStorage.getItem("timeline_tasks") || "[]");
        setCurrentTask(getCurrentTask(tasks));
      } catch { setCurrentTask(null); }
    };
    update();
    const interval = setInterval(update, 30000); // check every 30s
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-3 w-full">
      {/* Global Rank - button */}
      <Link to="/rank" className="block bg-card rounded-xl border p-4 hover:shadow-md transition-shadow">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-rank-bg flex items-center justify-center">
            <Trophy className="h-4 w-4 text-rank-gold" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Global Rank</p>
            <p className="text-lg font-bold text-card-foreground">#1,247</p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-1">Top 5% of all developers</p>
      </Link>

      {/* Streak - button */}
      <Link to="/streak" className="block bg-card rounded-xl border p-4 hover:shadow-md transition-shadow">
        <div className="flex items-center gap-2 mb-2">
          <Flame className="h-4 w-4 text-destructive" />
          <span className="text-sm font-semibold text-card-foreground">{currentStreak} Day Streak</span>
        </div>
        <div className="grid grid-cols-10 gap-1">
          {streakDays.map((active, i) => (
            <div key={i} className={`w-3.5 h-3.5 rounded-sm ${active ? "bg-streak-green" : "bg-streak-empty"}`} title={`Day ${i+1}`} />
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-1.5">Last 30 days</p>
      </Link>

      {/* Timeline */}
      <Link to="/timeline" className="block bg-card rounded-xl border p-4 hover:shadow-md transition-shadow">
        <div className="flex items-center gap-2 mb-2">
          <Calendar className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold text-card-foreground">Timeline</span>
        </div>
        {currentTask ? (
          <div className="flex items-center gap-2 text-xs">
            <Clock className="h-3.5 w-3.5 text-accent" />
            <span className="text-foreground font-medium">{currentTask.title}</span>
            <span className="text-muted-foreground">{currentTask.startTime}–{currentTask.endTime}</span>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">No active task right now</p>
        )}
      </Link>

      {/* Skill Section */}
      <Link to="/skills" className="block bg-card rounded-xl border p-4 hover:shadow-md transition-shadow">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="h-4 w-4 text-secondary" />
          <span className="text-sm font-semibold text-card-foreground">Skill Section</span>
        </div>
        {skills.length > 0 ? (
          <div className="space-y-1 text-sm text-foreground">
            {skills.map((skill, index) => (
              <p key={index} className="truncate">{skill.name}</p>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">Top skills will appear here.</p>
        )}
        <p className="mt-3 text-xs text-primary font-medium">Open Skills Dashboard</p>
      </Link>

      {/* Projects */}
      <Link to="/projects" className="block bg-card rounded-xl border p-4 hover:shadow-md transition-shadow">
        <div className="flex items-center gap-2 mb-2">
          <FolderGit2 className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold text-card-foreground">Projects</span>
        </div>
        <p className="text-xs text-muted-foreground">Manage your projects and extract skills</p>
        <p className="mt-3 text-xs text-primary font-medium">View All Projects</p>
      </Link>

      {/* Aspiring Learning */}
      <div className="bg-card rounded-xl border p-4">
        <div className="flex items-center gap-2 mb-2">
          <BookOpen className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold text-card-foreground">Aspiring Learning</h3>
        </div>
        {learningItems.length > 0 && (
          <ul className="space-y-1 mb-2">
            {learningItems.map((item, i) => (
              <li key={i} className="text-xs text-muted-foreground flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        )}
        <Link to="/learning" className="inline-block w-full text-center px-3 py-2 bg-primary text-primary-foreground rounded-lg text-xs font-medium hover:opacity-90 transition-opacity">
          View Learning Goals
        </Link>
      </div>
    </div>
  );
};

export default LeftSidebar;
