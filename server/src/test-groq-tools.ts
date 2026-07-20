import { Groq } from "groq-sdk";
import { env } from "./config/env";

async function testTools() {
  if (!env.GROQ_API_KEY) {
    console.error("No GROQ_API_KEY found!");
    process.exit(1);
  }

  const groq = new Groq({ apiKey: env.GROQ_API_KEY });
  try {
    console.log("Calling Groq completion with tools...");
    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: "Show me travel plans in Japan under $3000" }],
      tools: [
        {
          type: "function" as const,
          function: {
            name: "searchPackages",
            description: "Search travel packages in database.",
            parameters: {
              type: "object",
              properties: {
                maxPrice: { type: "number" },
                location: { type: "string" }
              }
            }
          }
        }
      ],
      tool_choice: "auto"
    });
    console.log("Choices:", JSON.stringify(response.choices));
    console.log("🟢 Tools check succeeded!");
    process.exit(0);
  } catch (error) {
    console.error("🔴 Tools check failed:", error);
    process.exit(1);
  }
}

testTools();
