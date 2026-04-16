// API client for backend services

const RANKING_API_BASE = 'http://localhost:8000'; // Python FastAPI
const STREAK_API_BASE = 'http://localhost:5000'; // Node.js Express

export interface JobRankRequest {
  job_id: string;
  required_skills: string[];
}

export interface JobRankResponse {
  candidates: Array<{
    id: string;
    name: string;
    rank: number;
    ats_score: number;
    skills: string[];
    platforms: {
      github?: string;
      leetcode?: string;
      kaggle?: string;
    };
  }>;
}

export interface ProfileAnalysisRequest {
  github_url?: string;
  leetcode_url?: string;
  kaggle_url?: string;
}

export interface ProfileAnalysisResponse {
  github_streak: number;
  leetcode_solved: number;
  kaggle_competitions: number;
  total_score: number;
}

export const rankingApi = {
  rankJob: async (request: JobRankRequest): Promise<JobRankResponse> => {
    const response = await fetch(`${RANKING_API_BASE}/rank/job`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
    if (!response.ok) {
      throw new Error('Failed to rank job candidates');
    }
    return response.json();
  },
};

export const streakApi = {
  analyzeProfile: async (request: ProfileAnalysisRequest): Promise<ProfileAnalysisResponse> => {
    const response = await fetch(`${STREAK_API_BASE}/analyze-profile`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
    if (!response.ok) {
      throw new Error('Failed to analyze profile');
    }
    return response.json();
  },
};