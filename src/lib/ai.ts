const API_ENDPOINT = "https://api.kilo.ai/api/gateway/";
const MODEL = "kilo-auto/free";
const MAX_RETRIES = 3;
const BASE_DELAY_MS = 1000;

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

interface ChatResponse {
  choices: Array<{
    message: {
      content: string;
      role: string;
    };
  }>;
  error?: {
    message: string;
    type: string;
  };
}

interface ChatOptions {
  messages: ChatMessage[];
  temperature?: number;
  max_tokens?: number;
}

interface ChatResult {
  content: string;
  role: "assistant";
}

class AIError extends Error {
  constructor(
    message: string,
    public code: "RATE_LIMIT" | "NETWORK_ERROR" | "API_ERROR" | "INVALID_RESPONSE"
  ) {
    super(message);
    this.name = "AIError";
  }
}

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getDelay(attempt: number): number {
  return BASE_DELAY_MS * Math.pow(2, attempt);
}

async function fetchWithRetry(
  payload: ChatOptions,
  attempt: number = 0
): Promise<ChatResponse> {
  try {
    const response = await fetch(API_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        messages: payload.messages,
        temperature: payload.temperature ?? 0.7,
        max_tokens: payload.max_tokens ?? 2048,
      }),
    });

    if (response.status === 429) {
      if (attempt < MAX_RETRIES - 1) {
        const delay = getDelay(attempt);
        await sleep(delay);
        return fetchWithRetry(payload, attempt + 1);
      }
      throw new AIError(
        "Слишком много запросов. Пожалуйста, подождите немного и попробуйте снова.",
        "RATE_LIMIT"
      );
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new AIError(
        errorData.error?.message ||
          `Ошибка API: ${response.status} ${response.statusText}`,
        "API_ERROR"
      );
    }

    const data: ChatResponse = await response.json();

    if (data.error) {
      throw new AIError(data.error.message, "API_ERROR");
    }

    if (!data.choices || data.choices.length === 0) {
      throw new AIError(
        "Не удалось получить ответ от AI. Попробуйте еще раз.",
        "INVALID_RESPONSE"
      );
    }

    return data;
  } catch (error) {
    if (error instanceof AIError) {
      throw error;
    }
    if (attempt < MAX_RETRIES - 1) {
      const delay = getDelay(attempt);
      await sleep(delay);
      return fetchWithRetry(payload, attempt + 1);
    }
    throw new AIError(
      "Ошибка соединения. Проверьте интернет-соединение и попробуйте снова.",
      "NETWORK_ERROR"
    );
  }
}

export async function chat(prompt: string): Promise<ChatResult> {
  if (!prompt || prompt.trim().length === 0) {
    throw new AIError(
      "Пожалуйста, введите текст запроса.",
      "INVALID_RESPONSE"
    );
  }

  const response = await fetchWithRetry({
    messages: [{ role: "user", content: prompt }],
  });

  const message = response.choices[0].message;

  return {
    content: message.content,
    role: "assistant",
  };
}

export type { ChatResult, ChatMessage, ChatOptions };
