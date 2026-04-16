"""
repository.py — DB operations for Candidates.
All ranking calls go through the engine; this file only touches the DB.
"""

from __future__ import annotations
from typing import List, Optional, Dict, Any
import os
from supabase import create_client, Client

from ranking_engine import CandidateData

# Supabase client
SUPABASE_URL = os.environ.get("SUPABASE_URL", "https://zzmtbeitrrjxukmtyvuf.supabase.co")
SUPABASE_KEY = os.environ.get("SUPABASE_ANON_KEY", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp6bXRiZWl0cnJqeHVrbXR5dnVmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYwOTU1NTAsImV4cCI6MjA5MTY3MTU1MH0.glBDg4pvoyHez3E_O7FVOSZ1CN5LJezLWqtaeHmmKFA")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)


# ── Conversion ────────────────────────────────────────────────────────────────

def _to_candidate_data(profile: Dict[str, Any], skills: List[str]) -> CandidateData:
    return CandidateData(
        id=profile['user_id'],
        name=profile['full_name'] or 'Unknown',
        skills=skills,
        github_streak=0,  # TODO: fetch from streak service
        leetcode_streak=0,
        kaggle_streak=0,
        aspiring_streak=0,
        streak_consistency=0.0,
        learning_hours=0,
        github_total_commits=0,
        leetcode_total_solved=0,
        kaggle_total_competitions=0,
        linkedin_connections=0,
    )


# ── Read ──────────────────────────────────────────────────────────────────────

def get_all() -> List[Dict[str, Any]]:
    response = supabase.table('profiles').select('*').execute()
    return response.data or []


def get_by_id(candidate_id: str) -> Optional[Dict[str, Any]]:
    response = supabase.table('profiles').select('*').eq('user_id', candidate_id).execute()
    return response.data[0] if response.data else None


def get_candidate_data(names: Optional[List[str]] = None) -> List[CandidateData]:
    """
    Fetch candidates from Supabase and return as CandidateData objects
    ready for the ranking engine.

    names: if provided, only return those candidates (by name).
    """
    # Fetch profiles
    query = supabase.table('profiles').select('*')
    if names:
        # Filter by full_name
        query = query.in_('full_name', names)
    profiles_response = query.execute()
    profiles = profiles_response.data or []

    candidates = []
    for profile in profiles:
        # Fetch skills for this user
        skills_response = supabase.table('skills').select('name').eq('user_id', profile['user_id']).execute()
        skills = [skill['name'] for skill in skills_response.data or []]
        candidates.append(_to_candidate_data(profile, skills))

    return candidates


def filter_by_skill_tags(required_tags: List[str], match_all: bool = False) -> List[CandidateData]:
    """
    Return candidates who have at least one (or all, if match_all=True)
    of the required_tags in their skills.
    """
    all_candidates = get_candidate_data()
    result = []
    for candidate in all_candidates:
        candidate_skills = set(s.lower() for s in candidate.skills)
        required = set(t.lower() for t in required_tags)
        if match_all:
            if required.issubset(candidate_skills):
                result.append(candidate)
        else:
            if required & candidate_skills:
                result.append(candidate)
    return result


# ── Write ─────────────────────────────────────────────────────────────────────

def create_candidate(data: Dict[str, Any]) -> Dict[str, Any]:
    """
    data keys mirror the profiles table columns.
    """
    # Only include valid fields for profiles table
    valid_fields = {
        'user_id', 'full_name', 'github_url', 'leetcode_url', 'kaggle_url',
        'about', 'bio', 'currently_learning', 'location', 'open_to_work',
        'portfolio_url', 'seeking_type', 'work_mode'
    }
    filtered_data = {k: v for k, v in data.items() if k in valid_fields}
    response = supabase.table('profiles').insert(filtered_data).execute()
    return response.data[0] if response.data else {}


