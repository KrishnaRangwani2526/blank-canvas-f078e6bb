// @ts-nocheck
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Trophy, Flame, BookOpen, Clock, Calendar, Sparkles, FolderGit2 } from "lucide-react";

interface Task { id: string; title: string; startTime: string; endTime: string; }

const getCurrentTask = (tasks: Task[]): Task | null => {
  const now = new Date();
  const hhmm = `${String(now.getHours()).padStart(2,"0")}:${String(now.getMinutes()).padStart(2,"0")}`;
  return tasks.find((t) => t.startTime <= hhmm && t.endTime > hhmm) || null;
};

const LeftSidebar = () => {
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  const { user } = useAuth();

  // Fetch skills count
  const { data: skills = [] } = useQuery({
    queryKey: ["user-skills", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("skills")
        .select("name")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false })
        .limit(4);
      if (error) throw error;
      return data as { name: string }[];
    },
    enabled: Boolean(user?.id),
  });

  // Fetch projects count
  const { data: projectCount = 0 } = useQuery({
    queryKey: ["user-projects-count", user?.id],
    queryFn: async () => {
      const { count } = await supabase
        .from("projects")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user?.id);
      return count || 0;
    },
    enabled: Boolean(user?.id),
  });

  // Fetch learning goals for streak calculation
  const { data: learningData } = useQuery({
    queryKey: ["learning-streak", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("learning_goals")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });
      return data || [];
    },
    enabled: Boolean(user?.id),
  });

  // Fetch total skills for ranking
  const { data: totalSkillUsers = 0 } = useQuery({
    queryKey: ["total-skill-users"],
    queryFn: async () => {
      const { count } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });
      return count || 0;
    },
  });

  // Calculate global rank based on skills count (simple rank = total - your position)
  const { data: globalRank = 0 } = useQuery({
    queryKey: ["global-rank", user?.id],
    queryFn: async () => {
      // Count users with more skills than current user
      const { data: mySkills } = await supabase
        .from("skills")
        .select("id")
        .eq("user_id", user?.id);
      const myCount = mySkills?.length || 0;
      if (myCount === 0) return 0;

      // Get all user skill counts
      const { data: allSkills } = await supabase
        .from("skills")
        .select("user_id");
      
      if (!allSkills) return 0;
      const counts: Record<string, number> = {};
      allSkills.forEach((s) => { counts[s.user_id] = (counts[s.user_id] || 0) + 1; });
      
      let rank = 1;
      Object.entries(counts).forEach(([uid, count]) => {
        if (uid !== user?.id && count > myCount) rank++;
      });
      return rank;
    },
    enabled: Boolean(user?.id),
  });

  // Calculate streak from aspiring learning: days with 1+ hour spent
  // For now, streak = number of consecutive days with completed learning goals
  const currentStreak = (() => {
    if (!learningData || learningData.length === 0) return 0;
    const completed = learningData.filter((g) => g.completed).length;
    return completed; // simplified
  })();

  // Build last 30 day streak grid
  const streakDays = (() => {
    const days = new Array(30).fill(0);
    // Mark today and streak days
    for (let i = 0; i < Math.min(currentStreak, 30); i++) {
      days[29 - i] = 1;
    }
    return days;
  })();

  useEffect(() => {
    const update = () => {
      try {
        const tasks: Task[] = JSON.parse(localStorage.getItem("timeline_tasks") || "[]");
        setCurrentTask(getCurrentTask(tasks));
      } catch { setCurrentTask(null); }
    };
    update();
    const interval = setInterval(update, 30000);
    return () => clearInterval(interval);
  }, []);

  const today = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return (
    <div className="space-y-3 w-full">
      {/* Global Rank */}
      <Link to="/rank" className="block bg-card rounded-xl border p-4 hover:shadow-md transition-shadow">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-rank-bg flex items-center justify-center">
            <Trophy className="h-4 w-4 text-rank-gold" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Global Rank</p>
            <p className="text-lg font-bold text-card-foreground">
              {globalRank === 0 ? "#0" : `#${globalRank.toLocaleString()}`}
            </p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {globalRank === 0 ? "Add skills to get ranked" : `Out of ${totalSkillUsers} developers`}
        </p>
      </Link>

      {/* Streak - real data from aspiring learning */}
      <Link to="/streak" className="block bg-card rounded-xl border p-4 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Flame className="h-4 w-4 text-destructive" />
            <span className="text-sm font-semibold text-card-foreground">
              {currentStreak > 0 ? `${currentStreak} Day Streak` : "No Streak"}
            </span>
          </div>
          <span className="text-[10px] text-muted-foreground">{today}</span>
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

      {/* Skill Section - shows top skills and count */}
      <Link to="/skills" className="block bg-card rounded-xl border p-4 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold text-card-foreground">Skills</span>
          </div>
          <span className="text-xs font-bold text-foreground bg-secondary px-2 py-0.5 rounded-full">{skills.length}</span>
        </div>
        {skills.length > 0 ? (
          <div className="space-y-1">
            {skills.slice(0, 4).map((skill, index) => (
              <div key={index} className="flex items-center justify-between">
                <p className="text-sm text-foreground truncate">{skill.name}</p>
              </div>
            ))}
            {skills.length > 4 && <p className="text-xs text-muted-foreground">+{skills.length - 4} more</p>}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">No skills yet. Extract from projects or certificates.</p>
        )}
        <p className="mt-3 text-xs text-primary font-medium">Open Skills Dashboard →</p>
      </Link>

      {/* Projects */}
      <Link to="/projects" className="block bg-card rounded-xl border p-4 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <FolderGit2 className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold text-card-foreground">Projects</span>
          </div>
          <span className="text-xs text-muted-foreground">{projectCount}</span>
        </div>
        <p className="text-xs text-muted-foreground">Manage your projects and extract skills</p>
        <p className="mt-3 text-xs text-primary font-medium">View All Projects</p>
      </Link>

      {/* Aspiring Learning */}
      <Link to="/learning" className="block bg-card rounded-xl border p-4 hover:shadow-md transition-shadow">
        <div className="flex items-center gap-2 mb-2">
          <BookOpen className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold text-card-foreground">Aspiring Learning</h3>
        </div>
        {learningData && learningData.length > 0 ? (
          <ul className="space-y-1 mb-2">
            {learningData.slice(0, 2).map((item) => (
              <li key={item.id} className="text-xs text-muted-foreground flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${item.completed ? "bg-green-500" : "bg-primary"}`} />
                <span className="truncate">{item.title}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-muted-foreground mb-2">No learning goals yet.</p>
        )}
        <span className="text-xs text-primary font-medium">View Learning Goals</span>
      </Link>
    </div>
  );
};

export default LeftSidebar;
