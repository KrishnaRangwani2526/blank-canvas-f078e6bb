#!/usr/bin/env python3
"""
demo_job_ranking.py — Test the job-specific ranking system for HR.
"""

from ranking_service import RankingService
from ranking_engine import JobRequirements

def main():
    # Initialize service (uses SQLite by default)
    svc = RankingService()

    print("RANKING: Job-Specific HR Ranking System Demo")
    print("=" * 70)

    # Add sample candidates with full metrics
    candidates_data = [
        {
            "name": "Arjun Sharma",
            "github_streak": 15,
            "leetcode_streak": 25,
            "kaggle_streak": 0,
            "aspiring_streak": 30,
            "skills": ["Python", "Machine Learning", "React", "Node.js"],
            "learning_hours": 200,
            "streak_consistency": 85.5,
            "github_commits": 1250,       # Total commits
            "leetcode_solved": 485,       # Total problems solved
            "projects_count": 8,
            "certificates": 5,
        },
        {
            "name": "Priya Mehta",
            "github_streak": 8,
            "leetcode_streak": 40,
            "kaggle_streak": 5,
            "aspiring_streak": 20,
            "skills": ["Python", "Data Science", "SQL", "TensorFlow"],
            "learning_hours": 180,
            "streak_consistency": 92.0,
            "github_commits": 890,
            "leetcode_solved": 650,
            "kaggle_rank": 250,
            "projects_count": 6,
            "certificates": 7,
        },
        {
            "name": "Rahul Kumar",
            "github_streak": 22,
            "leetcode_streak": 10,
            "kaggle_streak": 12,
            "aspiring_streak": 8,
            "skills": ["JavaScript", "React", "Python", "AWS"],
            "learning_hours": 150,
            "streak_consistency": 78.5,
            "github_commits": 2100,
            "leetcode_solved": 320,
            "projects_count": 12,
            "certificates": 3,
        },
        {
            "name": "Sneha Patel",
            "github_streak": 5,
            "leetcode_streak": 5,
            "kaggle_streak": 2,
            "aspiring_streak": 45,
            "skills": ["Java", "Spring Boot", "MySQL", "Python"],
            "learning_hours": 220,
            "streak_consistency": 95.0,
            "github_commits": 650,
            "leetcode_solved": 280,
            "projects_count": 5,
            "certificates": 9,
        },
    ]

    # Add candidates to database
    print("\nADDING: Candidates...")
    for candidate in candidates_data:
        name = candidate.pop("name")
        svc.upsert(name, **candidate)
        print(f"  + Added {name}")

    # Get universal ranking first
    print("\nRANKING: Computing Universal Rankings...")
    skill_rankings, candidate_ranks = svc.rank_universal()
    print("\nRESULT: Universal Candidate Rankings:")
    print("-" * 50)
    for cr in candidate_ranks:
        print(
            f"  #{cr.universal_rank}: {cr.candidate.name:20s} "
            f"(avg skill rank: {cr.average_skill_rank:.1f})"
        )

    # Now test job-specific ranking
    print("\n" + "=" * 70)
    print("JOB: Job-Specific Ranking (For HR)")
    print("=" * 70)

    # Define a job that requires Python, React, and JavaScript
    job_req = JobRequirements(
        required_skills=["Python", "React", "JavaScript"],
        consider_github=True,
        consider_leetcode=True,
        consider_kaggle=False,
        github_total_commits=True,  # Use total commits for tiebreaking
        leetcode_total_solved=True,  # Use total solved for tiebreaking
        kaggle_total_competitions=False,
    )

    print("\nREQUIREMENTS:")
    print(f"  Skills: {', '.join(job_req.required_skills)}")
    print(f"  GitHub (Total Commits): {job_req.consider_github}")
    print(f"  LeetCode (Total Solved): {job_req.consider_leetcode}")
    print(f"  Kaggle: {job_req.consider_kaggle}")

    # Get job-specific ranking
    job_candidates = svc.rank_for_job(job_req)

    print("\nRESULT: Job Rankings (Based on Required Skills & Metrics):")
    print("-" * 70)
    for jc in job_candidates:
        print(
            f"\n  Rank #{jc.job_rank}: {jc.candidate.name}"
        )
        print(f"    ATS Score: {jc.ats_score:.1f}/100")
        print(f"    Relevant Skill Ranks: {jc.relevant_skill_ranks}")
        print(f"    Avg Relevant Rank: {jc.average_relevant_rank:.1f}")
        print(f"    Tiebreak Score: {jc.tiebreak_score:.1f}")
        print(f"    GitHub Commits: {jc.candidate.github_total_commits}")
        print(f"    LeetCode Solved: {jc.candidate.leetcode_total_solved}")
        print(f"    Consistency: {jc.candidate.streak_consistency:.1f}%")

    print("\n" + "=" * 70)
    print("SUCCESS: Job ranking demonstration completed!")
    print("=" * 70)


if __name__ == "__main__":
    main()
