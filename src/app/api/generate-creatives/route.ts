import { NextRequest, NextResponse } from 'next/server'

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

async function callAI(prompt: string, maxRetries = 3): Promise<string> {
  const apiUrl = 'https://api.kilo.ai/api/gateway/generate'
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'kilo-auto/free',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 4000
        })
      })

      if (response.status === 429) {
        const delay = Math.pow(2, attempt) * 1000
        await new Promise(resolve => setTimeout(resolve, delay))
        continue
      }

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const data = await response.json()
      return data.choices?.[0]?.message?.content || data.content || ''
    } catch (error) {
      if (attempt === maxRetries - 1) throw error
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000))
    }
  }
  throw new Error('AI request failed after retries')
}

function buildCreativePrompt(jtbd: JTBD, productIdea: string): string {
  return `Создай рекламные тексты для продукта: ${productIdea}

JTBD анализ:
Jobs (Работы):
- Функциональные: ${jtbd.jobs.functional.join(', ')}
- Эмоциональные: ${jtbd.jobs.emotional.join(', ')}
- Социальные: ${jtbd.jobs.social.join(', ')}

Pains (Боли):
- Функциональные: ${jtbd.pains.functional.join(', ')}
- Эмоциональные: ${jtbd.pains.emotional.join(', ')}
- Социальные: ${jtbd.pains.social.join(', ')}

Benefits (Выгоды): ${jtbd.benefits.join(', ')}

Use Cases (Сценарии): ${jtbd.useCases.join(', ')}

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
  const jsonMatch = response.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    throw new Error('Invalid AI response format')
  }
  return JSON.parse(jsonMatch[0])
}

export async function POST(request: NextRequest) {
  try {
    const body: RequestBody = await request.json()

    if (!body.jtbd || !body.productIdea) {
      return NextResponse.json(
        { error: 'Missing required fields: jtbd and productIdea' },
        { status: 400 }
      )
    }

    const prompt = buildCreativePrompt(body.jtbd, body.productIdea)
    const aiResponse = await callAI(prompt)
    const creatives = await parseCreativeResponse(aiResponse)

    return NextResponse.json({ creatives })
  } catch (error) {
    console.error('Generate creatives error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate creatives' },
      { status: 500 }
    )
  }
}