"""
models.py — SQLAlchemy ORM models for the candidate ranking system.
Supports PostgreSQL, MySQL, and SQLite via DATABASE_URL env var.
"""

from sqlalchemy import (
    Column, Integer, String, Float, DateTime, Text, JSON,
    create_engine, UniqueConstraint
)
from sqlalchemy.orm import declarative_base, sessionmaker
from sqlalchemy.sql import func
import os

Base = declarative_base()


class Candidate(Base):
    """
    Core candidate record.
    All platform metrics are nullable — a candidate may not have linked
    every platform yet.
    """
    __tablename__ = "candidates"

    id              = Column(Integer, primary_key=True, autoincrement=True)
    name            = Column(String(120), nullable=False, unique=True)

    # ── Streaks (primary ranking factors) ─────────────────────────────
    github_streak     = Column(Integer, nullable=True, default=0)   # GitHub contribution streak (days)
    leetcode_streak   = Column(Integer, nullable=True, default=0)   # LeetCode solving streak (days)
    kaggle_streak     = Column(Integer, nullable=True, default=0)   # Kaggle activity streak (days)
    aspiring_streak   = Column(Integer, nullable=True, default=0)   # Aspiring learning streak (days ≥1 hour)

    # ── Skills and learning data ──────────────────────────────────────
    skills            = Column(JSON,    nullable=True, default=list) # List of skill names
    learning_hours    = Column(Integer, nullable=True, default=0)   # Total hours spent learning
    streak_consistency = Column(Float,  nullable=True, default=0.0) # Average streak consistency (0-100)

    # ── Legacy fields (kept for compatibility) ────────────────────────
    consistency     = Column(Float,   nullable=True)   # 0–100 %
    streak          = Column(Integer, nullable=True)   # days (deprecated, use github_streak)
    leetcode_solved = Column(Integer, nullable=True)   # total problems solved
    kaggle_rank     = Column(Integer, nullable=True)   # lower = better
    github_commits  = Column(Integer, nullable=True)   # total commit count
    projects_count  = Column(Integer, nullable=True)   # deployed projects
    certificates    = Column(Integer, nullable=True)
    skills_count    = Column(Integer, nullable=True)
    readme_skills   = Column(Integer, nullable=True)   # skills listed in GitHub README
    skill_tags      = Column(JSON,    nullable=True, default=list) # Free-form skill tags

    created_at      = Column(DateTime(timezone=True), server_default=func.now())
    updated_at      = Column(DateTime(timezone=True), onupdate=func.now())

    def __repr__(self):
        return f"<Candidate id={self.id} name={self.name!r}>"

    def to_dict(self) -> dict:
        return {
            "id":               self.id,
            "name":             self.name,
            "github_streak":    self.github_streak or 0,
            "leetcode_streak":  self.leetcode_streak or 0,
            "kaggle_streak":    self.kaggle_streak or 0,
            "aspiring_streak":  self.aspiring_streak or 0,
            "skills":           self.skills or [],
            "learning_hours":   self.learning_hours or 0,
            "streak_consistency": self.streak_consistency or 0.0,
            # Legacy fields for backward compatibility
            "consistency":      self.consistency,
            "streak":           self.streak,
            "leetcode_solved":  self.leetcode_solved,
            "kaggle_rank":      self.kaggle_rank,
            "github_commits":   self.github_commits,
            "projects_count":   self.projects_count,
            "certificates":     self.certificates,
            "skills_count":     self.skills_count,
            "readme_skills":    self.readme_skills,
            "skill_tags":       self.skill_tags or [],
        }


# ── DB connection factory ─────────────────────────────────────────────────────

def get_engine(database_url: str = None):
    """
    Returns a SQLAlchemy engine.

    Priority:
      1. database_url argument
      2. DATABASE_URL environment variable
      3. Falls back to local SQLite file  (ranking.db)

    Example URLs:
      PostgreSQL : postgresql://user:pass@localhost:5432/rankingdb
      MySQL      : mysql+pymysql://user:pass@localhost:3306/rankingdb
      SQLite     : sqlite:///ranking.db
    """
    url = database_url or os.getenv("DATABASE_URL", "sqlite:///ranking.db")
    engine = create_engine(url, echo=False, future=True)
    return engine


def init_db(engine=None):
    """Create all tables if they don't exist yet."""
    if engine is None:
        engine = get_engine()
    Base.metadata.create_all(engine)
    return engine


def get_session(engine=None):
    """Return a SQLAlchemy Session class bound to the given engine."""
    if engine is None:
        engine = get_engine()
    Session = sessionmaker(bind=engine, autoflush=True, autocommit=False)
    return Session
