const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { content, file_base64, file_type, file_name } = body;
    if (!content && !file_base64) {
      return new Response(JSON.stringify({ error: "Content or file is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "LOVABLE_API_KEY not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const systemPrompt = `You are a skill extraction AI. Given text content (certificate name, project description, or GitHub profile), extract technical skills.

Return a JSON object with this exact structure:
{
  "detected_type": "certificate" | "project" | "github",
  "skills": [{"name": "string", "category": "language"|"framework"|"tool"|"database"|"concept", "percentage": number}],
  "summary": "string",
  "key_concepts": ["string"],
  "complexity_level": "beginner" | "intermediate" | "advanced"
}

Rules:
- Extract ALL relevant technical skills mentioned or implied
- percentage = confidence that this skill is relevant (50-100)
- Be thorough - extract framework names, languages, tools, databases, concepts
- If it's a certificate, detect the issuing platform and domain
- If it's a project, detect the tech stack and methodologies`;

    // Build multimodal user message parts
    const userParts: any[] = [];

    if (file_base64 && file_type) {
      const isImage = file_type.startsWith("image/");
      const isPdf = file_type === "application/pdf";
      if (isImage || isPdf) {
        userParts.push({
          type: "image_url",
          image_url: { url: `data:${file_type};base64,${file_base64}` },
        });
      }
    }

    const textContent = content
      ? `Extract skills from: ${content}${file_base64 ? ". Also analyze the attached file for additional skills." : ""}`
      : "Extract skills from the attached certificate/document file.";
    userParts.push({ type: "text", text: textContent });

    const response = await fetch(GATEWAY_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userParts },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "extract_skills",
              description: "Extract technical skills from content",
              parameters: {
                type: "object",
                properties: {
                  detected_type: { type: "string", enum: ["certificate", "project", "github"] },
                  skills: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string" },
                        category: { type: "string", enum: ["language", "framework", "tool", "database", "concept"] },
                        percentage: { type: "number" }
                      },
                      required: ["name", "category", "percentage"],
                      additionalProperties: false,
                    }
                  },
                  summary: { type: "string" },
                  key_concepts: { type: "array", items: { type: "string" } },
                  complexity_level: { type: "string", enum: ["beginner", "intermediate", "advanced"] }
                },
                required: ["detected_type", "skills", "summary", "key_concepts", "complexity_level"],
                additionalProperties: false,
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "extract_skills" } },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const aiResult = await response.json();

    // Parse tool call response
    const toolCall = aiResult.choices?.[0]?.message?.tool_calls?.[0];
    if (toolCall?.function?.arguments) {
      const parsed = JSON.parse(toolCall.function.arguments);
      return new Response(JSON.stringify(parsed), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fallback: try message content
    const text = aiResult.choices?.[0]?.message?.content || "{}";
    const parsed = JSON.parse(text);
    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
