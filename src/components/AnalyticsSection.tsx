// @ts-nocheck
import { Link } from "react-router-dom";
import { Activity, PieChart, Clock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const AnalyticsSection = () => {
  const { user } = useAuth();
  const { skills, projects, certificates, experience, education, learningGoals } = useProfile();

  // Calculate real analytics
  // Consistency: based on activity in past 30 days (projects + certificates + learning goals created)
  const consistency = (() => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const recentProjects = projects.filter(p => p.created_at >= thirtyDaysAgo).length;
    const recentCerts = certificates.filter(c => c.created_at >= thirtyDaysAgo).length;
    const recentGoals = learningGoals.filter(g => g.created_at >= thirtyDaysAgo).length;
    const total = recentProjects + recentCerts + recentGoals;
    // Normalize: 10+ activities = 100%
    return Math.min(100, Math.round((total / 10) * 100));
  })();

  // Diversified Portfolio: breadth of skills categories, projects, certificates
  const portfolio = (() => {
    const categories = new Set(skills.map(s => s.category).filter(Boolean));
    const hasProjects = projects.length > 0 ? 1 : 0;
    const hasCerts = certificates.length > 0 ? 1 : 0;
    const hasExp = experience.length > 0 ? 1 : 0;
    const hasEdu = education.length > 0 ? 1 : 0;
    const score = (categories.size * 10) + (hasProjects * 15) + (hasCerts * 15) + (hasExp * 15) + (hasEdu * 15) + (skills.length * 2);
    return Math.min(100, score);
  })();

  // Work hours: estimated from learning goals with targets
  const workHours = (() => {
    let total = 0;
    learningGoals.forEach(g => {
      if (g.proof) {
        const match = g.proof.match(/Target:\s*([\d.]+)hr/);
        if (match) total += parseFloat(match[1]) * 5; // assume 5 days/week
      }
    });
    return Math.round(total) || 0;
  })();

  const stats = [
    { icon: Activity, label: "Consistency", value: `${consistency}%`, desc: "Profile activity over the past 30 days.", color: "text-accent" },
    { icon: PieChart, label: "Diversified Portfolio", value: `${portfolio}%`, desc: "Skills, projects, and certificates breadth.", color: "text-primary" },
    { icon: Clock, label: "Work Hours", value: `${workHours}h`, desc: "Estimated weekly productive hours.", color: "text-destructive" },
  ];

  return (
    <div className="bg-card rounded-xl border p-6 animate-fade-in">
      <h2 className="text-lg font-semibold text-card-foreground mb-1">Analytics</h2>
      <p className="text-xs text-muted-foreground mb-4">Private to you</p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="flex items-start gap-3 cursor-pointer group">
            <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
              <s.icon className={`h-5 w-5 ${s.color}`} />
            </div>
            <div>
              <p className="text-xl font-bold text-card-foreground">{s.value}</p>
              <p className="text-xs font-medium text-card-foreground">{s.label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{s.desc}</p>
            </div>
          </div>
        ))}
      </div>
      <p className="text-xs text-muted-foreground mt-3">Real-time data</p>
      <Link to="/analytics" className="mt-3 w-full text-center text-sm text-primary hover:underline border-t border-border pt-3 block">
        Show all analytics →
      </Link>
    </div>
  );
};

export default AnalyticsSection;
