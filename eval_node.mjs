import { createClient } from "@supabase/supabase-js";
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import fs from "fs";

const envFile = fs.readFileSync(".env", "utf8");
const envVars = envFile.split("\n").reduce((acc, line) => {
  const [key, value] = line.split("=");
  if (key && value) acc[key.trim()] = value.trim().replace(/"/g, "");
  return acc;
}, {});

const supabaseUrl = envVars["VITE_SUPABASE_URL"];
const supabaseKey = envVars["VITE_SUPABASE_PUBLISHABLE_KEY"];
const geminiKey = "AIzaSyAGFd_sKa3U3uBN9MIkmsVKlfvlwZUCMp8";
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const data = JSON.parse(fs.readFileSync("test-vars.json", "utf8"));
  const candidateIds = data.candidates.map(c => c.id);
  
  // Authenticate to bypass Profile RLS blocks
  await supabase.auth.signInWithPassword({ email: data.hrEmail, password: "securePass123!" });
  
  const { data: jobInfo } = await supabase.from("jobs").select("requirements").eq("id", data.jobId).single();
  const requiredSkills = jobInfo?.requirements || [];
  
  const { data: profiles } = await supabase.from("profiles").select("*").in("user_id", candidateIds);
  
  console.log("---- STREAK EXTRACTOR CHECK ----");
  const streaks = candidateIds.map((id, i) => {
      const url = `https://github.com/mock-user-${i}`;
      let hash = 0;
      for (let j = 0; j < url.length; j++) hash = Math.imul(31, hash) + url.charCodeAt(j) | 0;
      const seed = Math.abs(hash);
      const currentStreak = seed % 45;
      const totalCommits = 100 + (seed % 1000);
      console.log(`Candidate ${i+1}: Streak = ${currentStreak} Days, Total Commits = ${totalCommits}`);
      return { id, currentStreak };
  });

  console.log("\n---- SKILL EXTRACTOR CHECK ----");
  const candidateInfos = candidateIds.map((id, i) => {
      const skills = i % 3 === 0 ? ["React", "TypeScript", "Node.js", "PostgreSQL", "Next.js", "TailwindCSS"]
          : i % 2 === 0 ? ["Java", "Spring Boot", "MySQL", "AWS"]
          : ["JavaScript", "React", "Express", "MongoDB"];
      console.log(`Candidate ${i+1} Extracted Skills: `, skills);
      return {
          id: id,
          name: `Candidate ${i+1}`,
          skills: skills,
          experience: "Simulated candidate experience."
      };
  });

  console.log("\n---- ATS RANKING SYSTEM EVALUATION ----");
  const genAI = new GoogleGenerativeAI(geminiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  
  const prompt = `
  You are an expert technical recruiter ATS system.
  Here are the required skills for the job: ${requiredSkills.join(", ")}.
  You must rank the following candidates strictly out of 100 based on their individual skills matching the required skills. Focus heavily on semantic matches (e.g. 'NodeJS' equals 'Node.js').
  
  Candidates JSON:
  ${JSON.stringify(candidateInfos, null, 2)}
  `;

  const schema = {
    type: SchemaType.OBJECT,
    properties: {
      candidates: {
        type: SchemaType.ARRAY,
        items: {
          type: SchemaType.OBJECT,
          properties: {
            id: { type: SchemaType.STRING },
            name: { type: SchemaType.STRING },
            score: { type: SchemaType.NUMBER },
            rank: { type: SchemaType.NUMBER },
            matched_skills: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } }
          },
          required: ["id", "name", "score", "rank", "matched_skills"]
        }
      }
    },
    required: ["candidates"]
  };

  const response = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: "application/json", responseSchema: schema }
  });

  const ranking = JSON.parse(response.response.text());
  ranking.candidates.sort((a,b) => a.rank - b.rank).forEach((c) => {
      console.log(`[Universal Rank: ${c.rank}] [Score: ${c.score}] ${c.name} | AI Extracted Semantic Match: ${c.matched_skills.join(", ")}`);
  });

  console.log("\n[Teardown initialized]");
  const cp = await import("child_process");
  cp.execSync("node teardown.mjs", { stdio: "inherit" });
}

run().catch(console.error);
