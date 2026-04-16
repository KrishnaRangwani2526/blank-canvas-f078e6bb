"""
api.py — FastAPI REST endpoints for the ranking system.

Run:
    uvicorn api:app --reload

Endpoints
─────────
POST   /candidates/upsert            add or update a candidate by name
GET    /candidates                   list all candidates
DELETE /candidates/{id}              remove a candidate

GET    /metrics                      list available metric keys

POST   /rank/universal               rank all (or named subset)
POST   /rank/filtered                filtered + prioritised rank
"""

from __future__ import annotations
from typing import List, Optional, Dict, Any

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from ranking_service import RankingService

app = FastAPI(title="Candidate Ranking API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # tighten in production
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Dependency ────────────────────────────────────────────────────────────────

def get_service() -> RankingService:
    return RankingService()


# ── Request / Response schemas ────────────────────────────────────────────────

class CandidateUpsert(BaseModel):
    name:            str
    github_streak:   Optional[int] = 0
    leetcode_streak: Optional[int] = 0
    kaggle_streak:   Optional[int] = 0
    aspiring_streak: Optional[int] = 0
    skills:          Optional[List[str]] = Field(default_factory=list)
    learning_hours:  Optional[int] = 0
    streak_consistency: Optional[float] = 0.0
    # Legacy fields for backward compatibility
    consistency:     Optional[float] = None
    streak:          Optional[int]   = None
    leetcode_solved: Optional[int]   = None
    kaggle_rank:     Optional[int]   = None
    github_commits:  Optional[int]   = None
    projects_count:  Optional[int]   = None
    certificates:    Optional[int]   = None
    skills_count:    Optional[int]   = None
    readme_skills:   Optional[int]   = None
    skill_tags:      Optional[List[str]] = Field(default_factory=list)


class UniversalRankRequest(BaseModel):
    names: Optional[List[str]] = None         # if omitted → rank everyone


class UniversalRankResponse(BaseModel):
    skill_rankings: Dict[str, List[dict]]
    candidate_ranks: List[dict]


class JobRankRequest(BaseModel):
    """
    Job-specific ranking request from HR.
    """
    job_id: str
    required_skills: List[str]


class JobRankResponse(BaseModel):
    job_candidates: List[dict]  # List of job candidate rankings with ATS scores


# ── Candidate endpoints ───────────────────────────────────────────────────────

@app.post("/candidates/upsert", summary="Add or update a candidate by name")
def upsert_candidate(body: CandidateUpsert, svc: RankingService = Depends(get_service)):
    return svc.upsert(body.name, **body.model_dump(exclude={"name"}, exclude_none=True))


@app.get("/candidates", summary="List all candidates")
def list_candidates(svc: RankingService = Depends(get_service)):
    return svc.list_candidates()




# ── Metrics catalogue ─────────────────────────────────────────────────────────

@app.get("/metrics", summary="List available ranking metrics")
def list_metrics(svc: RankingService = Depends(get_service)):
    return svc.available_metrics()


# ── Ranking endpoints ─────────────────────────────────────────────────────────

@app.post("/rank/universal", response_model=UniversalRankResponse, summary="Compute universal skill-based ranking")
def rank_universal(req: UniversalRankRequest, svc: RankingService = Depends(get_service)):
    skill_rankings, candidate_ranks = svc.rank_universal()

    return UniversalRankResponse(
        skill_rankings=svc.format_skill_rankings(skill_rankings),
        candidate_ranks=svc.format_candidate_ranks(candidate_ranks)
    )


@app.post("/rank/job", response_model=JobRankResponse, summary="Rank candidates for a specific job")
def rank_for_job(req: JobRankRequest, svc: RankingService = Depends(get_service)):
    from ranking_engine import JobRequirements
    
    job_req = JobRequirements(
        required_skills=req.required_skills,
        consider_github=False,  # For now, not considering platform data
        consider_linkedin=False,
        consider_leetcode=False,
        consider_kaggle=False,
        github_total_commits=False,
        leetcode_total_solved=False,
        kaggle_total_competitions=False,
    )
    
    job_candidates = svc.rank_for_job(job_req)
    
    return JobRankResponse(
        job_candidates=svc.format_job_candidates(job_candidates)
    )


@app.get("/rank/skill/{skill_name}/candidate/{candidate_id}", summary="Get candidate's rank for a specific skill")
def get_skill_rank(skill_name: str, candidate_id: str, svc: RankingService = Depends(get_service)):
    rank = svc.get_skill_rank(skill_name, candidate_id)
    if rank is None:
        raise HTTPException(status_code=404, detail="Skill or candidate not found")
    return {"skill": skill_name, "candidate_id": candidate_id, "rank": rank}


@app.get("/rank/candidate/{candidate_id}", summary="Get candidate's universal ranking")
def get_candidate_rank(candidate_id: str, svc: RankingService = Depends(get_service)):
    candidate_rank = svc.get_candidate_rank(candidate_id)
    if candidate_rank is None:
        raise HTTPException(status_code=404, detail="Candidate not found")

    return {
        "universal_rank": candidate_rank.universal_rank,
        "candidate_id": candidate_rank.candidate.id,
        "candidate_name": candidate_rank.candidate.name,
        "average_skill_rank": candidate_rank.average_skill_rank,
        "skill_ranks": candidate_rank.skill_ranks,
        "tiebreak_score": candidate_rank.tiebreak_score,
    }
