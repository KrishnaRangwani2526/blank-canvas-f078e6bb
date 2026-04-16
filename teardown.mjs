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

async function teardown() {
  if (fs.existsSync("test-vars.json")) {
    const data = JSON.parse(fs.readFileSync("test-vars.json"));
    console.log("Tearing down jobs, applications, and skills...");
    
    await supabase.from("applications").delete().eq("job_id", data.jobId);
    
    const candidateIds = data.candidates.map(c => c.id);
    for(const cid of candidateIds) {
        await supabase.from("skills").delete().eq("user_id", cid);
        // Note: auth.users deletion needs admin panel, but profiles can be cleared if needed
    }
    await supabase.from("jobs").delete().eq("id", data.jobId);
    console.log("Teardown basic associations complete.");
  }
}
teardown().catch(console.error);
