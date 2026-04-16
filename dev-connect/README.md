# Dev Connect Monorepo

This repository contains multiple UI and backend modules for the Dev Connect hiring platform.
The goal is to unify authentication, candidate and company dashboards, skill intelligence, resume building, ATS analysis, and activity extraction into a single integrated workflow.

## Structure

- `signup-signin/` — Auth and onboarding for candidate and company users.
- `candidate-dashboard/` — Candidate profile, projects, skills, jobs, ATS, resume, and analytics.
- `company-dashboard/` — Company/HR dashboard for job postings, candidate browsing, and profile review.
- `skills-page/` — Dedicated skill analytics dashboard.
- `resume-maker/` — Resume builder UI.
- `skill-extractor/` — Skill extraction UI and functions.
- `ATS-analyzer/` — ATS score analyzer UI.
- `streak-extractor/` — Node backend for activity aggregation.
- `ranking-logic/` — Python ranking engine and ranking service.

## Integration Overview

The platform is designed as a monorepo with shared CI/CD pipelines.
Each front-end app is still an independent Vite project, but they can share the same Supabase backend and authentication model.

### How the workflow connects

- Sign-in/auth is handled by `signup-signin/`.
- `candidate-dashboard/` and `company-dashboard/` use the same Supabase client pattern.
- Company job postings created in `company-dashboard/` appear in `candidate-dashboard/` job listings.
- `skills-page/` is accessible from the candidate sidebar and can be embedded alongside the candidate UI.
- `ranking-logic/` and `streak-extractor/` provide backend ranking and activity scoring support.

## Run locally

Install root dependencies:

```bash
cd d:/hackathon/dev-connect
npm install
```

Start the apps you need in separate terminals:

```bash
npm run dev:auth
npm run dev:candidate
npm run dev:company
npm run dev:skills
npm run dev:resume
npm run dev:extractor
npm run dev:streak
```

## CI / CD

The GitHub Actions workflow builds and validates every workspace app as part of the pipeline.

- `build:all` builds all front-end apps and the skill extractor.
- `test:*` runs the configured Vitest test suites.

## Notes

- To connect candidate and company experiences, point all apps to the same Supabase project via `.env`.
- The candidate dashboard now includes a new skill section in the left sidebar.
- Company job postings are now consumed by the candidate job feed.
