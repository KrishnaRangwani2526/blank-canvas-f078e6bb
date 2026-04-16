import { createClient } from "@supabase/supabase-js";
import fs from "fs";

const envFile = fs.readFileSync(".env", "utf8");
const envVars = envFile.split("\n").reduce((acc, line) => {
  const [key, value] = line.split("=");
  if (key && value) acc[key.trim()] = value.trim().replace(/"/g, "");
  return acc;
}, {});

const supabaseUrl = envVars["VITE_SUPABASE_URL"];
const supabaseKey = envVars["VITE_SUPABASE_PUBLISHABLE_KEY"];
export const supabase = createClient(supabaseUrl, supabaseKey);

const requiredSkills = ["React", "TypeScript", "Node.js", "PostgreSQL", "Next.js"];

const mockCandidates = Array.from({ length: 20 }, (_, i) => ({
  email: `test_candidate_v2_${Date.now()}_${i}@example.com`,
  password: `securePass123!`,
  full_name: `Test Candidate ${i + 1}`,
  bio: `I am a determined software engineer specializing in modern web tech.`,
  github_url: `https://github.com/test-user-${i}`,
  leetcode_url: i % 2 === 0 ? `https://leetcode.com/test-user-${i}` : "",
  skills: i % 3 === 0 ? ["React", "TypeScript", "Node.js", "PostgreSQL", "Next.js", "TailwindCSS"]
          : i % 2 === 0 ? ["Java", "Spring Boot", "MySQL", "AWS"]
          : ["JavaScript", "React", "Express", "MongoDB"],
}));

async function seedData() {
  console.log("Creating mock company and job...");
  
  const hrEmail = `hr_v2_${Date.now()}@example.com`;
  const hrAuth = await supabase.auth.signUp({ email: hrEmail, password: "securePass123!" });
  
  if (hrAuth.error) throw new Error("HR Signup Failed: " + hrAuth.error.message);
  
  const companyId = hrAuth.data.user.id;
  await supabase.from("companies").insert({
    id: companyId,
    user_id: companyId,
    name: "Mock Tech Corp V2",
    email: hrEmail
  });

  const jobInsert = await supabase.from("jobs").insert({
    company_id: companyId,
    title: "Senior Full Stack App Developer",
    status: "active",
    job_type: "Full Time",
    work_mode: "Remote",
    requirements: requiredSkills
  }).select("id").single();
  
  const jobId = jobInsert.data.id;
  console.log(`Job created with ID: ${jobId}`);

  const generatedUserIds = [];

  for (let i = 0; i < mockCandidates.length; i++) {
    const c = mockCandidates[i];
    const authRes = await supabase.auth.signUp({ email: c.email, password: c.password });
    if (authRes.error) continue;
    
    const userId = authRes.data.user.id;
    generatedUserIds.push({ id: userId, email: c.email });
    
    await new Promise(r => setTimeout(r, 600));
    
    // Use Upsert to prevent race conditions missing the auth trigger initialization
    await supabase.from("profiles").upsert({
      user_id: userId,
      full_name: c.full_name,
      display_name: c.full_name,
      bio: c.bio,
      github_url: c.github_url,
      leetcode_url: c.leetcode_url,
      skills: c.skills
    });

    const skillsToInsert = c.skills.map(s => ({
      user_id: userId,
      name: s,
      level: "Intermediate"
    }));
    await supabase.from("skills").insert(skillsToInsert);

    await supabase.from("applications").insert({
        user_id: userId,
        job_id: jobId,
        status: "pending",
        resume_url: null
    });
    console.log(`Created Candidate ${i + 1}`);
  }

  fs.writeFileSync("test-vars.json", JSON.stringify({
    hrId: companyId,
    hrEmail: hrEmail, // Explicitly saved this time
    jobId,
    candidates: generatedUserIds
  }, null, 2));
}

seedData().catch(console.error);
