import { NextRequest, NextResponse } from "next/server";

const AI_ENDPOINT = "https://api.kilo.ai/api/gateway/v1/chat/completions";
const MODEL = "kilo-auto/free";
const MAX_RETRIES = 3;

async function chatWithRetry(messages: { role: string; content: string }[]): Promise<string> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const response = await fetch(AI_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: MODEL, messages }),
      });

      if (response.status === 429) {
        const delay = Math.pow(2, attempt) * 1000;
        await new Promise((resolve) => setTimeout(resolve, delay));
        lastError = new Error("Rate limited");
        continue;
      }

      if (!response.ok) {
        throw new Error(`AI request failed: ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || "";
    } catch (error) {
      lastError = error as Error;
      if (attempt < MAX_RETRIES - 1) {
        const delay = Math.pow(2, attempt) * 1000;
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError || new Error("AI request failed after retries");
}

function extractArrayFromText(text: string): string[] {
  const lines = text.split("\n").filter((line) => {
    const trimmed = line.trim();
    return trimmed && (trimmed.startsWith("- ") || trimmed.startsWith("* ") || /^\d+\.?\s/.test(trimmed));
  });
  if (lines.length > 0) {
    return lines.map((line) => line.replace(/^-\s*|\*\s*|^\d+\.\s*/, "").trim());
  }
  return [];
}

export async function POST(request: NextRequest) {
  try {
    const { jobs, benefits } = await request.json();

    if (!jobs || !Array.isArray(jobs)) {
      return NextResponse.json(
        { error: "jobs is required and must be an array" },
        { status: 400 }
      );
    }

    if (!benefits || !Array.isArray(benefits)) {
      return NextResponse.json(
        { error: "benefits is required and must be an array" },
        { status: 400 }
      );
    }

    const useCasesPrompt = `Based on the JTBD framework:

Jobs: ${jobs.join(", ")}
Benefits: ${benefits.join(", ")}

List the primary use cases (specific situations where customers use the product):
- `;

    const useCasesContent = await chatWithRetry([
      { role: "system", content: "You are a product strategy expert. Identify specific use cases for products." },
      { role: "user", content: useCasesPrompt },
    ]);

    const useCases = extractArrayFromText(useCasesContent);

    return NextResponse.json({ useCases });
  } catch (error) {
    console.error("Use cases generation error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate use cases" },
      { status: 500 }
    );
  }
}