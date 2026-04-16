import { supabase } from "@/integrations/supabase/client";

/**
 * Generate JSON structured output via Lovable AI Gateway.
 * Uses Gemini 2.5 Pro by default for deeper reasoning on analysis tasks.
 */
export async function generateJSONWithGemini(
  prompt: string,
  options?: { system?: string; model?: string }
): Promise<any> {
  const { data, error } = await supabase.functions.invoke("ai-generate", {
    body: {
      prompt,
      mode: "json",
      model: options?.model || "google/gemini-2.5-pro",
      system:
        options?.system ||
        "You are a senior career coach and technical recruiter with 15+ years of experience reviewing engineering profiles. You give specific, evidence-based feedback grounded in the candidate's actual data — never generic advice. Always quote concrete details (project names, skill names, streak numbers) when explaining your reasoning. Respond with valid JSON only, no markdown.",
    },
  });

  if (error) {
    console.error("AI generate error:", error);
    throw new Error(error.message || "AI generation failed");
  }

  return data;
}

/**
 * Generate text/markdown via Lovable AI Gateway.
 */
export async function generateTextWithGemini(
  prompt: string,
  options?: { system?: string; model?: string }
): Promise<string> {
  const { data, error } = await supabase.functions.invoke("ai-generate", {
    body: {
      prompt,
      mode: "text",
      model: options?.model || "google/gemini-2.5-pro",
      system:
        options?.system ||
        "You are a thoughtful, expert assistant. Be specific, insightful, and avoid generic boilerplate.",
    },
  });

  if (error) {
    console.error("AI generate error:", error);
    throw new Error(error.message || "AI generation failed");
  }

  return data?.text || "";
}
