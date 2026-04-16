import { useState } from "react";
import Navbar from "@/components/Navbar";
import { Plus, Globe } from "lucide-react";

interface Platform { name: string; url: string; }

const AddPlatformPage = () => {
  const [platforms, setPlatforms] = useState<Platform[]>(() => {
    try { return JSON.parse(localStorage.getItem("custom_platforms") || "[]"); } catch { return []; }
  });
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");

  const add = () => {
    if (!name || !url) return;
    const next = [...platforms, { name, url }];
    setPlatforms(next);
    localStorage.setItem("custom_platforms", JSON.stringify(next));
    setName(""); setUrl("");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-2xl font-bold text-foreground mb-6">Add Platform</h1>
        <div className="bg-card rounded-xl border p-6 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Platform name (e.g. Kaggle)" className="px-3 py-2 rounded-lg border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
            <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="Profile URL" className="px-3 py-2 rounded-lg border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <button onClick={add} className="mt-3 flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
            <Plus className="h-4 w-4" /> Add Platform
          </button>
        </div>
        {platforms.length > 0 && (
          <div className="space-y-2">
            {platforms.map((p, i) => (
              <a key={i} href={p.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 bg-card rounded-xl border p-4 hover:bg-secondary/30 transition-colors">
                <Globe className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-sm font-medium text-foreground">{p.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{p.url}</p>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AddPlatformPage;
