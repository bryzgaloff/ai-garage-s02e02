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
    const { productIdea, jobs } = await request.json();

    if (!productIdea || typeof productIdea !== "string") {
      return NextResponse.json(
        { error: "productIdea is required and must be a string" },
        { status: 400 }
      );
    }

    if (!jobs || !Array.isArray(jobs)) {
      return NextResponse.json(
        { error: "jobs is required and must be an array" },
        { status: 400 }
      );
    }

    const socialPainsPrompt = `Product: ${productIdea}
Jobs: ${jobs.join(", ")}

What social pains do customers face? (embarrassment, status concerns, peer pressure)
- `;

    const socialPainsContent = await chatWithRetry([
      { role: "system", content: "You are a product strategy expert. Identify social customer pains." },
      { role: "user", content: socialPainsPrompt },
    ]);

    const pains = extractArrayFromText(socialPainsContent);

    return NextResponse.json({ pains });
  } catch (error) {
    console.error("Social pains generation error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate social pains" },
      { status: 500 }
    );
  }
}