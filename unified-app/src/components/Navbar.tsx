// @ts-nocheck
import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Users, Briefcase, MessageSquare, Bell, ChevronDown, User, FileText, Brain, BarChart3, Code2, Plus, Settings, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { useNotifications } from "@/hooks/useNotifications";
import { useStreakData } from "@/hooks/useStreakData";

const Navbar = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [meOpen, setMeOpen] = useState(false);
  const [githubOpen, setGithubOpen] = useState(false);
  const [leetcodeOpen, setLeetcodeOpen] = useState(false);
  const [kaggleOpen, setKaggleOpen] = useState(false);
  const [msgOpen, setMsgOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { data: notifications = [] } = useNotifications();
  const { data: streakData } = useStreakData();
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  // Close all dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setMeOpen(false);
        setGithubOpen(false);
        setLeetcodeOpen(false);
        setKaggleOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const closeAll = () => { setMeOpen(false); setGithubOpen(false); setLeetcodeOpen(false); setKaggleOpen(false); };

  const Dropdown = ({ children, open }: { children: React.ReactNode; open: boolean }) => {
    if (!open) return null;
    return (
      <div className="absolute right-0 top-full mt-1.5 w-64 bg-card rounded-xl shadow-lg border p-2 z-[200] animate-fade-in">
        {children}
      </div>
    );
  };

  return (
    <>
      <nav className="sticky top-0 z-50 bg-card border-b shadow-sm" ref={dropdownRef}>
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-3">
            <Link to="/" className="text-primary font-bold text-xl tracking-tight">DevConnect</Link>
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-1.5 rounded-lg bg-secondary text-secondary-foreground text-sm w-56 focus:outline-none focus:ring-2 focus:ring-ring transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-0.5">
            {/* My Network */}
            <Link to="/network" className="flex flex-col items-center px-2.5 py-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors duration-200">
              <Users className="h-5 w-5" />
              <span className="text-[10px] mt-0.5 hidden md:block">Network</span>
            </Link>

            {/* Jobs */}
            <Link to="/jobs" className="flex flex-col items-center px-2.5 py-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors duration-200">
              <Briefcase className="h-5 w-5" />
              <span className="text-[10px] mt-0.5 hidden md:block">Jobs</span>
            </Link>

            {/* Messaging */}
            <button onClick={() => { closeAll(); setMsgOpen(!msgOpen); }} className="flex flex-col items-center px-2.5 py-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors duration-200">
              <MessageSquare className="h-5 w-5" />
              <span className="text-[10px] mt-0.5 hidden md:block">Messaging</span>
            </button>

            {/* Notifications */}
            <Link to="/notifications" className="relative flex flex-col items-center px-2.5 py-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors duration-200">
              <Bell className="h-5 w-5" />
              <span className="text-[10px] mt-0.5 hidden md:block">Notifications</span>
              {notifications.filter((n) => !n.is_read).length > 0 && (
                <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px]">
                  {notifications.filter((n) => !n.is_read).length}
                </Badge>
              )}
            </Link>

            {/* GitHub */}
            <div className="relative">
              <button onClick={() => { closeAll(); setGithubOpen(!githubOpen); }} className="flex flex-col items-center px-2.5 py-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors duration-200">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
                <span className="text-[10px] mt-0.5 hidden md:block">GitHub</span>
              </button>
              <Dropdown open={githubOpen}>
                <p className="px-3 py-2 text-sm font-semibold text-foreground">GitHub</p>
                <hr className="border-border my-1" />
                <div className="px-3 py-2 text-xs text-muted-foreground">
                  Streak: 🔥 {streakData?.github?.streak || 0} days
                </div>
                <div className="px-3 py-1.5 text-xs text-muted-foreground">
                  This week: {streakData?.github?.weekly_commits || 0} commits
                </div>
                <div className="px-3 py-1.5 text-xs text-muted-foreground">
                  Active days: {streakData?.github?.active_days || 0}/7
                </div>
                <hr className="border-border my-1" />
                <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-secondary text-sm text-primary transition-colors">
                  Open GitHub Profile →
                </a>
              </Dropdown>
            </div>

            {/* LeetCode */}
            <div className="relative">
              <button onClick={() => { closeAll(); setLeetcodeOpen(!leetcodeOpen); }} className="flex flex-col items-center px-2.5 py-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors duration-200">
                <Code2 className="h-5 w-5" />
                <span className="text-[10px] mt-0.5 hidden md:block">LeetCode</span>
              </button>
              <Dropdown open={leetcodeOpen}>
                <p className="px-3 py-2 text-sm font-semibold text-foreground">LeetCode</p>
                <hr className="border-border my-1" />
                <div className="px-3 py-2 text-xs text-muted-foreground">
                  Streak: 🔥 {streakData?.leetcode?.streak || 0} days
                </div>
                <div className="px-3 py-1.5 text-xs text-muted-foreground">
                  This week: {streakData?.leetcode?.weekly_solved || 0} problems
                </div>
                <hr className="border-border my-1" />
                <a href="https://leetcode.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-secondary text-sm text-primary transition-colors">
                  Open LeetCode Profile →
                </a>
              </Dropdown>
            </div>

            {/* Kaggle */}
            <div className="relative">
              <button onClick={() => { closeAll(); setKaggleOpen(!kaggleOpen); }} className="flex flex-col items-center px-2.5 py-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors duration-200">
                <BarChart3 className="h-5 w-5" />
                <span className="text-[10px] mt-0.5 hidden md:block">Kaggle</span>
              </button>
              <Dropdown open={kaggleOpen}>
                <p className="px-3 py-2 text-sm font-semibold text-foreground">Kaggle</p>
                <hr className="border-border my-1" />
                <div className="px-3 py-2 text-xs text-muted-foreground">
                  Weekly Activity: {streakData?.kaggle?.weekly_activity || 0}
                </div>
                <div className="px-3 py-1.5 text-xs text-muted-foreground">
                  {streakData?.kaggle?.note || "Kaggle integration pending"}
                </div>
                <hr className="border-border my-1" />
                <a href="https://kaggle.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-secondary text-sm text-primary transition-colors">
                  Open Kaggle Profile →
                </a>
              </Dropdown>
            </div>

            {/* Add (+) */}
            <Link to="/add-platform" className="flex flex-col items-center px-2.5 py-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors duration-200">
              <Plus className="h-5 w-5" />
              <span className="text-[10px] mt-0.5 hidden md:block">Add</span>
            </Link>

            {/* Me */}
            <div className="relative">
              <button onClick={() => { closeAll(); setMeOpen(!meOpen); }} className="flex flex-col items-center px-2.5 py-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors duration-200">
                <User className="h-5 w-5" />
                <span className="text-[10px] mt-0.5 hidden md:flex items-center gap-0.5">Me <ChevronDown className="h-3 w-3" /></span>
              </button>
              <Dropdown open={meOpen}>
                <div className="px-3 py-2 text-xs text-muted-foreground truncate">{user?.email}</div>
                <hr className="border-border my-1" />
                <Link to="/" onClick={() => setMeOpen(false)} className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-secondary text-sm text-card-foreground transition-colors">
                  <User className="h-4 w-4" /> View Profile
                </Link>
                <hr className="border-border my-1" />
                <p className="px-3 py-1 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Features</p>
                <Link to="/ats-score" onClick={() => setMeOpen(false)} className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-secondary text-sm text-card-foreground transition-colors">
                  <BarChart3 className="h-4 w-4 text-accent" /> My ATS Score
                </Link>
                <Link to="/resume" onClick={() => setMeOpen(false)} className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-secondary text-sm text-card-foreground transition-colors">
                  <FileText className="h-4 w-4 text-primary" /> My Resume
                </Link>
                <Link to="/ai-suggestions" onClick={() => setMeOpen(false)} className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-secondary text-sm text-card-foreground transition-colors">
                  <Brain className="h-4 w-4 text-destructive" /> AI Suggestions
                </Link>
                <hr className="border-border my-1" />
                <Link to="/settings" onClick={() => setMeOpen(false)} className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-secondary text-sm text-card-foreground transition-colors">
                  <Settings className="h-4 w-4" /> Settings & Privacy
                </Link>
                <hr className="border-border my-1" />
                <button onClick={handleSignOut} className="w-full text-left px-3 py-2 rounded-lg hover:bg-secondary text-sm text-destructive transition-colors">Sign Out</button>
              </Dropdown>
            </div>
          </div>
        </div>
      </nav>

      {/* Messaging Slide Panel */}
      {msgOpen && (
        <div className="fixed inset-0 z-[100]" onClick={() => setMsgOpen(false)}>
          <div className="absolute inset-0 bg-black/30" />
          <div
            className="absolute right-0 top-0 h-full w-80 bg-card border-l shadow-xl p-0 animate-in slide-in-from-right duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <h2 className="text-sm font-semibold text-foreground">Messaging</h2>
              <button aria-label="Close messaging panel" onClick={() => setMsgOpen(false)} className="p-1 rounded-md hover:bg-secondary text-muted-foreground"><X className="h-4 w-4" /></button>
            </div>
            <div className="p-4 space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg hover:bg-secondary transition-colors cursor-pointer">
                  <div className="w-9 h-9 rounded-full bg-secondary animate-pulse flex-shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 w-24 bg-secondary rounded animate-pulse" />
                    <div className="h-2 w-40 bg-secondary rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
