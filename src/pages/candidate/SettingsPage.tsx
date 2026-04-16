import Navbar from "@/components/Navbar";

const SettingsPage = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold text-foreground mb-6">Settings & Privacy</h1>
      <div className="space-y-4">
        {["Account Preferences", "Sign In & Security", "Visibility", "Data Privacy", "Notifications"].map((s) => (
          <div key={s} className="bg-card rounded-xl border p-5 flex items-center justify-between hover:bg-secondary/30 transition-colors cursor-pointer">
            <span className="text-sm font-medium text-foreground">{s}</span>
            <span className="text-muted-foreground text-xs">→</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default SettingsPage;
