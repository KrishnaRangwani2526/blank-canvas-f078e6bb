# Dev Connect Integration Map

This document describes how the separate subprojects are intended to connect across the Dev Connect workflow.

## Authentication & Role routing

- `signup-signin/` handles account creation and onboarding for both users.
- Users are classified as `candidate` or `company` during onboarding.
- After login, the app navigates to the appropriate dashboard flow.

## Candidate Dashboard

- `candidate-dashboard/` is the candidate’s core profile workspace.
- It reads and writes profile data in Supabase tables such as `profiles`, `experience`, `projects`, `skills`, and `learning_goals`.
- A new skill section has been added to the left sidebar that surfaces the top 4 skills.
- The candidate job board now reads from the shared `jobs` table.
- The new `SkillsPage` route embeds the dedicated `skills-page/` app.

## Company Dashboard

- `company-dashboard/` is the HR and recruiter workspace.
- Job postings are stored in the `jobs` table.
- Candidate browsing is powered by `candidates` and associated candidate detail views.
- This app should use the same Supabase project as the candidate side for live sync.

## Skills and Analytics

- `skills-page/` provides skill intelligence and analytics using the same `skills` and `skill_sources` tables.
- Candidate-side skill updates can surface in the shared skills analytics engine.

## Additional modules

- `resume-maker/` builds candidate resumes in an ATS-friendly format.
- `skill-extractor/` extracts skills from uploaded content or GitHub data.
- `ATS-analyzer/` evaluates profile content for applicant tracking success.
- `streak-extractor/` aggregates activity data from GitHub, LeetCode, and other sources.
- `ranking-logic/` contains the ranking engine and service logic used to score candidates.

## CI/CD flow

1. Commit changes to the monorepo.
2. The GitHub Actions workflow installs dependencies at the root.
3. It builds each front-end workspace.
4. It validates Python ranking scripts with syntax checks.
5. The pipeline completes only when all apps compile successfully.
