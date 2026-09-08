import { ChatGroq } from "@langchain/groq"
import { ChatGoogle } from "@langchain/google";
import { ChatOpenRouter } from "@langchain/openrouter";
import "dotenv/config";

const groqLLM = new ChatGroq({
  apiKey: process.env.GROQ_API_KEY,
  model: "openai/gpt-oss-120b",
  temperature: 2
})

const googleLLM = new ChatGoogle({
  apiKey: process.env.GOOGLE_API_KEY,
  model: "gemini-3.7-flash",
});

const openrouterLLM = new ChatOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
  model: "deepseek/deepseek-chat",
  temperature: 0,
  maxTokens: 1024
});

export const getDesiredModel = (agent) => {
  if (agent === "coding") return openrouterLLM;
  if (agent === "title") return googleLLM;
  return groqLLM;
}