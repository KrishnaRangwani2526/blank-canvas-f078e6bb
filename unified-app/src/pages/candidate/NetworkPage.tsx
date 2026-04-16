import Navbar from "@/components/Navbar";

const NetworkPage = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold text-foreground mb-2">My Network</h1>
      <p className="text-muted-foreground text-sm mb-8">Manage your connections and invitations.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {["Connections", "Sent Requests", "Received Requests", "People You May Know"].map((s) => (
          <div key={s} className="bg-card rounded-xl border p-6 flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-full bg-secondary animate-pulse" />
            <p className="text-sm font-medium text-card-foreground">{s}</p>
            <p className="text-xs text-muted-foreground">Coming soon</p>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default NetworkPage;
