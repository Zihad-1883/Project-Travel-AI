import { Groq } from "groq-sdk";
import { env } from "../../config/env";

let groqInstance: Groq | null = null;

function getGroqInstance(): Groq {
  if (!env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is not defined in the environment variables!");
  }
  if (!groqInstance) {
    groqInstance = new Groq({
      apiKey: env.GROQ_API_KEY,
    });
  }
  return groqInstance;
}

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface ChatOptions {
  model?: string;
  temperature?: number;
  jsonMode?: boolean;
}

async function getChatCompletion(
  messages: ChatMessage[],
  options: ChatOptions = {}
): Promise<string> {
  try {
    const groq = getGroqInstance();
    const model = options.model || process.env.GROQ_MODEL || "llama-3.1-8b-instant"; // Higher TPD limits on Free Tier

    const responseParams: Parameters<typeof groq.chat.completions.create>[0] = {
      model,
      messages,
      temperature: options.temperature !== undefined ? options.temperature : 0.2,
    };

    if (options.jsonMode) {
      responseParams.response_format = { type: "json_object" };
    }

    const completion = await groq.chat.completions.create(responseParams);

    if ("choices" in completion) {
      const content = completion.choices[0]?.message?.content;
      if (!content) {
        throw new Error("Received empty content from Groq API.");
      }
      return content;
    } else {
      throw new Error("Unexpected streaming response from Groq API.");
    }
  } catch (error) {
    console.error("Groq Service Error:", error);
    throw error;
  }
}

export const groqService = {
  getChatCompletion,
};
