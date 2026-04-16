// @ts-nocheck
import Navbar from "@/components/Navbar";
import { Activity, PieChart, Clock, TrendingUp, Award, Code2, BookOpen } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";

const AnalyticsPage = () => {
  const { skills, projects, certificates, experience, education, learningGoals } = useProfile();

  // Calculate real analytics - same logic as AnalyticsSection
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

  // Additional metrics for detailed view
  const skillCount = skills.length;
  const projectCount = projects.length;
  const certificateCount = certificates.length;
  const experienceCount = experience.length;
  const educationCount = education.length;
  const learningGoalCount = learningGoals.length;

  const mainStats = [
    { icon: Activity, label: "Consistency", value: `${consistency}%`, desc: "Profile activity over the past 30 days.", color: "text-accent" },
    { icon: PieChart, label: "Diversified Portfolio", value: `${portfolio}%`, desc: "Skills, projects, and certificates breadth.", color: "text-primary" },
    { icon: Clock, label: "Work Hours", value: `${workHours}h`, desc: "Estimated weekly productive hours.", color: "text-destructive" },
  ];

  const detailedStats = [
    { icon: Code2, label: "Skills", value: skillCount, color: "text-blue-500" },
    { icon: BookOpen, label: "Projects", value: projectCount, color: "text-purple-500" },
    { icon: Award, label: "Certificates", value: certificateCount, color: "text-orange-500" },
    { icon: TrendingUp, label: "Experience", value: experienceCount, color: "text-green-500" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-foreground mb-2">All Analytics</h1>
        <p className="text-muted-foreground mb-8">Complete overview of your profile and activity metrics</p>

        {/* Main Analytics */}
        <div className="mb-12">
          <h2 className="text-xl font-semibold text-foreground mb-4">Main Metrics</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {mainStats.map((s) => (
              <div key={s.label} className="bg-card rounded-xl border p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                    <s.icon className={`h-6 w-6 ${s.color}`} />
                  </div>
                  <div className="flex-1">
                    <p className="text-3xl font-bold text-foreground">{s.value}</p>
                    <p className="text-sm font-medium text-foreground mt-1">{s.label}</p>
                    <p className="text-xs text-muted-foreground mt-2">{s.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Detailed Breakdown */}
        <div className="mb-12">
          <h2 className="text-xl font-semibold text-foreground mb-4">Activity Breakdown</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {detailedStats.map((s) => (
              <div key={s.label} className="bg-card rounded-lg border p-4 text-center hover:shadow-md transition-shadow">
                <div className="flex justify-center mb-2">
                  <s.icon className={`h-6 w-6 ${s.color}`} />
                </div>
                <p className="text-2xl font-bold text-foreground">{s.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Consistency Details */}
        <div className="mb-12">
          <h2 className="text-xl font-semibold text-foreground mb-4">Consistency Analysis</h2>
          <div className="bg-card rounded-xl border p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Recent Activity (Last 30 days)</span>
                <span className="font-semibold text-foreground">{consistency}% Complete</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-3">
                <div 
                  className="bg-accent rounded-full h-3 transition-all duration-300" 
                  style={{ width: `${consistency}%` }}
                ></div>
              </div>
              <div className="grid grid-cols-3 gap-4 mt-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-foreground">{projects.filter(p => p.created_at >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()).length}</p>
                  <p className="text-xs text-muted-foreground mt-1">Projects (30d)</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-foreground">{certificates.filter(c => c.created_at >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()).length}</p>
                  <p className="text-xs text-muted-foreground mt-1">Certs (30d)</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-foreground">{learningGoals.filter(g => g.created_at >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()).length}</p>
                  <p className="text-xs text-muted-foreground mt-1">Goals (30d)</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Portfolio Breakdown */}
        <div>
          <h2 className="text-xl font-semibold text-foreground mb-4">Portfolio Diversity</h2>
          <div className="bg-card rounded-xl border p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-secondary/50 rounded-lg">
                <p className="text-2xl font-bold text-foreground">{new Set(skills.map(s => s.category).filter(Boolean)).size}</p>
                <p className="text-xs text-muted-foreground mt-2">Skill Categories</p>
              </div>
              <div className="text-center p-4 bg-secondary/50 rounded-lg">
                <p className="text-2xl font-bold text-foreground">{skillCount}</p>
                <p className="text-xs text-muted-foreground mt-2">Total Skills</p>
              </div>
              <div className="text-center p-4 bg-secondary/50 rounded-lg">
                <p className="text-2xl font-bold text-foreground">{educationCount}</p>
                <p className="text-xs text-muted-foreground mt-2">Education</p>
              </div>
              <div className="text-center p-4 bg-secondary/50 rounded-lg">
                <p className="text-2xl font-bold text-foreground">{experienceCount}</p>
                <p className="text-xs text-muted-foreground mt-2">Experience</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
