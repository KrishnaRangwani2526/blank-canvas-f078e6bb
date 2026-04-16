import fs from "fs";
import { createClient } from "@supabase/supabase-js";

const envFile = fs.readFileSync(".env", "utf8");
const envVars = envFile.split("\n").reduce((acc, line) => {
  const [key, value] = line.split("=");
  if (key && value) acc[key.trim()] = value.trim().replace(/"/g, "");
  return acc;
}, {});

const supabase = createClient(envVars["VITE_SUPABASE_URL"], envVars["VITE_SUPABASE_PUBLISHABLE_KEY"]);
const data = JSON.parse(fs.readFileSync("test-vars.json"));

async function run() {
  const { data: cData, error } = await supabase.from("companies").select("*").eq("id", data.hrId);
  if (error) console.error(error);
  else {
    console.log("HR_EMAIL: ", cData[0].email);
    console.log("JOB_ID: ", data.jobId);
  }
}
run();
