# Unified Developer Activity Tracker

Backend API that aggregates developer activity from GitHub, LeetCode, and Kaggle.

## Setup

```bash
npm install
cp .env.example .env
# Add your GITHUB_TOKEN to .env (optional but avoids rate limits)
npm run dev
```

## API

### POST /api/analyze-profile

**Request body:**
```json
{
  "github_url": "https://github.com/username",
  "leetcode_url": "https://leetcode.com/username",
  "kaggle_url": "https://www.kaggle.com/username"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "github": {
      "today_commits": 3,
      "weekly_commits": 18,
      "active_days": 5,
      "streak": 7
    },
    "leetcode": {
      "today_solved": 1,
      "weekly_solved": 6,
      "streak": 4
    },
    "kaggle": {
      "weekly_activity": 0,
      "last_active_days_ago": null,
      "note": "Kaggle integration pending — no public API available"
    }
  }
}
```

## Project Structure

```
├── server.js
├── routes/
│   └── index.js
├── controllers/
│   └── analyzeController.js
├── services/
│   ├── githubService.js
│   ├── leetcodeService.js
│   └── kaggleService.js
└── utils/
    └── metricsEngine.js
```

## Notes

- GitHub uses the public Events API (no token needed, but add one to avoid 60 req/hr limit)
- LeetCode uses their GraphQL API with the `submissionCalendar` field
- Kaggle has no public API — returns mock data placeholder
