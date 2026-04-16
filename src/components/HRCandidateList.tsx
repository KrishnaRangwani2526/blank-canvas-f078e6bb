import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Eye, Trophy, Zap } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface CandidateRanking {
  candidate_id: string;
  candidate_name: string;
  job_rank: number;
  ats_score: number;
  relevant_skill_ranks: Record<string, number>;
  average_relevant_rank: number;
  skills: string[];
  streak_consistency: number;
}

interface HRCandidateCListProps {
  candidates: CandidateRanking[];
  jobTitle?: string;
  onViewProfile: (candidateId: string) => void;
  isLoading?: boolean;
}

export function HRCandidateList({
  candidates,
  jobTitle = "Open Position",
  onViewProfile,
  isLoading = false,
}: HRCandidateCListProps) {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"rank" | "ats" | "consistency">("rank");

  const filtered = candidates.filter((c) =>
    c.candidate_name.toLowerCase().includes(search.toLowerCase()) ||
    (c.skills || []).some((s) => s.toLowerCase().includes(search.toLowerCase()))
  );

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "rank") return a.job_rank - b.job_rank;
    if (sortBy === "ats") return b.ats_score - a.ats_score;
    if (sortBy === "consistency") return b.streak_consistency - a.streak_consistency;
    return 0;
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <p className="text-muted-foreground">Loading candidates...</p>
        </CardContent>
      </Card>
    );
  }

  if (sorted.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <p className="text-muted-foreground">No candidates found for this job.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header and Controls */}
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-xl font-bold">Candidates for: {jobTitle}</h2>
          <p className="text-sm text-muted-foreground">{sorted.length} candidates matching this role</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="rank">Job Rank (↑)</SelectItem>
              <SelectItem value="ats">ATS Score (↓)</SelectItem>
              <SelectItem value="consistency">Consistency (↓)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name or skills..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="w-full overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b">
                  <TableHead className="w-12">Rank</TableHead>
                  <TableHead className="min-w-40">Candidate</TableHead>
                  <TableHead className="min-w-40">Key Skills</TableHead>
                  <TableHead className="w-24 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Zap className="h-4 w-4" />
                      ATS Score
                    </div>
                  </TableHead>
                  <TableHead className="w-32 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Trophy className="h-4 w-4" />
                      Consistency
                    </div>
                  </TableHead>
                  <TableHead className="w-24 text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sorted.map((candidate, idx) => {
                  const atsScoreColor =
                    candidate.ats_score >= 80
                      ? "text-green-600"
                      : candidate.ats_score >= 60
                        ? "text-yellow-600"
                        : "text-red-600";

                  return (
                    <TableRow key={candidate.candidate_id} className="hover:bg-muted/50">
                      <TableCell>
                        <Badge variant="outline" className="text-lg font-bold">
                          #{candidate.job_rank}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-semibold">{candidate.candidate_name}</p>
                          <p className="text-xs text-muted-foreground">ID: {candidate.candidate_id}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {Object.entries(candidate.relevant_skill_ranks)
                            .slice(0, 3)
                            .map(([skill, rank]) => (
                              <Badge key={skill} variant="secondary" className="text-xs">
                                {skill} #{rank}
                              </Badge>
                            ))}
                          {Object.keys(candidate.relevant_skill_ranks).length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{Object.keys(candidate.relevant_skill_ranks).length - 3}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className={`font-bold text-lg ${atsScoreColor}`}>
                          {candidate.ats_score.toFixed(1)}
                          <span className="text-xs ml-1 text-muted-foreground">/100</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="font-semibold">{candidate.streak_consistency.toFixed(1)}%</div>
                        <p className="text-xs text-muted-foreground">learning</p>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onViewProfile(candidate.candidate_id)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
