import { NextRequest, NextResponse } from "next/server";

const AI_ENDPOINT = "https://api.kilo.ai/api/gateway/v1/chat/completions";
const MODEL = "kilo-auto/free";
const MAX_RETRIES = 3;

interface JTBD {
  jobs: {
    functional: string[];
    emotional: string[];
    social: string[];
  };
  pains: {
    functional: string[];
    emotional: string[];
    social: string[];
  };
  benefits: string[];
  useCases: string[];
}

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

function parseJobsResponse(content: string): JTBD["jobs"] {
  const all = extractArrayFromText(content);
  return {
    functional: all.slice(0, 3),
    emotional: all.slice(3, 6),
    social: all.slice(6, 9),
  };
}

function parsePainsResponse(content: string): JTBD["pains"] {
  const all = extractArrayFromText(content);
  return {
    functional: all.slice(0, 3),
    emotional: all.slice(3, 6),
    social: all.slice(6, 9),
  };
}

function parseBenefitsResponse(content: string): string[] {
  return extractArrayFromText(content);
}

function parseUseCasesResponse(content: string): string[] {
  return extractArrayFromText(content);
}

export async function POST(request: NextRequest) {
  try {
    const { productIdea } = await request.json();

    if (!productIdea || typeof productIdea !== "string") {
      return NextResponse.json(
        { error: "productIdea is required and must be a string" },
        { status: 400 }
      );
    }

    const jtbd: JTBD = {
      jobs: { functional: [], emotional: [], social: [] },
      pains: { functional: [], emotional: [], social: [] },
      benefits: [],
      useCases: [],
    };

    const stream = new ReadableStream({
      async start(controller) {
        // Helper function to send SSE event
        const sendEvent = (data: any, event?: string) => {
          let message = "data: " + JSON.stringify(data) + "\n\n";
          if (event) {
            message = `event: ${event}\n${message}`;
          }
          controller.enqueue(new TextEncoder().encode(message));
        };

        try {

          // Generate jobs first
          const jobsPrompt = `Analyze this product idea and identify the Jobs-to-be-done. A Job represents a task or problem a customer hires the product to solve.

Product: ${productIdea}

List the functional jobs (core tasks customers need to accomplish):
- `;

          const jobsContent = await chatWithRetry([
            { role: "system", content: "You are a product strategy expert. Analyze products and identify Jobs-to-be-done. Provide concise bullet points." },
            { role: "user", content: jobsPrompt },
          ]);

          jtbd.jobs.functional = parseJobsResponse(jobsContent).functional;

          const emotionalPrompt = `Based on the functional jobs: ${jtbd.jobs.functional.join(", ")}

Product: ${productIdea}

What emotional jobs do customers have? (How do they want to feel or avoid feeling?)
- `;

          const emotionalContent = await chatWithRetry([
            { role: "system", content: "You are a product strategy expert. Identify emotional aspects of customer jobs." },
            { role: "user", content: emotionalPrompt },
          ]);

          jtbd.jobs.emotional = parseJobsResponse(emotionalContent).emotional;

          const socialPrompt = `Based on:
Functional jobs: ${jtbd.jobs.functional.join(", ")}
Emotional jobs: ${jtbd.jobs.emotional.join(", ")}

Product: ${productIdea}

What social jobs do customers have? (How do they want to be perceived by others?)
- `;

          const socialContent = await chatWithRetry([
            { role: "system", content: "You are a product strategy expert. Identify social aspects of customer jobs." },
            { role: "user", content: socialPrompt },
          ]);

          jtbd.jobs.social = parseJobsResponse(socialContent).social;

          // Stream jobs
          sendEvent({ jtbd }, "jobs");

          // Generate pains
          const painsPrompt = `Analyze this product and identify customer Pains (negative outcomes, risks, obstacles).

Product: ${productIdea}
Jobs: ${[...jtbd.jobs.functional, ...jtbd.jobs.emotional, ...jtbd.jobs.social].join(", ")}

List functional pains (problems, inefficiencies, missing features):
- `;

          const painsContent = await chatWithRetry([
            { role: "system", content: "You are a product strategy expert. Identify customer pains and frustrations." },
            { role: "user", content: painsPrompt },
          ]);

          jtbd.pains.functional = parsePainsResponse(painsContent).functional;

          const emotionalPainsPrompt = `Product: ${productIdea}
Functional jobs: ${jtbd.jobs.functional.join(", ")}

What emotional pains do customers experience? (frustrations, anxieties, fears)
- `;

          const emotionalPainsContent = await chatWithRetry([
            { role: "system", content: "You are a product strategy expert. Identify emotional customer pains." },
            { role: "user", content: emotionalPainsPrompt },
          ]);

          jtbd.pains.emotional = parsePainsResponse(emotionalPainsContent).emotional;

          const socialPainsPrompt = `Product: ${productIdea}
Jobs: ${jtbd.jobs.functional.join(", ")}

What social pains do customers face? (embarrassment, status concerns, peer pressure)
- `;

          const socialPainsContent = await chatWithRetry([
            { role: "system", content: "You are a product strategy expert. Identify social customer pains." },
            { role: "user", content: socialPainsPrompt },
          ]);

          jtbd.pains.social = parsePainsResponse(socialPainsContent).social;

          // Stream pains
          sendEvent({ jtbd }, "pains");

          // Generate benefits
          const benefitsPrompt = `Based on the Jobs and Pains identified:

Jobs: ${[...jtbd.jobs.functional, ...jtbd.jobs.emotional, ...jtbd.jobs.social].join(", ")}
Pains: ${[...jtbd.pains.functional, ...jtbd.pains.emotional, ...jtbd.pains.social].join(", ")}

Product: ${productIdea}

List the key benefits this product provides to address these jobs and pains:
- `;

          const benefitsContent = await chatWithRetry([
            { role: "system", content: "You are a product strategy expert. Identify product benefits that address customer jobs and pains." },
            { role: "user", content: benefitsPrompt },
          ]);

          jtbd.benefits = parseBenefitsResponse(benefitsContent);

          // Stream benefits
          sendEvent({ jtbd }, "benefits");

          // Generate use cases
          const useCasesPrompt = `Based on the JTBD framework:

Jobs: ${[...jtbd.jobs.functional, ...jtbd.jobs.emotional, ...jtbd.jobs.social].join(", ")}
Benefits: ${jtbd.benefits.join(", ")}

Product: ${productIdea}

List the primary use cases (specific situations where customers use the product):
- `;

          const useCasesContent = await chatWithRetry([
            { role: "system", content: "You are a product strategy expert. Identify specific use cases for products." },
            { role: "user", content: useCasesPrompt },
          ]);

          jtbd.useCases = parseUseCasesResponse(useCasesContent);

          // Stream use cases
          sendEvent({ jtbd }, "useCases");

          // Send completion event
          sendEvent({ jtbd }, "complete");

          controller.close();
        } catch (error) {
          console.error("JTBD streaming error:", error);
          sendEvent({ error: error instanceof Error ? error.message : "Failed to generate JTBD" }, "error");
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  } catch (error) {
    console.error("JTBD generation error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate JTBD" },
      { status: 500 }
    );
  }
}
