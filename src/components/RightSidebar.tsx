import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Trophy, Flame, ChevronDown, ChevronUp, Code2, BarChart2, Globe, BookOpen,
} from "lucide-react";
import { useStreakData } from "@/hooks/useStreakData";

const urls = [
  { label: "GitHub", icon: Code2, url: "https://github.com/krishnarangwani" },
  { label: "LeetCode", icon: Code2, url: "https://leetcode.com/krishnarangwani" },
  { label: "Kaggle", icon: BarChart2, url: "https://kaggle.com/krishnarangwani" },
  { label: "Portfolio", icon: Globe, url: "#" },
];

const learningItems = [
  "Machine Learning with Python",
  "System Design Fundamentals",
];

const RightSidebar = () => {
  const [urlsOpen, setUrlsOpen] = useState(false);
  const { data: streakData, isLoading: streakLoading } = useStreakData();

  const currentStreak = streakData?.aspiring?.streak || 0;
  const streakDays = streakData?.aspiring?.streak_days || Array(30).fill(0);

  return (
    <div className="space-y-3">
      {/* Global Rank */}
      <div className="bg-card rounded-lg border p-4 animate-fade-in">
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
      </div>

      {/* Streak */}
      <div className="bg-card rounded-lg border p-4 animate-fade-in">
        <div className="flex items-center gap-2 mb-2">
          <Flame className="h-4 w-4 text-destructive" />
          <span className="text-sm font-semibold text-card-foreground">{currentStreak} Day Streak</span>
        </div>
        <div className="grid grid-cols-10 gap-1">
          {streakDays.map((active, i) => (
            <div
              key={i}
              className={`w-3.5 h-3.5 rounded-sm ${active ? "bg-streak-green" : "bg-streak-empty"}`}
              title={`Day ${i + 1}`}
            />
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-1.5">Last 30 days</p>
      </div>

      {/* URLs */}
      <div className="bg-card rounded-lg border p-4 animate-fade-in">
        <button
          onClick={() => setUrlsOpen(!urlsOpen)}
          className="flex items-center justify-between w-full"
        >
          <span className="text-sm font-semibold text-card-foreground">Profile URLs</span>
          {urlsOpen ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </button>
        {urlsOpen && (
          <div className="mt-2 space-y-1">
            {urls.map((u) => (
              <a
                key={u.label}
                href={u.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-secondary text-xs text-primary transition-colors"
              >
                <u.icon className="h-3.5 w-3.5" />
                {u.label}
              </a>
            ))}
          </div>
        )}
      </div>

      {/* Skills - Button only */}
      <div className="bg-card rounded-lg border p-4 animate-fade-in">
        <Link
          to="/"
          className="flex items-center justify-center w-full px-3 py-2 bg-secondary text-secondary-foreground rounded-md text-sm font-medium hover:bg-secondary/80 transition-colors"
        >
          View All Skills
        </Link>
      </div>

      {/* Aspiring Learning */}
      <div className="bg-card rounded-lg border p-4 animate-fade-in">
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
        <Link
          to="/learning"
          className="inline-block w-full text-center px-3 py-2 bg-primary text-primary-foreground rounded-md text-xs font-medium hover:opacity-90 transition-opacity"
        >
          View Learning Goals
        </Link>
      </div>
    </div>
  );
};

export default RightSidebar;
