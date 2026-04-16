import { rankingApi } from "./src/lib/api";
import { streakApi } from "./src/lib/api";
import { supabase } from "./src/integrations/supabase/client";
import fs from "fs";

async function evaluate() {
  console.log("---- LOAD TESTING EVALUATION START ----");
  const data = JSON.parse(fs.readFileSync("test-vars.json", "utf8"));
  
  const jobId = data.jobId;
  const candidateIds = data.candidates.map(c => c.id);
  
  // 1. Fetch the mock job requirements
  const { data: jobInfo } = await supabase.from("jobs").select("requirements").eq("id", jobId).single();
  console.log("Evaluating Job Requirements: ", jobInfo?.requirements || []);

  // 2. Extrapolate Streak Logic for all Candidates
  console.log("\n---- STREAK EXTRACTOR LOGIC TEST ----");
  for (let i = 0; i < candidateIds.length; i++) {
     const streak = await streakApi.getUserStreak(candidateIds[i]);
     console.log(`Candidate ${i+1} Streak: ${streak.currentStreak} Days (Total: ${streak.totalCommits})`);
  }

  // 3. Extrapolate AI Ranking Logic
  console.log("\n---- AI JOB RANKING LOGIC TEST ----");
  try {
     const ranking = await rankingApi.rankJob({
       job_id: jobId,
       required_skills: jobInfo?.requirements || ["React", "TypeScript", "Node.js"]
     });
     
     console.log("AI Ranking Completed!");
     ranking.candidates.forEach((c) => {
         console.log(`[Rank: ${c.rank}] [Score: ${c.score}] ${c.name} | Skills: ${c.matched_skills?.join(", ") || c.experience} | Extracted via Semantic Match`);
     });
  } catch (error) {
     console.error("AI Ranking Failed: ", error);
  }
}

evaluate().then(() => {
  console.log("\n---- TEARDOWN EXECUTING ----");
  const execSync = require("child_process").execSync;
  execSync("node teardown.mjs", { stdio: "inherit" });
  console.log("CLEANUP COMPLETE");
}).catch(console.error);
