import { Diamond } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";

const TopSkills = () => {
  const { skills } = useProfile();

  const skillNames = skills.map((s) => s.name).filter(Boolean);

  return (
    <div className="bg-card rounded-lg border p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold text-card-foreground">Top Skills</h2>
        <span className="text-xs text-muted-foreground">{skillNames.length} skills</span>
      </div>
      {skillNames.length === 0 ? (
        <p className="text-sm text-muted-foreground italic">
          No skills yet. Add skills by uploading certificates or projects and using the skill extractor.
        </p>
      ) : (
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            {skillNames.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium"
              >
                <Diamond className="h-3 w-3" />
                {skill}
              </span>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Skills are automatically extracted from your certificates and projects.
          </p>
        </div>
      )}
    </div>
  );
};

export default TopSkills;
