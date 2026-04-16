"""
ranking_service.py — High-level service for the new universal skill-based ranking system.

Usage
─────
from ranking_service import RankingService

svc = RankingService()                       # uses DATABASE_URL env or sqlite

# Add / update candidates with new fields
svc.upsert("Arjun Sharma",
           github_streak=7,
           leetcode_streak=12,
           kaggle_streak=0,
           aspiring_streak=5,
           skills=["Python", "React", "Machine Learning"],
           learning_hours=120,
           streak_consistency=85.5)

# Get universal ranking (skill-based)
skill_rankings, candidate_ranks = svc.rank_universal()

# Get skill rank for specific candidate
rank = svc.get_skill_rank("Python", candidate_id=1)

# Get candidate rank
candidate_rank = svc.get_candidate_rank(1)
"""

from __future__ import annotations
from typing import List, Optional, Dict, Any, Tuple

from repository import (
    get_all, create_candidate,
    get_candidate_data, filter_by_skill_tags,
)
from ranking_engine import (
    compute_universal_ranking, SkillData, CandidateData,
    SkillRank, CandidateRank, get_skill_rank, get_candidate_rank,
    JobRequirements, JobCandidateRank, compute_job_ranking
)


class RankingService:
    def __init__(self):
        pass  # No database initialization needed

    # ── Candidate management ──────────────────────────────────────────────────

    def upsert(self, name: str, **kwargs) -> dict:
        """
        Add or update a candidate by name. Pass any fields as kwargs.
        """
        # For now, just create since we don't have upsert in Supabase version
        data = {"full_name": name, "user_id": kwargs.get("user_id", ""), **kwargs}
        return create_candidate(data)

    def add(self, name: str, **kwargs) -> dict:
        data = {"full_name": name, "user_id": kwargs.get("user_id", ""), **kwargs}
        return create_candidate(data)

    def list_candidates(self) -> List[dict]:
        return get_all()

    # ── New Universal Ranking ─────────────────────────────────────────────────

    def rank_universal(self) -> Tuple[Dict[str, List[SkillRank]], List[CandidateRank]]:
        """
        Compute universal ranking based on skills.

        Returns:
        - skill_rankings: {skill_name: [SkillRank]} - universal ranking for each skill
        - candidate_ranks: [CandidateRank] - candidates ranked by average skill rank
        """
        candidates = get_candidate_data()

        # Convert to ranking engine format
        skill_data = []
        for c in candidates:
            # Create skill data for each skill this candidate has
            for skill in c.skills:
                skill_data.append(SkillData(
                    name=skill,
                    candidate_id=c.id,
                    candidate_name=c.name,
                    github_streak=c.github_streak,
                    leetcode_streak=c.leetcode_streak,
                    kaggle_streak=c.kaggle_streak,
                    aspiring_streak=c.aspiring_streak,
                ))

        return compute_universal_ranking(skill_data, candidates)

    # ── Individual rank lookups ──────────────────────────────────────────────

    def get_skill_rank(self, skill_name: str, candidate_id: str) -> Optional[int]:
        """Get a candidate's rank for a specific skill."""
        skill_rankings, _ = self.rank_universal()
        return get_skill_rank(skill_name, candidate_id, skill_rankings)

    def get_candidate_rank(self, candidate_id: str) -> Optional[CandidateRank]:
        """Get a candidate's overall ranking information."""
        _, candidate_ranks = self.rank_universal()
        return get_candidate_rank(candidate_id, candidate_ranks)

    # ── Formatting helpers ────────────────────────────────────────────────────

    @staticmethod
    def format_skill_rankings(skill_rankings: Dict[str, List[SkillRank]]) -> Dict[str, List[dict]]:
        """Format skill rankings for API responses."""
        return {
            skill_name: [
                {
                    "rank": sr.rank,
                    "candidate_id": sr.candidate_id,
                    "candidate_name": sr.candidate_name,
                    "tiebreak_score": sr.tiebreak_score,
                }
                for sr in ranks
            ]
            for skill_name, ranks in skill_rankings.items()
        }

    @staticmethod
    def format_candidate_ranks(candidate_ranks: List[CandidateRank]) -> List[dict]:
        """Format candidate rankings for API responses."""
        return [
            {
                "universal_rank": cr.universal_rank,
                "candidate_id": cr.candidate.id,
                "candidate_name": cr.candidate.name,
                "average_skill_rank": cr.average_skill_rank,
                "skill_ranks": cr.skill_ranks,
                "tiebreak_score": cr.tiebreak_score,
                "github_streak": cr.candidate.github_streak,
                "leetcode_streak": cr.candidate.leetcode_streak,
                "kaggle_streak": cr.candidate.kaggle_streak,
                "aspiring_streak": cr.candidate.aspiring_streak,
                "skills": cr.candidate.skills,
                "learning_hours": cr.candidate.learning_hours,
                "streak_consistency": cr.candidate.streak_consistency,
            }
            for cr in candidate_ranks
        ]

    @staticmethod
    def format_job_candidates(job_candidates: List[JobCandidateRank]) -> List[dict]:
        """Format job-specific candidate rankings for API responses."""
        return [
            {
                "job_rank": jc.job_rank,
                "candidate_id": jc.candidate.id,
                "candidate_name": jc.candidate.name,
                "ats_score": jc.ats_score,
                "relevant_skill_ranks": jc.relevant_skill_ranks,
                "average_relevant_rank": jc.average_relevant_rank,
                "tiebreak_score": jc.tiebreak_score,
                "github_streak": jc.candidate.github_streak,
                "leetcode_streak": jc.candidate.leetcode_streak,
                "kaggle_streak": jc.candidate.kaggle_streak,
                "aspiring_streak": jc.candidate.aspiring_streak,
                "skills": jc.candidate.skills,
                "learning_hours": jc.candidate.learning_hours,
                "streak_consistency": jc.candidate.streak_consistency,
            }
            for jc in job_candidates
        ]

    def rank_for_job(
        self,
        job_requirements: JobRequirements,
        names: Optional[List[str]] = None,
    ) -> List[JobCandidateRank]:
        """
        Rank candidates for a specific job based on HR requirements.
        Returns job-specific rankings with ATS scores.
        """
        candidates = get_candidate_data(names)

        # Get universal skill rankings for reference
        skill_data = []
        for candidate in candidates:
            for skill in candidate.skills:
                skill_data.append(SkillData(
                    name=skill,
                    candidate_id=candidate.id,
                    candidate_name=candidate.name,
                    github_streak=candidate.github_streak,
                    leetcode_streak=candidate.leetcode_streak,
                    kaggle_streak=candidate.kaggle_streak,
                    aspiring_streak=candidate.aspiring_streak,
                ))

        skill_rankings, _ = compute_universal_ranking(skill_data, candidates)

        return compute_job_ranking(candidates, job_requirements, skill_rankings)

    # ── Helpers ───────────────────────────────────────────────────────────────

    @staticmethod
    def available_metrics() -> Dict[str, dict]:
        """Return metric catalogue as plain dicts for UI consumption."""
        return {
            key: {
                "label":   m.label,
                "tier":    m.tier,
                "tier_label": m.tier_label,
                "default_weight": m.default_weight,
                "higher_is_better": m.higher_is_better,
            }
            for key, m in METRICS.items()
        }

    @staticmethod
    def format_results(results: List[RankResult], verbose: bool = False) -> List[dict]:
        """
        Serialise RankResult list to plain dicts for JSON API responses.
        """
        out = []
        for r in results:
            row = {
                "rank":        r.overall_rank,
                "name":        r.candidate.name,
                "score":       r.overall_score,
                "sub_ranks":   r.sub_ranks,
                "tiebreak":    r.tiebreak_values,
            }
            if verbose:
                row["metrics"] = r.candidate.__dict__
            out.append(row)
        return out
