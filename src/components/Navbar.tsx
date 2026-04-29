// @ts-nocheck
import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Users, Briefcase, MessageSquare, Bell, ChevronDown, User, FileText, Brain, BarChart3, Code2, Plus, Settings, X, ExternalLink, Check, Menu } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNotifications } from "@/hooks/useNotifications";
import { useStreakData } from "@/hooks/useStreakData";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

const StreakDots = ({ days }: { days: number[] }) => (
  <div className="flex gap-0.5 mt-1">
    {days.map((active, i) => (
      <div key={i} className={`w-2.5 h-2.5 rounded-sm ${active ? "bg-green-500" : "bg-secondary"}`} />
    ))}
  </div>
);

const Navbar = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [meOpen, setMeOpen] = useState(false);
  const [githubOpen, setGithubOpen] = useState(false);
  const [leetcodeOpen, setLeetcodeOpen] = useState(false);
  const [kaggleOpen, setKaggleOpen] = useState(false);
  const [linkedinOpen, setLinkedinOpen] = useState(false);
  const [msgOpen, setMsgOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobilePlatform, setMobilePlatform] = useState<"github" | "leetcode" | "kaggle" | "linkedin" | null>(null);
  const [githubInput, setGithubInput] = useState("");
  const [leetcodeInput, setLeetcodeInput] = useState("");
  const [kaggleInput, setKaggleInput] = useState("");
  const [linkedinInput, setLinkedinInput] = useState("");
  const [savingPlatform, setSavingPlatform] = useState(false);
  const { user, signOut } = useAuth();
  const { data: notifications = [] } = useNotifications();
  const { data: streakData } = useStreakData();
  const { profile } = useProfile();
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        closeAll();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const closeAll = () => { setMeOpen(false); setGithubOpen(false); setLeetcodeOpen(false); setKaggleOpen(false); setLinkedinOpen(false); };
  const closeMobileMenu = () => setMobileMenuOpen(false);

  const savePlatformUrl = async (field: string, value: string) => {
    if (!user || !value.trim()) return;
    setSavingPlatform(true);
    try {
      const { error } = await supabase.from("profiles").update({ [field]: value.trim() }).eq("user_id", user.id);
      if (error) throw error;
      toast.success("Profile updated!");
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["streak-data"] });
    } catch (err: any) {
      toast.error(err.message || "Failed to save");
    } finally {
      setSavingPlatform(false);
    }
  };

  const Dropdown = ({ children, open }: { children: React.ReactNode; open: boolean }) => {
    if (!open) return null;
    return (
      <div className="fixed left-3 right-3 top-16 bg-card rounded-xl shadow-lg border p-2 z-[200] animate-fade-in sm:absolute sm:left-auto sm:right-0 sm:top-full sm:mt-1.5 sm:w-72">
        {children}
      </div>
    );
  };

  const hasGithub = !!profile?.github_url;
  const hasLeetcode = !!profile?.leetcode_url;
  const hasKaggle = !!profile?.kaggle_url;

  const generateDots = (streak: number) => {
    const dots = [];
    for (let i = 6; i >= 0; i--) {
      dots.push(i < streak ? 1 : 0);
    }
    return dots;
  };

  const githubDots = generateDots(streakData?.github?.streak || 0);
  const leetcodeDots = generateDots(streakData?.leetcode?.streak || 0);
  const kaggleDots = generateDots(streakData?.kaggle?.weekly_activity || 0);

  // Messaging: fetch recent conversations
  const [recentMessages, setRecentMessages] = useState<any[]>([]);
  useEffect(() => {
    if (!user || !msgOpen) return;
    const fetchMessages = async () => {
      const { data } = await supabase
        .from("messages")
        .select("*")
        .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .order("created_at", { ascending: false })
        .limit(20);
      if (data) {
        // Group by conversation partner
        const seen = new Set<string>();
        const convos: any[] = [];
        data.forEach(msg => {
          const otherId = msg.sender_id === user.id ? msg.recipient_id : msg.sender_id;
          if (!seen.has(otherId)) {
            seen.add(otherId);
            convos.push({ ...msg, partnerId: otherId });
          }
        });
        setRecentMessages(convos.slice(0, 5));
      }
    };
    fetchMessages();
  }, [user, msgOpen]);

  return (
    <>
      <nav className="sticky top-0 z-50 bg-card border-b shadow-sm" ref={dropdownRef}>
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-3 shrink-0">
            <Link to="/" className="text-primary font-bold text-xl tracking-tight">DevConnect</Link>
            <form className="relative hidden sm:block" onSubmit={(e) => { e.preventDefault(); if (searchQuery.trim()) navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`); }}>
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input type="text" placeholder="Search candidates..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 pr-4 py-1.5 rounded-lg bg-secondary text-secondary-foreground text-sm w-56 focus:outline-none focus:ring-2 focus:ring-ring transition-all" />
            </form>
          </div>

          <button
            type="button"
            aria-label="Open navigation menu"
            onClick={() => {
              closeAll();
              setMobileMenuOpen(true);
            }}
            className="md:hidden ml-auto inline-flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="hidden md:flex items-center gap-0.5 overflow-x-auto md:overflow-visible scrollbar-hide flex-nowrap ml-4 fade-edges py-1">

            <Link to="/jobs" className="flex flex-col items-center px-2.5 py-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors duration-200">
              <Briefcase className="h-5 w-5" />
              <span className="text-[10px] mt-0.5 hidden md:block">Jobs</span>
            </Link>
            <button onClick={() => { closeAll(); setMsgOpen(!msgOpen); }} className="flex flex-col items-center px-2.5 py-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors duration-200">
              <MessageSquare className="h-5 w-5" />
              <span className="text-[10px] mt-0.5 hidden md:block">Messaging</span>
            </button>
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
                {hasGithub ? (
                  <>
                    <div className="px-3 py-2">
                      <p className="text-xs text-muted-foreground mb-1">7 Day Streak</p>
                      <StreakDots days={githubDots} />
                    </div>
                    <div className="px-3 py-1.5 flex justify-between text-xs">
                      <span className="text-muted-foreground">Weekly Commits</span>
                      <span className="font-medium text-foreground">{streakData?.github?.weekly_commits || 0}</span>
                    </div>
                    <div className="px-3 py-1.5 flex justify-between text-xs">
                      <span className="text-muted-foreground">Streak Days</span>
                      <span className="font-medium text-foreground">{streakData?.github?.streak || 0}</span>
                    </div>
                    <hr className="border-border my-1" />
                    <a href={profile?.github_url || "#"} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-secondary text-sm text-primary transition-colors">
                      <ExternalLink className="h-3.5 w-3.5" /> Open GitHub
                    </a>
                  </>
                ) : (
                  <div className="px-3 py-3 space-y-2">
                    <p className="text-xs text-muted-foreground">Enter your GitHub profile URL:</p>
                    <input
                      type="url"
                      value={githubInput}
                      onChange={(e) => setGithubInput(e.target.value)}
                      placeholder="https://github.com/username"
                      className="w-full px-2 py-1.5 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                    <button
                      onClick={() => { savePlatformUrl("github_url", githubInput); setGithubOpen(false); }}
                      disabled={savingPlatform || !githubInput.trim()}
                      className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-xs font-medium hover:bg-primary/90 disabled:opacity-50"
                    >
                      <Check className="h-3.5 w-3.5" /> {savingPlatform ? "Saving..." : "Link GitHub"}
                    </button>
                  </div>
                )}
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
                {hasLeetcode ? (
                  <>
                    <div className="px-3 py-2">
                      <p className="text-xs text-muted-foreground mb-1">7 Day Streak</p>
                      <StreakDots days={leetcodeDots} />
                    </div>
                    <div className="px-3 py-1.5 flex justify-between text-xs">
                      <span className="text-muted-foreground">Weekly Solved</span>
                      <span className="font-medium text-foreground">{streakData?.leetcode?.weekly_solved || 0}</span>
                    </div>
                    <hr className="border-border my-1" />
                    <a href={profile?.leetcode_url || "#"} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-secondary text-sm text-primary transition-colors">
                      <ExternalLink className="h-3.5 w-3.5" /> Open LeetCode
                    </a>
                  </>
                ) : (
                  <div className="px-3 py-3 space-y-2">
                    <p className="text-xs text-muted-foreground">Enter your LeetCode profile URL:</p>
                    <input type="url" value={leetcodeInput} onChange={(e) => setLeetcodeInput(e.target.value)} placeholder="https://leetcode.com/username" className="w-full px-2 py-1.5 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                    <button onClick={() => { savePlatformUrl("leetcode_url", leetcodeInput); setLeetcodeOpen(false); }} disabled={savingPlatform || !leetcodeInput.trim()} className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-xs font-medium hover:bg-primary/90 disabled:opacity-50">
                      <Check className="h-3.5 w-3.5" /> {savingPlatform ? "Saving..." : "Link LeetCode"}
                    </button>
                  </div>
                )}
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
                {hasKaggle ? (
                  <>
                    <div className="px-3 py-2">
                      <p className="text-xs text-muted-foreground mb-1">7 Day Streak</p>
                      <StreakDots days={kaggleDots} />
                    </div>
                    <div className="px-3 py-1.5 flex justify-between text-xs">
                      <span className="text-muted-foreground">Weekly Activity</span>
                      <span className="font-medium text-foreground">{streakData?.kaggle?.weekly_activity || 0}</span>
                    </div>
                    <hr className="border-border my-1" />
                    <a href={profile?.kaggle_url || "#"} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-secondary text-sm text-primary transition-colors">
                      <ExternalLink className="h-3.5 w-3.5" /> Open Kaggle
                    </a>
                  </>
                ) : (
                  <div className="px-3 py-3 space-y-2">
                    <p className="text-xs text-muted-foreground">Enter your Kaggle profile URL:</p>
                    <input type="url" value={kaggleInput} onChange={(e) => setKaggleInput(e.target.value)} placeholder="https://kaggle.com/username" className="w-full px-2 py-1.5 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                    <button onClick={() => { savePlatformUrl("kaggle_url", kaggleInput); setKaggleOpen(false); }} disabled={savingPlatform || !kaggleInput.trim()} className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-xs font-medium hover:bg-primary/90 disabled:opacity-50">
                      <Check className="h-3.5 w-3.5" /> {savingPlatform ? "Saving..." : "Link Kaggle"}
                    </button>
                  </div>
                )}
              </Dropdown>
            </div>

            {/* LinkedIn */}
            <div className="relative">
              <button onClick={() => { closeAll(); setLinkedinOpen(!linkedinOpen); }} className="flex flex-col items-center px-2.5 py-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors duration-200">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                <span className="text-[10px] mt-0.5 hidden md:block">LinkedIn</span>
              </button>
              <Dropdown open={linkedinOpen}>
                <p className="px-3 py-2 text-sm font-semibold text-foreground">LinkedIn</p>
                <hr className="border-border my-1" />
                <div className="px-3 py-3 space-y-2">
                  <p className="text-xs text-muted-foreground">Enter your LinkedIn profile URL:</p>
                  <input type="url" value={linkedinInput} onChange={(e) => setLinkedinInput(e.target.value)} placeholder="https://linkedin.com/in/username" className="w-full px-2 py-1.5 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                  <button onClick={() => { toast.success("LinkedIn URL saved (display coming soon)"); setLinkedinOpen(false); }} disabled={!linkedinInput.trim()} className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 bg-[#0077B5] text-white rounded-md text-xs font-medium hover:bg-[#0077B5]/90 disabled:opacity-50">
                    <Check className="h-3.5 w-3.5" /> Link LinkedIn
                  </button>
                </div>
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

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[180] md:hidden" onClick={closeMobileMenu}>
          <div className="absolute inset-0 bg-black/40" />
          <aside
            className="absolute right-0 top-0 h-full w-[min(22rem,88vw)] bg-card border-l shadow-xl flex flex-col animate-in slide-in-from-right duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-foreground">DevConnect</p>
                <p className="text-xs text-muted-foreground truncate max-w-56">{user?.email}</p>
              </div>
              <button
                type="button"
                aria-label="Close navigation menu"
                onClick={closeMobileMenu}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-5">
              <div className="space-y-1">
                <Link to="/jobs" onClick={closeMobileMenu} className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm hover:bg-secondary">
                  <Briefcase className="h-5 w-5 text-primary" /> Jobs
                </Link>
                <button onClick={() => { closeMobileMenu(); closeAll(); setMsgOpen(true); }} className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm hover:bg-secondary">
                  <MessageSquare className="h-5 w-5 text-primary" /> Messaging
                </button>
                <Link to="/notifications" onClick={closeMobileMenu} className="flex items-center justify-between rounded-lg px-3 py-3 text-sm hover:bg-secondary">
                  <span className="flex items-center gap-3">
                    <Bell className="h-5 w-5 text-primary" /> Notifications
                  </span>
                  {notifications.filter((n) => !n.is_read).length > 0 && (
                    <Badge className="h-5 min-w-5 px-1.5 text-[10px]">
                      {notifications.filter((n) => !n.is_read).length}
                    </Badge>
                  )}
                </Link>
                <Link to="/add-platform" onClick={closeMobileMenu} className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm hover:bg-secondary">
                  <Plus className="h-5 w-5 text-primary" /> Add Platform
                </Link>
              </div>

              <div className="space-y-1">
                <p className="px-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Platforms</p>
                <button onClick={() => { closeMobileMenu(); closeAll(); setMobilePlatform("github"); }} className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm hover:bg-secondary">
                  <svg className="h-5 w-5 text-primary" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
                  GitHub
                </button>
                <button onClick={() => { closeMobileMenu(); closeAll(); setMobilePlatform("leetcode"); }} className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm hover:bg-secondary">
                  <Code2 className="h-5 w-5 text-primary" /> LeetCode
                </button>
                <button onClick={() => { closeMobileMenu(); closeAll(); setMobilePlatform("kaggle"); }} className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm hover:bg-secondary">
                  <BarChart3 className="h-5 w-5 text-primary" /> Kaggle
                </button>
                <button onClick={() => { closeMobileMenu(); closeAll(); setMobilePlatform("linkedin"); }} className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm hover:bg-secondary">
                  <svg className="h-5 w-5 text-primary" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                  LinkedIn
                </button>
              </div>

              <div className="space-y-1">
                <p className="px-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Me</p>
                <Link to="/" onClick={closeMobileMenu} className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm hover:bg-secondary">
                  <User className="h-5 w-5 text-primary" /> View Profile
                </Link>
                <Link to="/ats-score" onClick={closeMobileMenu} className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm hover:bg-secondary">
                  <BarChart3 className="h-5 w-5 text-accent" /> My ATS Score
                </Link>
                <Link to="/resume" onClick={closeMobileMenu} className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm hover:bg-secondary">
                  <FileText className="h-5 w-5 text-primary" /> My Resume
                </Link>
                <Link to="/ai-suggestions" onClick={closeMobileMenu} className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm hover:bg-secondary">
                  <Brain className="h-5 w-5 text-destructive" /> AI Suggestions
                </Link>
                <Link to="/settings" onClick={closeMobileMenu} className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm hover:bg-secondary">
                  <Settings className="h-5 w-5 text-primary" /> Settings & Privacy
                </Link>
              </div>
            </div>

            <div className="border-t p-3">
              <button onClick={() => { closeMobileMenu(); handleSignOut(); }} className="w-full rounded-lg px-3 py-3 text-left text-sm text-destructive hover:bg-secondary">
                Sign Out
              </button>
            </div>
          </aside>
        </div>
      )}

      {mobilePlatform && (
        <div className="fixed inset-0 z-[190] md:hidden" onClick={() => setMobilePlatform(null)}>
          <div className="absolute inset-0 bg-black/40" />
          <div
            className="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-xl bg-card border-t shadow-xl p-4 animate-in slide-in-from-bottom duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between border-b pb-3">
              <h2 className="text-sm font-semibold capitalize text-foreground">
                {mobilePlatform === "leetcode" ? "LeetCode" : mobilePlatform}
              </h2>
              <button
                type="button"
                aria-label="Close platform panel"
                onClick={() => setMobilePlatform(null)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {mobilePlatform === "github" && (
              <div className="space-y-3">
                {hasGithub ? (
                  <>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">7 Day Streak</p>
                      <StreakDots days={githubDots} />
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Weekly Commits</span>
                      <span className="font-medium">{streakData?.github?.weekly_commits || 0}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Streak Days</span>
                      <span className="font-medium">{streakData?.github?.streak || 0}</span>
                    </div>
                    <a href={profile?.github_url || "#"} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm text-primary">
                      <ExternalLink className="h-4 w-4" /> Open GitHub
                    </a>
                  </>
                ) : (
                  <>
                    <p className="text-xs text-muted-foreground">Enter your GitHub profile URL:</p>
                    <input type="url" value={githubInput} onChange={(e) => setGithubInput(e.target.value)} placeholder="https://github.com/username" className="w-full px-3 py-2 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                    <button onClick={() => { savePlatformUrl("github_url", githubInput); setMobilePlatform(null); }} disabled={savingPlatform || !githubInput.trim()} className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium disabled:opacity-50">
                      <Check className="h-4 w-4" /> {savingPlatform ? "Saving..." : "Link GitHub"}
                    </button>
                  </>
                )}
              </div>
            )}

            {mobilePlatform === "leetcode" && (
              <div className="space-y-3">
                {hasLeetcode ? (
                  <>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">7 Day Streak</p>
                      <StreakDots days={leetcodeDots} />
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Weekly Solved</span>
                      <span className="font-medium">{streakData?.leetcode?.weekly_solved || 0}</span>
                    </div>
                    <a href={profile?.leetcode_url || "#"} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm text-primary">
                      <ExternalLink className="h-4 w-4" /> Open LeetCode
                    </a>
                  </>
                ) : (
                  <>
                    <p className="text-xs text-muted-foreground">Enter your LeetCode profile URL:</p>
                    <input type="url" value={leetcodeInput} onChange={(e) => setLeetcodeInput(e.target.value)} placeholder="https://leetcode.com/username" className="w-full px-3 py-2 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                    <button onClick={() => { savePlatformUrl("leetcode_url", leetcodeInput); setMobilePlatform(null); }} disabled={savingPlatform || !leetcodeInput.trim()} className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium disabled:opacity-50">
                      <Check className="h-4 w-4" /> {savingPlatform ? "Saving..." : "Link LeetCode"}
                    </button>
                  </>
                )}
              </div>
            )}

            {mobilePlatform === "kaggle" && (
              <div className="space-y-3">
                {hasKaggle ? (
                  <>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">7 Day Streak</p>
                      <StreakDots days={kaggleDots} />
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Weekly Activity</span>
                      <span className="font-medium">{streakData?.kaggle?.weekly_activity || 0}</span>
                    </div>
                    <a href={profile?.kaggle_url || "#"} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm text-primary">
                      <ExternalLink className="h-4 w-4" /> Open Kaggle
                    </a>
                  </>
                ) : (
                  <>
                    <p className="text-xs text-muted-foreground">Enter your Kaggle profile URL:</p>
                    <input type="url" value={kaggleInput} onChange={(e) => setKaggleInput(e.target.value)} placeholder="https://kaggle.com/username" className="w-full px-3 py-2 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                    <button onClick={() => { savePlatformUrl("kaggle_url", kaggleInput); setMobilePlatform(null); }} disabled={savingPlatform || !kaggleInput.trim()} className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium disabled:opacity-50">
                      <Check className="h-4 w-4" /> {savingPlatform ? "Saving..." : "Link Kaggle"}
                    </button>
                  </>
                )}
              </div>
            )}

            {mobilePlatform === "linkedin" && (
              <div className="space-y-3">
                <p className="text-xs text-muted-foreground">Enter your LinkedIn profile URL:</p>
                <input type="url" value={linkedinInput} onChange={(e) => setLinkedinInput(e.target.value)} placeholder="https://linkedin.com/in/username" className="w-full px-3 py-2 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                <button onClick={() => { toast.success("LinkedIn URL saved (display coming soon)"); setMobilePlatform(null); }} disabled={!linkedinInput.trim()} className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-[#0077B5] text-white rounded-md text-sm font-medium disabled:opacity-50">
                  <Check className="h-4 w-4" /> Link LinkedIn
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Messaging Slide Panel */}
      {msgOpen && (
        <div className="fixed inset-0 z-[100]" onClick={() => setMsgOpen(false)}>
          <div className="absolute inset-0 bg-black/30" />
          <div className="absolute right-0 top-0 h-full w-[min(20rem,88vw)] bg-card border-l shadow-xl p-0 animate-in slide-in-from-right duration-300" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <h2 className="text-sm font-semibold text-foreground">Messaging</h2>
              <button aria-label="Close" onClick={() => setMsgOpen(false)} className="p-1 rounded-md hover:bg-secondary text-muted-foreground"><X className="h-4 w-4" /></button>
            </div>
            <div className="p-2 space-y-1">
              {recentMessages.length === 0 ? (
                <div className="p-6 text-center text-xs text-muted-foreground">No messages yet. Connect with people to start chatting!</div>
              ) : (
                recentMessages.map((msg) => (
                  <Link
                    key={msg.id}
                    to="/network"
                    onClick={() => setMsgOpen(false)}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-secondary transition-colors"
                  >
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-foreground truncate">{msg.content}</p>
                      <p className="text-[10px] text-muted-foreground">{new Date(msg.created_at).toLocaleString()}</p>
                    </div>
                    {!msg.is_read && msg.sender_id !== user?.id && (
                      <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                    )}
                  </Link>
                ))
              )}
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-3 border-t">
              <Link to="/network" onClick={() => setMsgOpen(false)} className="block w-full text-center py-2 text-sm text-primary hover:underline">
                Open all messages
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
