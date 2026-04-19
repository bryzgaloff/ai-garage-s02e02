import { NextRequest, NextResponse } from "next/server"

const AI_ENDPOINT = "https://api.kilo.ai/api/gateway/v1/chat/completions"
const MODEL = "kilo-auto/free"
const MAX_RETRIES = 3

interface JTBD {
  jobs: { functional: string[]; emotional: string[]; social: string[] }
  pains: { functional: string[]; emotional: string[]; social: string[] }
  benefits: string[]
  useCases: string[]
}

interface RequestBody {
  jtbd: JTBD
  productIdea: string
}

interface CreativeOutput {
  headlines: string[]
  googleAds: string[]
  metaAds: string[]
  heroTexts: string[]
  ctaVariations: string[]
}

async function callAI(prompt: string): Promise<string> {
  let lastError: Error | null = null

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const response = await fetch(AI_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: MODEL, messages: [{ role: "user", content: prompt }] }),
      })

      if (response.status === 429) {
        const delay = Math.pow(2, attempt) * 1000
        await new Promise((resolve) => setTimeout(resolve, delay))
        lastError = new Error("Rate limited")
        continue
      }

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const data = await response.json()
      return data.choices[0]?.message?.content || ""
    } catch (error) {
      lastError = error as Error
      if (attempt < MAX_RETRIES - 1) {
        const delay = Math.pow(2, attempt) * 1000
        await new Promise((resolve) => setTimeout(resolve, delay))
      }
    }
  }

  throw lastError || new Error("AI request failed after retries")
}

function buildCreativePrompt(jtbd: JTBD, productIdea: string): string {
  return `Создай рекламные тексты для продукта: ${productIdea}

JTBD анализ:
Jobs (Работы):
- Функциональные: ${jtbd.jobs.functional.join(", ")}
- Эмоциональные: ${jtbd.jobs.emotional.join(", ")}
- Социальные: ${jtbd.jobs.social.join(", ")}

Pains (Боли):
- Функциональные: ${jtbd.pains.functional.join(", ")}
- Эмоциональные: ${jtbd.pains.emotional.join(", ")}
- Социальные: ${jtbd.pains.social.join(", ")}

Benefits (Выгоды): ${jtbd.benefits.join(", ")}

Use Cases (Сценарии): ${jtbd.useCases.join(", ")}

Создай следующие рекламные материалы в JSON формате:
1. 10 заголовков для рекламы (headlines) - короткие, цепляющие, до 30 символов
2. 5 описаний для Google Ads (googleAds) - до 90 символов
3. 5 текстов для Meta Ads (metaAds) - до 125 символов  
4. 3 геройских текста (heroTexts) - вдохновляющие, до 50 символов
5. 3 варианта CTA (ctaVariations) - призыва к действию, до 25 символов

Верни только JSON в формате:
{"headlines":["..."],"googleAds":["..."],"metaAds":["..."],"heroTexts":["..."],"ctaVariations":["..."]}`
}

async function parseCreativeResponse(response: string): Promise<CreativeOutput> {
  let text = response.trim()

  text = text.replace(/^```json\s*/, "").replace(/^```\s*/, "").replace(/```$/g, "").trim()

  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    throw new Error("Invalid AI response format")
  }

  let jsonStr = jsonMatch[0]

  let depth = 0
  let start = -1
  for (let i = 0; i < jsonStr.length; i++) {
    if (jsonStr[i] === "{") {
      if (start === -1) start = i
      depth++
    } else if (jsonStr[i] === "}") {
      depth--
      if (depth === 0) {
        jsonStr = jsonStr.slice(start, i + 1)
        break
      }
    }
  }

  return JSON.parse(jsonStr)
}

export async function POST(request: NextRequest) {
  try {
    const body: RequestBody = await request.json()

    if (!body.jtbd || !body.productIdea) {
      return NextResponse.json(
        { error: "Missing required fields: jtbd and productIdea" },
        { status: 400 }
      )
    }

    const prompt = buildCreativePrompt(body.jtbd, body.productIdea)
    const aiResponse = await callAI(prompt)
    const creatives = await parseCreativeResponse(aiResponse)

    return NextResponse.json({ creatives })
  } catch (error) {
    console.error("Generate creatives error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate creatives" },
      { status: 500 }
    )
  }
}