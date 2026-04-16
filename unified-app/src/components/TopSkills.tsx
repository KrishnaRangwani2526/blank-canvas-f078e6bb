import { Diamond } from "lucide-react";

const skills = ["Python (Programming Language)", "SQL", "React.js", "Node.js", "Data Structures"];

const TopSkills = () => (
  <div className="bg-card rounded-lg border p-6 animate-fade-in">
    <h2 className="text-lg font-semibold text-card-foreground mb-3">Top skills</h2>
    <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary">
      <Diamond className="h-5 w-5 text-primary mt-0.5" />
      <div>
        <p className="text-sm font-medium text-card-foreground">Top skills</p>
        <p className="text-xs text-muted-foreground">{skills.join(" • ")}</p>
      </div>
    </div>
  </div>
);

export default TopSkills;
