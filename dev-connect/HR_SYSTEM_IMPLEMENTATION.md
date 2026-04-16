# HR System Implementation Summary

## Overview
A comprehensive HR ranking system has been implemented that allows HR professionals to rank candidates based on job-specific requirements, view detailed candidate profiles, and manage the hiring process.

## Key Features Implemented

### 1. Job-Specific Ranking System (`ranking_engine.py`)
- **JobRequirements**: Allows HR to specify:
  - Required skills for the job
  - Platform considerations (GitHub, LeetCode, Kaggle, LinkedIn)
  - Whether to use total metrics vs streaks for tiebreaking
  
- **JobCandidateRank**: Returns for each candidate:
  - Job rank (1, 2, 3, etc.)
  - ATS score (profile completeness & match)
  - Relevant skill ranks (only for required skills)
  - Average relevant skill rank
  - Tiebreak scores based on HR-selected platforms

- **Ranking Logic**:
  1. Rank only by required skills specified by HR
  2. Tiebreak using HR-selected platform totals (commits, problems solved, competitions)
  3. Final tiebreaker: Learning consistency and aspiring streak
  4. Never based on 7-day metrics, always total metrics

### 2. API Endpoints (`api.py`)
- **POST /rank/job**: Ranks candidates for a specific job
  - Input: JobRankRequest with required skills and platform selections
  - Output: JobRankResponse with ranked candidates and ATS scores

- **GET /candidates**: List all candidates
- **POST /candidates/upsert**: Add/update candidates with platform metrics

### 3. HR UI Components

#### HRCandidateProfile Component
- **Left Side (3 cols)**:
  - Cover image and profile header
  - Profile bio and about section
  - Tabbed interface for:
    - Skills (with badges)
    - Education (with timeline)
    - Projects (with collapsible comment sections)
    - Certificates & Awards
  
- **Right Side (1 col)**:
  - ATS Score card (0-100, with color coding)
  - Universal Rank card (global ranking across all candidates)
  - Job Rank card (for specific job opening)
  - Platform Streaks (collapsible, shows GitHub/LeetCode/Kaggle/Aspiring)
  - Consistency percentage
  - Action buttons (View Resume, Download Profile)

#### HRCandidateList Component
- Table view of all candidates for a job
- Shows:
  - Job Rank
  - Candidate name
  - Relevant skills with their ranks
  - ATS Score (with color coding)
  - Learning consistency
  - View profile button
- Sortable by: Rank, ATS Score, Consistency
- Searchable by: Name, Skills

#### JobCandidates Page
- Full job view with candidate rankings
- Filter panel for:
  - Selecting which required skills to emphasize
  - Choosing platforms to consider (GitHub, LeetCode, Kaggle)
  - Total metrics vs streak consideration
- Candidate list updates based on filter selections

### 4. Key Data Structures

#### CandidateData (Enhanced)
```python
id: int
name: str
skills: List[str]
github_streak: int
leetcode_streak: int
kaggle_streak: int
aspiring_streak: int
streak_consistency: float (0-100%)
learning_hours: int
github_total_commits: int      # NEW
leetcode_total_solved: int     # NEW
kaggle_total_competitions: int # NEW
linkedin_connections: int      # NEW (future)
```

#### JobRequirements
```python
required_skills: List[str]
consider_github: bool
consider_linkedin: bool
consider_leetcode: bool
consider_kaggle: bool
github_total_commits: bool     # Use totals for tiebreaking
leetcode_total_solved: bool    # Use totals for tiebreaking
kaggle_total_competitions: bool # Use totals for tiebreaking
```

#### JobCandidateRank
```python
candidate: CandidateData
job_rank: int
relevant_skill_ranks: Dict[str, int]  # Only required skills
average_relevant_rank: float
tiebreak_score: float
ats_score: float (0-100)
```

### 5. ATS Score Calculation
Uses a 100-point system:
- **Skill Match (60%)**: Percentage of required skills present
- **Completeness (40%)**:
  - Skills present (25 pts)
  - Platform connections (15 pts)
  - Learning activity (10 pts)
  - Streak consistency > 50% (10 pts)

### 6. Ranking Logic Highlights

**Universal Ranking** (across all candidates):
1. Rank each skill universally
2. Calculate average skill rank for each candidate
3. Tiebreak: Streak consistency → Learning hours → GitHub → LeetCode

**Job-Specific Ranking** (for HR job opening):
1. Only consider required skills
2. Rank candidates by average relevant skill rank
3. Tiebreak using HR-selected platform totals:
   - GitHub: Total commits (not streak)
   - LeetCode: Total problems solved (not streak)
   - Kaggle: Total competitions (not streak)
4. Final tiebreak: Aspiring learning consistency

## UI Navigation Flow

1. HR views Jobs list
2. Clicks on a job → Goes to JobCandidates page
3. JobCandidates page shows:
   - Filtered candidates ranked for this job
   - Ability to apply additional filters
   - Candidate list with ATS scores and ranks
4. Click "View Profile" → Goes to HRCandidateProfilePage
5. HRCandidateProfilePage shows:
   - Full candidate profile (non-editable)
   - Universal rank, Job rank, ATS score in sidebar
   - Platform streaks (collapsible)
   - All profile sections (Skills, Education, Projects with comments, Certificates)
   - Message candidate button
   - Add comments to projects
   - Resume/profile download options

## Routes Added

- `/jobs/:jobId/candidates` - Job-specific candidate rankings
- `/hr/candidates/:candidateId` - HR view of candidate profile

## Testing

Run `demo_job_ranking.py` to see:
- Universal ranking system
- Job-specific ranking with different requirements
- ATS score calculation
- Tiebreaking logic in action

## Future Enhancements

1. LinkedIn integration for connection count
2. Message threading with candidates
3. Batch operations (send to multiple candidates)
4. Custom scoring formulas for ATS
5. Integration with email/notifications
6. Candidate status tracking (interview, offer, hired)
7. Interview scheduling
8. Feedback/notes on candidates
