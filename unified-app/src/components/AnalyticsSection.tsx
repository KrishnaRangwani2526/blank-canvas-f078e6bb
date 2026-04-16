import { Link } from "react-router-dom";
import { Activity, PieChart, Clock } from "lucide-react";

const stats = [
  { icon: Activity, label: "Consistency", value: "78%", desc: "Profile activity over the past 30 days.", color: "text-accent" },
  { icon: PieChart, label: "Diversified Portfolio", value: "65%", desc: "Skills, projects, and certificates breadth.", color: "text-primary" },
  { icon: Clock, label: "Work Hours", value: "32h", desc: "Estimated weekly productive hours.", color: "text-destructive" },
];

const AnalyticsSection = () => (
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
    <p className="text-xs text-muted-foreground mt-3">Past 7 days</p>
    <Link to="/analytics" className="mt-3 w-full text-center text-sm text-primary hover:underline border-t border-border pt-3 block">
      Show all analytics →
    </Link>
  </div>
);

export default AnalyticsSection;
