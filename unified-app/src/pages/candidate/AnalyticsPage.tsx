import Navbar from "@/components/Navbar";
import { Activity, PieChart, Clock, TrendingUp } from "lucide-react";

const AnalyticsPage = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold text-foreground mb-6">All Analytics</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          { icon: Activity, label: "Consistency", value: "78%", color: "text-accent" },
          { icon: PieChart, label: "Portfolio Diversity", value: "65%", color: "text-primary" },
          { icon: Clock, label: "Work Hours / Week", value: "32h", color: "text-destructive" },
          { icon: TrendingUp, label: "Profile Views", value: "142", color: "text-primary" },
        ].map((s) => (
          <div key={s.label} className="bg-card rounded-xl border p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
              <s.icon className={`h-6 w-6 ${s.color}`} />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{s.value}</p>
              <p className="text-sm text-muted-foreground">{s.label}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default AnalyticsPage;
