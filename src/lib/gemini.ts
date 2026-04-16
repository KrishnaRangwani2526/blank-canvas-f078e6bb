import { supabase } from "@/integrations/supabase/client";

/**
 * Utility to generate JSON structured output using Lovable AI Gateway.
 */
export async function generateJSONWithGemini(prompt: string): Promise<any> {
  const { data, error } = await supabase.functions.invoke("ai-generate", {
    body: {
      prompt,
      mode: "json",
      system: "You are a helpful assistant. Always respond with valid JSON only, no markdown formatting.",
    },
  });

  if (error) {
    console.error("AI generate error:", error);
    throw new Error(error.message || "AI generation failed");
  }

  return data;
}

/**
 * Utility for general text/markdown generation using Lovable AI Gateway.
 */
export async function generateTextWithGemini(prompt: string): Promise<string> {
  const { data, error } = await supabase.functions.invoke("ai-generate", {
    body: {
      prompt,
      mode: "text",
      system: "You are a helpful assistant.",
    },
  });

  if (error) {
    console.error("AI generate error:", error);
    throw new Error(error.message || "AI generation failed");
  }

  return data?.text || "";
}
