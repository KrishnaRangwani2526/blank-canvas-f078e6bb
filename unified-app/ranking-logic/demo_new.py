#!/usr/bin/env python3
"""
demo.py — Test the new universal skill-based ranking system.
"""

from ranking_service import RankingService

def main():
    # Initialize service (uses SQLite by default)
    svc = RankingService()

    print("🎯 New Universal Skill-Based Ranking System Demo")
    print("=" * 60)

    # Add sample candidates with new fields
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
        },
        {
            "name": "Sneha Patel",
            "github_streak": 5,
            "leetcode_streak": 5,
            "kaggle_streak": 2,
            "aspiring_streak": 45,
            "skills": ["Java", "Spring Boot", "MySQL"],
            "learning_hours": 220,
            "streak_consistency": 95.0,
        },
    ]

    # Add candidates to database
    print("\n📝 Adding candidates...")
    # for candidate in candidates_data:
    #     name = candidate.pop("name")
    #     svc.upsert(name, **candidate)
    #     print(f"  ✓ Added {name}")
    print("  ✓ Using existing candidates from database")

    # Get universal ranking
    print("\n🏆 Computing Universal Ranking...")
    skill_rankings, candidate_ranks = svc.rank_universal()

    # Display skill rankings
    print("\n📊 Universal Skill Rankings:")
    print("-" * 40)
    for skill_name, ranks in skill_rankings.items():
        print(f"\n🔹 {skill_name}:")
        for rank_info in ranks[:3]:  # Show top 3 for each skill
            print(f"  #{rank_info.rank}: {rank_info.candidate_name}")

    # Display candidate rankings
    print("\n👥 Candidate Universal Rankings:")
    print("-" * 50)
    print("<10")
    for cr in candidate_ranks:
        skills_str = ", ".join(cr.candidate.skills[:2]) + ("..." if len(cr.candidate.skills) > 2 else "")
        print("<10")

    # Test individual lookups
    print("\n🔍 Individual Lookups:")
    print("-" * 30)

    # Get Arjun's rank for Python
    arjun_python_rank = svc.get_skill_rank("Python", 1)
    print(f"Arjun's Python rank: #{arjun_python_rank}")

    # Get Priya's overall ranking
    priya_rank = svc.get_candidate_rank(2)
    if priya_rank:
        print(f"Priya's universal rank: #{priya_rank.universal_rank} (avg skill rank: {priya_rank.average_skill_rank:.1f})")

    print("\n✨ Demo completed!")

if __name__ == "__main__":
    main()