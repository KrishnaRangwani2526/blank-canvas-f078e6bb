import Navbar from "@/components/Navbar";
import { Flame } from "lucide-react";
import { useStreakData } from "@/hooks/useStreakData";

const StreakPage = () => {
  const { data: streakData, isLoading, error } = useStreakData();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-3xl mx-auto px-4 py-12">
          <div className="bg-card rounded-xl border p-8 text-center">
            <p className="text-muted-foreground">Loading streak data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-3xl mx-auto px-4 py-12">
          <div className="bg-card rounded-xl border p-8 text-center">
            <p className="text-destructive">Error loading streak data</p>
          </div>
        </div>
      </div>
    );
  }

  const aspiringStreak = streakData?.aspiring?.streak || 0;
  const streakDays = streakData?.aspiring?.streak_days || Array(30).fill(0);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="bg-card rounded-xl border p-8 text-center">
          <div className="w-20 h-20 mx-auto rounded-full bg-destructive/10 flex items-center justify-center mb-4">
            <Flame className="h-10 w-10 text-destructive" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Activity Streak</h1>
          <p className="text-5xl font-extrabold text-destructive my-4">{aspiringStreak} Days</p>
          <p className="text-sm text-muted-foreground mb-6">Your current consecutive active days</p>
          <div className="grid grid-cols-10 gap-1.5 max-w-xs mx-auto">
            {streakDays.map((active, i) => (
              <div key={i} className={`w-5 h-5 rounded ${active ? "bg-streak-green" : "bg-streak-empty"}`} title={`Day ${i+1}`} />
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-3">Last 30 days - based on learning goals, projects & certificates</p>
        </div>
      </div>
    </div>
  );
};

export default StreakPage;
