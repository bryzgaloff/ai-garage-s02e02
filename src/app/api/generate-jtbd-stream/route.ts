import { NextRequest } from "next/server";

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
  const encoder = new TextEncoder();
  const { productIdea }: { productIdea: string } = await request.json();

  if (!productIdea || typeof productIdea !== "string") {
    return new Response("productIdea is required and must be a string", { status: 400 });
  }

  let controller: ReadableStreamDefaultController;

  const stream = new ReadableStream({
    start(controllerParam) {
      controller = controllerParam;
    },
    cancel() {
      // Handle cancellation if needed
    },
  });

  async function sendEvent(eventType: string, data: Record<string, unknown>) {
    const event = `event: ${eventType}\ndata: ${JSON.stringify(data)}\n\n`;
    controller.enqueue(encoder.encode(event));
  }

  async function generateAll() {
    try {
      // Step 1: Generate functional jobs
      await sendEvent("jobs", { status: "generating" });

      const functionalJobsPrompt = `Analyze this product idea and identify the Jobs-to-be-done. A Job represents a task or problem a customer hires the product to solve.

Product: ${productIdea}

List the functional jobs (core tasks customers need to accomplish):
- `;

      const functionalJobsContent = await chatWithRetry([
        { role: "system", content: "You are a product strategy expert. Analyze products and identify Jobs-to-be-done. Provide concise bullet points." },
        { role: "user", content: functionalJobsPrompt },
      ]);

      const functionalJobs = extractArrayFromText(functionalJobsContent);

      // Step 2: Generate emotional jobs
      const emotionalJobsPrompt = `Based on this product idea and the functional jobs already identified, identify the emotional jobs.

Product: ${productIdea}
Functional Jobs: ${functionalJobs.join(", ")}

List the emotional jobs (feelings or emotional outcomes customers seek):
- `;

      const emotionalJobsContent = await chatWithRetry([
        { role: "system", content: "You are a product strategy expert. Focus on emotional aspects of Jobs-to-be-done." },
        { role: "user", content: emotionalJobsPrompt },
      ]);

      const emotionalJobs = extractArrayFromText(emotionalJobsContent);

      // Step 3: Generate social jobs
      const socialJobsPrompt = `Based on this product idea and the jobs already identified, identify the social jobs.

Product: ${productIdea}
Functional Jobs: ${functionalJobs.join(", ")}
Emotional Jobs: ${emotionalJobs.join(", ")}

List the social jobs (social recognition or relationships customers seek):
- `;

      const socialJobsContent = await chatWithRetry([
        { role: "system", content: "You are a product strategy expert. Focus on social aspects of Jobs-to-be-done." },
        { role: "user", content: socialJobsPrompt },
      ]);

      const socialJobs = extractArrayFromText(socialJobsContent);

      const allJobs = [...functionalJobs, ...emotionalJobs, ...socialJobs];

      await sendEvent("jobs", {
        functional: functionalJobs,
        emotional: emotionalJobs,
        social: socialJobs
      });

      // Step 4: Generate pains
      await sendEvent("pains", { status: "generating" });

      const functionalPainsPrompt = `Based on the product idea and identified jobs, identify the functional pains.

Product: ${productIdea}
Jobs: ${allJobs.join(", ")}

List the functional pains (practical problems or obstacles customers face):
- `;

      const functionalPainsContent = await chatWithRetry([
        { role: "system", content: "You are a product strategy expert. Focus on functional pains in Jobs-to-be-done." },
        { role: "user", content: functionalPainsPrompt },
      ]);

      const functionalPains = extractArrayFromText(functionalPainsContent);

      const emotionalPainsPrompt = `Based on the product idea, jobs, and functional pains, identify the emotional pains.

Product: ${productIdea}
Jobs: ${allJobs.join(", ")}
Functional Pains: ${functionalPains.join(", ")}

List the emotional pains (frustrations or negative feelings customers experience):
- `;

      const emotionalPainsContent = await chatWithRetry([
        { role: "system", content: "You are a product strategy expert. Focus on emotional pains in Jobs-to-be-done." },
        { role: "user", content: emotionalPainsPrompt },
      ]);

      const emotionalPains = extractArrayFromText(emotionalPainsContent);

      const socialPainsPrompt = `Based on the product idea, jobs, and other pains, identify the social pains.

Product: ${productIdea}
Jobs: ${allJobs.join(", ")}
Functional Pains: ${functionalPains.join(", ")}
Emotional Pains: ${emotionalPains.join(", ")}

List the social pains (social challenges or relationship issues customers face):
- `;

      const socialPainsContent = await chatWithRetry([
        { role: "system", content: "You are a product strategy expert. Focus on social pains in Jobs-to-be-done." },
        { role: "user", content: socialPainsPrompt },
      ]);

      const socialPains = extractArrayFromText(socialPainsContent);

      const allPains = [...functionalPains, ...emotionalPains, ...socialPains];

      await sendEvent("pains", {
        functional: functionalPains,
        emotional: emotionalPains,
        social: socialPains
      });

      // Step 5: Generate benefits
      await sendEvent("benefits", { status: "generating" });

      const benefitsPrompt = `Based on the product idea, jobs, and pains, identify the key benefits.

Product: ${productIdea}
Jobs: ${allJobs.join(", ")}
Pains: ${allPains.join(", ")}

List the key benefits (advantages or positive outcomes customers will experience):
- `;

      const benefitsContent = await chatWithRetry([
        { role: "system", content: "You are a product strategy expert. Focus on benefits in Jobs-to-be-done." },
        { role: "user", content: benefitsPrompt },
      ]);

      const benefits = extractArrayFromText(benefitsContent);

      await sendEvent("benefits", { benefits });

      // Step 6: Generate use cases
      await sendEvent("useCases", { status: "generating" });

      const useCasesPrompt = `Based on the product idea, jobs, pains, and benefits, identify specific use cases.

Product: ${productIdea}
Jobs: ${allJobs.join(", ")}
Pains: ${allPains.join(", ")}
Benefits: ${benefits.join(", ")}

List specific use cases (concrete scenarios where customers would use this product):
- `;

      const useCasesContent = await chatWithRetry([
        { role: "system", content: "You are a product strategy expert. Focus on use cases in Jobs-to-be-done." },
        { role: "user", content: useCasesPrompt },
      ]);

      const useCases = extractArrayFromText(useCasesContent);

      await sendEvent("useCases", { useCases });

      // Step 7: Generate creatives
      await sendEvent("creatives", { status: "generating" });

      const creativesPrompt = `Based on the complete JTBD analysis, generate advertising creatives.

Product: ${productIdea}

JTBD Analysis:
Jobs: ${allJobs.join(", ")}
Pains: ${allPains.join(", ")}
Benefits: ${benefits.join(", ")}
Use Cases: ${useCases.join(", ")}

Generate 10 compelling headlines for advertising campaigns:
- 

Then generate 5 Google Ads descriptions (each 2-3 sentences):
- 

Then generate 5 Meta Ads texts (each 2-3 sentences):
- 

Then generate 3 hero texts for landing pages:
- 

Then generate 3 call-to-action variations:
- `;

      const creativesContent = await chatWithRetry([
        { role: "system", content: "You are a creative advertising copywriter. Generate compelling ad copy based on JTBD analysis." },
        { role: "user", content: creativesPrompt },
      ]);

      // Parse the creatives response
      const sections = creativesContent.split("\n\n").filter(s => s.trim());
      const headlines = extractArrayFromText(sections[0] || "");
      const googleAds = extractArrayFromText(sections[1] || "");
      const metaAds = extractArrayFromText(sections[2] || "");
      const heroTexts = extractArrayFromText(sections[3] || "");
      const ctaVariations = extractArrayFromText(sections[4] || "");

      await sendEvent("creatives", {
        headlines,
        googleAdsDescriptions: googleAds,
        metaAdsTexts: metaAds,
        heroTexts,
        ctaVariations
      });

      // Send completion event
      await sendEvent("complete", {});

    } catch (error) {
      console.error("JTBD generation error:", error);
      await sendEvent("error", { message: error instanceof Error ? error.message : "Unknown error" });
    } finally {
      controller.close();
    }
  }

  // Start the generation process asynchronously
  generateAll();

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
}