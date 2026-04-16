import Navbar from "@/components/Navbar";
import { Trophy } from "lucide-react";

const RankPage = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="bg-card rounded-xl border p-8 text-center">
        <div className="w-20 h-20 mx-auto rounded-full bg-rank-bg flex items-center justify-center mb-4">
          <Trophy className="h-10 w-10 text-rank-gold" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Global Ranking</h1>
        <p className="text-5xl font-extrabold text-primary my-4">#1,247</p>
        <p className="text-sm text-muted-foreground">Top 5% of all developers worldwide</p>
        <div className="mt-8 grid grid-cols-3 gap-4">
          {[["Skills", "12"], ["Projects", "8"], ["Certifications", "5"]].map(([l, v]) => (
            <div key={l} className="bg-secondary rounded-lg p-3">
              <p className="text-lg font-bold text-foreground">{v}</p>
              <p className="text-xs text-muted-foreground">{l}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

export default RankPage;
