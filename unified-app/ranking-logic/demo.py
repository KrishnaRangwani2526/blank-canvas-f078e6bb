"""
demo.py — Seed sample data and showcase every ranking mode.

Run:
    python demo.py
"""

from ranking_service import RankingService
from ranking_engine import FilterConfig

svc = RankingService()  # SQLite by default → ranking.db

# ── 1. Seed sample candidates ─────────────────────────────────────────────────
print("Seeding candidates...")

candidates = [
    dict(name="Arjun Sharma",   consistency=88, streak=72,  leetcode_solved=210,
         kaggle_rank=5,  github_commits=420, projects_count=5,
         readme_skills=8,  certificates=4, skills_count=9,
         skill_tags=["Python", "ML", "React"]),

    dict(name="Priya Mehta",    consistency=95, streak=90,  leetcode_solved=180,
         kaggle_rank=3,  github_commits=310, projects_count=4,
         readme_skills=6,  certificates=6, skills_count=11,
         skill_tags=["Python", "Data Science", "SQL"]),

    dict(name="Rahul Verma",    consistency=70, streak=55,  leetcode_solved=350,
         kaggle_rank=8,  github_commits=620, projects_count=7,
         readme_skills=12, certificates=3, skills_count=7,
         skill_tags=["C++", "DSA", "System Design"]),

    dict(name="Sneha Patel",    consistency=82, streak=78,  leetcode_solved=260,
         kaggle_rank=2,  github_commits=480, projects_count=6,
         readme_skills=10, certificates=5, skills_count=12,
         skill_tags=["Python", "ML", "SQL", "Tableau"]),

    dict(name="Karan Singh",    consistency=91, streak=85,  leetcode_solved=140,
         kaggle_rank=4,  github_commits=280, projects_count=3,
         readme_skills=5,  certificates=7, skills_count=8,
         skill_tags=["JavaScript", "React", "Node.js"]),

    dict(name="Divya Nair",     consistency=65, streak=60,  leetcode_solved=400,
         kaggle_rank=6,  github_commits=750, projects_count=8,
         readme_skills=14, certificates=2, skills_count=10,
         skill_tags=["Python", "Django", "DevOps", "Docker"]),

    dict(name="Amit Joshi",     consistency=78, streak=70,  leetcode_solved=300,
         kaggle_rank=9,  github_commits=390, projects_count=5,
         readme_skills=7,  certificates=4, skills_count=6,
         skill_tags=["Java", "Spring Boot", "SQL"]),

    dict(name="Ananya Reddy",   consistency=88, streak=82,  leetcode_solved=220,
         kaggle_rank=1,  github_commits=340, projects_count=4,
         readme_skills=9,  certificates=8, skills_count=13,
         skill_tags=["Python", "ML", "Data Science", "Tableau"]),
]

for c in candidates:
    svc.upsert(**c)

print(f"  {len(candidates)} candidates seeded.\n")


# ── 2. Universal ranking ──────────────────────────────────────────────────────
print("=" * 60)
print("UNIVERSAL RANKING  (Primary×4 | Secondary×3 | Tertiary×2 | Last×1)")
print("=" * 60)

results = svc.rank_universal()
for r in results:
    print(f"  #{r.overall_rank:2}  {r.candidate.name:<20}  score={r.overall_score:7.1f}"
          f"  tiebreak: proj={r.tiebreak_values['projects_count']}"
          f" readme={r.tiebreak_values['readme_skills']}"
          f" certs={r.tiebreak_values['certificates']}")


# ── 3. Filtered ranking — lexicographic, user-set priority ───────────────────
print("\n" + "=" * 60)
print("FILTERED RANKING — Lexicographic")
print("Priority: github_commits > leetcode_solved > consistency")
print("=" * 60)

cfg_lex = FilterConfig(
    priority_order=["github_commits", "leetcode_solved", "consistency"],
    use_weighted=False,
)
results = svc.rank_filtered(cfg_lex)
for r in results:
    ranks = "  ".join(f"{k.replace('_',' ')}=#{v}" for k, v in r.sub_ranks.items())
    print(f"  #{r.overall_rank:2}  {r.candidate.name:<20}  [{ranks}]")


# ── 4. Filtered ranking — weighted, custom weights set by user ────────────────
print("\n" + "=" * 60)
print("FILTERED RANKING — Weighted composite (user-set weights)")
print("github_commits×5  |  leetcode_solved×3  |  consistency×2")
print("=" * 60)

cfg_w = FilterConfig(
    priority_order=["github_commits", "leetcode_solved", "consistency"],
    custom_weights={"github_commits": 5, "leetcode_solved": 3, "consistency": 2},
    use_weighted=True,
)
results = svc.rank_filtered(cfg_w)
for r in results:
    print(f"  #{r.overall_rank:2}  {r.candidate.name:<20}  score={r.overall_score:.1f}")


# ── 5. Cancel a metric at runtime ─────────────────────────────────────────────
print("\n" + "=" * 60)
print("CANCEL leetcode_solved → now only github_commits×5 | consistency×2")
print("=" * 60)

cfg_w.priority_order.remove("leetcode_solved")
cfg_w.custom_weights.pop("leetcode_solved", None)
results = svc.rank_filtered(cfg_w)
for r in results:
    print(f"  #{r.overall_rank:2}  {r.candidate.name:<20}  score={r.overall_score:.1f}")


# ── 6. Skill-tag filter → then rank within that pool ─────────────────────────
print("\n" + "=" * 60)
print("SKILL FILTER: only candidates with 'Python' OR 'ML'")
print("Then rank by: kaggle_rank > consistency")
print("=" * 60)

cfg_skill = FilterConfig(
    priority_order=["kaggle_rank", "consistency"],
    use_weighted=False,
)
results = svc.rank_filtered(cfg_skill, skill_filter=["Python", "ML"])
for r in results:
    print(f"  #{r.overall_rank:2}  {r.candidate.name:<20}"
          f"  kaggle_rank=#{r.sub_ranks.get('kaggle_rank','?')}"
          f"  consistency=#{r.sub_ranks.get('consistency','?')}"
          f"  tags={r.candidate.skill_tags}")


# ── 7. Available metrics catalogue ────────────────────────────────────────────
print("\n" + "=" * 60)
print("AVAILABLE METRICS (pass these keys to FilterConfig.priority_order)")
print("=" * 60)
for key, m in svc.available_metrics().items():
    print(f"  {key:<20}  tier={m['tier']} ({m['tier_label']:<10})"
          f"  default_weight={m['default_weight']}"
          f"  higher_is_better={m['higher_is_better']}")
