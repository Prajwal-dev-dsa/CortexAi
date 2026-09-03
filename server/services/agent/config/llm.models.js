import { ChatGroq } from "@langchain/groq"
import { ChatGoogle } from "@langchain/google";
import "dotenv/config";

const groqLLM = new ChatGroq({
  model: "openai/gpt-oss-120b",
  temperature: 2
})

const googleLLM = new ChatGoogle({
  apiKey: process.env.GOOGLE_API_KEY,
  model: "gemini-3.7-flash",
});

export const getDesiredModel = (agent) => {
  if (agent === "chat" || agent === "search" || agent === "router") return groqLLM;
  if (agent === "coding") return googleLLM;
  return groqLLM;
}