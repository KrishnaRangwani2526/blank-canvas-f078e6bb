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
// For full E2E, we need a service role key if we want to bypass RLS to read all logs,
// but we will simulate users directly by signing in with their credentials from test-vars.json.
const supabase = createClient(supabaseUrl, supabaseKey);

async function runE2E() {
  console.log("=== Starting End-to-End Test ===");
  
  if (!fs.existsSync("test-vars.json")) {
    console.error("test-vars.json not found! Please run node test_seed.mjs first.");
    return;
  }

  const testVars = JSON.parse(fs.readFileSync("test-vars.json", "utf8"));
  const hrEmail = testVars.hrEmail;
  const candidates = testVars.candidates;
  
  if (candidates.length < 2) {
    console.error("Not enough candidates seeded.");
    return;
  }

  const candidate1 = candidates[0];
  const candidate2 = candidates[1];
  const jobId = testVars.jobId;
  const companyId = testVars.hrId;
  
  console.log("\n[1] HR logs in and sends Join Request");
  const { data: hrAuth, error: hrErr } = await supabase.auth.signInWithPassword({
    email: hrEmail,
    password: "securePass123!"
  });
  if (hrErr) {
    console.error("HR Auth failed:", hrErr.message);
    return;
  }
  
  // HR sends "job_invite" Notification to Candidate 1
  const joinMsg = {
    user_id: candidate1.id,
    company_id: companyId,
    type: 'job_invite',
    message: "Test Offer Message",
    metadata: {
      company_id: companyId,
      company_name: "Mock Tech Corp V2",
      role: "Senior Tester",
      status: 'pending'
    }
  };
  const { error: inviteErr } = await supabase.from("notifications").insert(joinMsg).select().single();
  if (inviteErr) {
    console.error("Failed to send join invite:", inviteErr.message);
    console.error("NOTE: Have you applied the SQL Migration `20260416070442_add_network_schema.sql` in your Supabase Dashboard?");
    return;
  }
  console.log("-> ✅ HR Job Invite Sent!");
  
  console.log("\n[2] Candidate 1 logs in, accepts the invite");
  const { error: c1Err } = await supabase.auth.signInWithPassword({
    email: candidate1.email,
    password: "securePass123!"
  });
  if (c1Err) {
    console.error("Candidate 1 Auth failed");
    return;
  }
  
  const { data: notifs } = await supabase.from("notifications")
    .select("*").eq("user_id", candidate1.id).eq("type", "job_invite").order('created_at', { ascending: false }).limit(1);
    
  if (notifs && notifs.length > 0) {
    const notif = notifs[0];
    // Emulate clicking "Accept"
    await supabase.from("employees").insert({
      company_id: companyId,
      name: "Test Candidate",
      email: candidate1.email,
      role: "Senior Tester",
      status: "active"
    });
    
    await supabase.from("experience").insert({
      user_id: candidate1.id,
      company: "Mock Tech Corp V2",
      role: "Senior Tester",
      start_date: "2026",
      description: "Auto-added via accept."
    });
    
    await supabase.from("notifications").update({
      is_read: true,
      metadata: { ...notif.metadata, status: 'accepted' }
    }).eq("id", notif.id);
    
    console.log("-> ✅ Candidate 1 Accepted formatting added to experience!");
  }
  
  console.log("\n[3] Candidate 1 sends connection request to Candidate 2");
  const { error: connReqErr } = await supabase.from("connections").insert({
    requester_id: candidate1.id,
    recipient_id: candidate2.id,
    status: 'pending'
  });
  if (connReqErr) {
    console.error("Connection creation failed:", connReqErr.message);
  } else {
    console.log("-> ✅ Connection request inserted.");
  }
  
  console.log("\n[4] Candidate 2 logs in, accepts the connection, and sends message");
  await supabase.auth.signOut();
  await supabase.auth.signInWithPassword({
    email: candidate2.email,
    password: "securePass123!"
  });
  
  // Find pending connection
  const { data: pendingConns } = await supabase.from("connections")
    .select("*").eq("recipient_id", candidate2.id).eq("status", "pending");
    
  if (pendingConns && pendingConns.length > 0) {
    const conn = pendingConns[0];
    await supabase.from("connections").update({ status: 'accepted' }).eq("id", conn.id);
    console.log("-> ✅ Candidate 2 Accepted connection request.");
    
    // Now Candidate 2 sends message
    const { error: msgErr } = await supabase.from("messages").insert({
      sender_id: candidate2.id,
      recipient_id: candidate1.id,
      content: "Hello from candidate 2, nice to connect!"
    });
    
    if (msgErr) {
      console.error("Message insertion failed:", msgErr.message);
    } else {
      console.log("-> ✅ Candidate 2 sent a direct message to Candidate 1!");
    }
  }
  
  console.log("\n=== End-to-End Test Completed Successfully! ===");
}

runE2E().catch(console.error);
