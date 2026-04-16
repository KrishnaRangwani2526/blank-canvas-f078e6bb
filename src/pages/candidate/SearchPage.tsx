// @ts-nocheck
import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client";
import { Search, User } from "lucide-react";

const SearchPage = () => {
  const [params] = useSearchParams();
  const query = params.get("q") || "";
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) return;
    setLoading(true);
    const search = async () => {
      // Search by display_name, full_name, or user_id (profile ID)
      const { data } = await supabase
        .from("profiles")
        .select("user_id, display_name, full_name, avatar_url, bio, location")
        .or(`display_name.ilike.%${query}%,full_name.ilike.%${query}%,user_id.eq.${query.length === 36 ? query : "00000000-0000-0000-0000-000000000000"}`)
        .limit(20);
      setResults(data || []);
      setLoading(false);
    };
    search();
  }, [query]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-foreground mb-1">Search Results</h1>
        <p className="text-sm text-muted-foreground mb-6">
          {query ? `Showing results for "${query}"` : "Enter a name or profile ID to search"}
        </p>
        {loading ? (
          <p className="text-muted-foreground">Searching...</p>
        ) : results.length === 0 && query ? (
          <p className="text-muted-foreground">No candidates found.</p>
        ) : (
          <div className="space-y-3">
            {results.map((p) => (
              <Link
                key={p.user_id}
                to={`/profile/${p.user_id}`}
                className="flex items-center gap-4 p-4 rounded-lg border bg-card hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center overflow-hidden flex-shrink-0">
                  {p.avatar_url ? (
                    <img src={p.avatar_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <User className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{p.display_name || p.full_name || "User"}</p>
                  {p.bio && <p className="text-xs text-muted-foreground truncate">{p.bio}</p>}
                  {p.location && <p className="text-xs text-muted-foreground">{p.location}</p>}
                </div>
                <span className="text-[10px] text-muted-foreground font-mono">{p.user_id.slice(0, 8)}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
