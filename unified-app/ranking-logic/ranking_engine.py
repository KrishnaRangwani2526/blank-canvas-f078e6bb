"""
ranking_engine.py — New ranking logic based on universal skill ranking.

Ranking System:
───────────────
1. Every skill gets ranked universally across all candidates
2. If skills have same rank, compare GitHub streak, then LeetCode, then Aspiring Learning
3. Candidate's universal rank = average of all their skill ranks
4. If still tied, consider streak consistency
5. If still tied, consider hours spent in learning
6. If still tied, give same rank

Streaks:
────────
- GitHub streak (days)
- LeetCode streak (days)
- Kaggle streak (days)
- Aspiring Learning streak (days spent ≥1 hour learning)
"""

from __future__ import annotations
from dataclasses import dataclass, field
from typing import List, Dict, Optional, Tuple
from collections import defaultdict


# ── Skill ranking data structures ────────────────────────────────────────────

@dataclass
class SkillData:
    name: str
    candidate_id: str
    candidate_name: str
    github_streak: int = 0
    leetcode_streak: int = 0
    kaggle_streak: int = 0
    aspiring_streak: int = 0


@dataclass
class SkillRank:
    skill_name: str
    rank: int
    candidate_id: str
    candidate_name: str
    tiebreak_score: float  # For same skill ranks


# ── Job-specific ranking data structures ───────────────────────────────────

@dataclass
class JobRequirements:
    """HR-specified job requirements for ranking."""
    required_skills: List[str]  # Priority skills for the job
    consider_github: bool = False
    consider_linkedin: bool = False  # Note: LinkedIn not in current model
    consider_leetcode: bool = False
    consider_kaggle: bool = False
    # For tiebreaking - use total counts instead of streaks
    github_total_commits: bool = False
    leetcode_total_solved: bool = False
    kaggle_total_competitions: bool = False


@dataclass
class JobCandidateRank:
    """Candidate ranking for a specific job."""
    candidate: CandidateData
    job_rank: int
    relevant_skill_ranks: Dict[str, int]  # Only ranks for required skills
    average_relevant_rank: float
    tiebreak_score: float
    ats_score: float  # Profile completeness and match score


# ── ATS Scoring ─────────────────────────────────────────────────────────────

def calculate_ats_score(candidate: CandidateData, job_requirements: JobRequirements) -> float:
    """
    Calculate ATS (Applicant Tracking System) score based on profile completeness
    and job requirement match.
    """
    score = 0.0
    max_score = 100.0

    # Profile completeness (40% of score)
    completeness_score = 0.0

    # Skills match (required skills present)
    required_skills_present = sum(1 for skill in job_requirements.required_skills if skill in candidate.skills)
    skill_match_ratio = required_skills_present / len(job_requirements.required_skills) if job_requirements.required_skills else 0
    completeness_score += skill_match_ratio * 25

    # Platform connections
    platform_count = sum([
        1 if candidate.github_streak > 0 else 0,
        1 if candidate.leetcode_streak > 0 else 0,
        1 if candidate.kaggle_streak > 0 else 0,
        1 if candidate.aspiring_streak > 0 else 0,
    ])
    completeness_score += (platform_count / 4) * 15

    # Learning activity
    if candidate.learning_hours > 0:
        completeness_score += 10

    # Streak consistency
    if candidate.streak_consistency > 50:
        completeness_score += 10

    # Job match bonus (60% of score)
    match_score = skill_match_ratio * 60

    total_score = completeness_score + match_score
    return min(total_score, max_score)

@dataclass
class CandidateData:
    id: str
    name: str
    skills: List[str] = field(default_factory=list)
    github_streak: int = 0
    leetcode_streak: int = 0
    kaggle_streak: int = 0
    aspiring_streak: int = 0
    streak_consistency: float = 0.0  # Average of all streak percentages
    learning_hours: int = 0  # Total hours spent learning
    # Total metrics for job ranking tiebreaking
    github_total_commits: int = 0
    leetcode_total_solved: int = 0
    kaggle_total_competitions: int = 0
    linkedin_connections: int = 0  # For future LinkedIn integration


@dataclass
class CandidateRank:
    candidate: CandidateData
    universal_rank: int
    average_skill_rank: float
    skill_ranks: List[int]  # Individual skill ranks
    tiebreak_score: float


# ── Skill ranking functions ──────────────────────────────────────────────────

def rank_skills_universally(skill_data: List[SkillData]) -> Dict[str, List[SkillRank]]:
    """
    Rank each skill universally across all candidates.
    Returns {skill_name: [SkillRank sorted by rank]}
    """
    skill_groups = defaultdict(list)

    # Group skills by name
    for data in skill_data:
        skill_groups[data.name].append(data)

    skill_rankings = {}

    for skill_name, candidates in skill_groups.items():
        # Sort candidates for this skill by tiebreak criteria
        candidates.sort(key=lambda c: (
            -c.github_streak,      # Higher GitHub streak first
            -c.leetcode_streak,    # Then LeetCode streak
            -c.aspiring_streak,    # Then Aspiring Learning streak
            -c.kaggle_streak,      # Finally Kaggle streak
        ))

        skill_ranks = []
        current_rank = 1
        prev_tiebreak = None

        for i, candidate in enumerate(candidates):
            # Calculate tiebreak score for this candidate on this skill
            tiebreak_score = (
                candidate.github_streak * 1000 +
                candidate.leetcode_streak * 100 +
                candidate.aspiring_streak * 10 +
                candidate.kaggle_streak
            )

            # If tiebreak score is different from previous, increment rank
            if prev_tiebreak is not None and tiebreak_score != prev_tiebreak:
                current_rank = i + 1

            skill_ranks.append(SkillRank(
                skill_name=skill_name,
                rank=current_rank,
                candidate_id=candidate.candidate_id,
                candidate_name=candidate.candidate_name,
                tiebreak_score=tiebreak_score
            ))

            prev_tiebreak = tiebreak_score

        skill_rankings[skill_name] = skill_ranks

    return skill_rankings


# ── Candidate ranking functions ──────────────────────────────────────────────

def calculate_candidate_ranks(
    candidates: List[CandidateData],
    skill_rankings: Dict[str, List[SkillRank]]
) -> List[CandidateRank]:
    """
    Calculate universal ranks for candidates based on their skill ranks.
    """
    candidate_ranks = []

    for candidate in candidates:
        if not candidate.skills:
            # Candidate with no skills gets lowest possible rank
            candidate_ranks.append(CandidateRank(
                candidate=candidate,
                universal_rank=999999,
                average_skill_rank=999999.0,
                skill_ranks=[],
                tiebreak_score=0.0
            ))
            continue

        skill_ranks = []
        for skill in candidate.skills:
            if skill in skill_rankings:
                # Find this candidate's rank for this skill
                for skill_rank in skill_rankings[skill]:
                    if skill_rank.candidate_id == candidate.id:
                        skill_ranks.append(skill_rank.rank)
                        break

        if not skill_ranks:
            average_rank = 999999.0
        else:
            average_rank = sum(skill_ranks) / len(skill_ranks)

        # Calculate tiebreak score for candidate-level ties
        tiebreak_score = (
            candidate.streak_consistency * 10000 +
            candidate.learning_hours * 100 +
            candidate.github_streak * 10 +
            candidate.leetcode_streak * 1
        )

        candidate_ranks.append(CandidateRank(
            candidate=candidate,
            universal_rank=0,  # Will be set after sorting
            average_skill_rank=average_rank,
            skill_ranks=skill_ranks,
            tiebreak_score=tiebreak_score
        ))

    # Sort candidates by average skill rank, then by tiebreak score
    candidate_ranks.sort(key=lambda cr: (
        cr.average_skill_rank,    # Lower average skill rank = better
        -cr.tiebreak_score        # Higher tiebreak score = better
    ))

    # Assign final universal ranks
    current_rank = 1
    prev_criteria = None

    for i, cr in enumerate(candidate_ranks):
        current_criteria = (cr.average_skill_rank, cr.tiebreak_score)

        if prev_criteria is not None and current_criteria != prev_criteria:
            current_rank = i + 1

        cr.universal_rank = current_rank
        prev_criteria = current_criteria

    return candidate_ranks


# ── Main ranking function ────────────────────────────────────────────────────

def compute_universal_ranking(
    skill_data: List[SkillData],
    candidates: List[CandidateData]
) -> Tuple[Dict[str, List[SkillRank]], List[CandidateRank]]:
    """
    Main function to compute universal ranking.

    Returns:
    - skill_rankings: {skill_name: [SkillRank]}
    - candidate_ranks: [CandidateRank] sorted by universal rank
    """
    # First, rank all skills universally
    skill_rankings = rank_skills_universally(skill_data)

    # Then, calculate candidate universal ranks based on their skill ranks
    candidate_ranks = calculate_candidate_ranks(candidates, skill_rankings)

    return skill_rankings, candidate_ranks


# ── Job-specific ranking functions ──────────────────────────────────────────

def compute_job_ranking(
    candidates: List[CandidateData],
    job_requirements: JobRequirements,
    skill_rankings: Dict[str, List[SkillRank]]
) -> List[JobCandidateRank]:
    """
    Rank candidates for a specific job based on HR requirements.

    Only considers skills specified by HR, with platform tiebreaking.
    """
    job_candidates = []

    for candidate in candidates:
        # Calculate ranks only for required skills
        relevant_skill_ranks = {}
        total_rank = 0
        skill_count = 0

        for skill in job_requirements.required_skills:
            if skill in candidate.skills:
                skill_rank = get_skill_rank(skill, candidate.id, skill_rankings)
                if skill_rank:
                    relevant_skill_ranks[skill] = skill_rank
                    total_rank += skill_rank
                    skill_count += 1

        if skill_count == 0:
            average_rank = 999  # No relevant skills
        else:
            average_rank = total_rank / skill_count

        # Calculate tiebreak score based on HR-selected platforms
        tiebreak_score = 0.0

        # Use total metrics (not streaks) for tiebreaking as per job requirements
        if job_requirements.consider_github and job_requirements.github_total_commits:
            # Use total commits count for tiebreaking
            tiebreak_score += candidate.github_total_commits * 1000

        if job_requirements.consider_leetcode and job_requirements.leetcode_total_solved:
            # Use total problems solved for tiebreaking
            tiebreak_score += candidate.leetcode_total_solved * 100

        if job_requirements.consider_kaggle and job_requirements.kaggle_total_competitions:
            # Use total competitions participated for tiebreaking
            tiebreak_score += candidate.kaggle_total_competitions * 10

        # Final tiebreaker: aspiring learning consistency and streak
        tiebreak_score += (candidate.streak_consistency * 100) + candidate.aspiring_streak

        # Calculate ATS score
        ats_score = calculate_ats_score(candidate, job_requirements)

        job_candidates.append(JobCandidateRank(
            candidate=candidate,
            job_rank=0,  # Will be set after sorting
            relevant_skill_ranks=relevant_skill_ranks,
            average_relevant_rank=average_rank,
            tiebreak_score=tiebreak_score,
            ats_score=ats_score
        ))

    # Sort by average relevant skill rank, then tiebreak score
    job_candidates.sort(key=lambda x: (x.average_relevant_rank, -x.tiebreak_score))

    # Assign job ranks
    current_rank = 1
    for i, candidate in enumerate(job_candidates):
        if i > 0 and (
            candidate.average_relevant_rank != job_candidates[i-1].average_relevant_rank or
            candidate.tiebreak_score != job_candidates[i-1].tiebreak_score
        ):
            current_rank = i + 1
        candidate.job_rank = current_rank

    return job_candidates


# ── Utility functions ────────────────────────────────────────────────────────

def get_skill_rank(skill_name: str, candidate_id: str, skill_rankings: Dict[str, List[SkillRank]]) -> Optional[int]:
    """Get a specific candidate's rank for a specific skill."""
    if skill_name not in skill_rankings:
        return None

    for skill_rank in skill_rankings[skill_name]:
        if skill_rank.candidate_id == candidate_id:
            return skill_rank.rank

    return None


def get_candidate_rank(candidate_id: str, candidate_ranks: List[CandidateRank]) -> Optional[CandidateRank]:
    """Get a candidate's ranking information."""
    for cr in candidate_ranks:
        if cr.candidate.id == candidate_id:
            return cr
    return None
