import { ChatGroq } from "@langchain/groq"
import { ChatOpenRouter } from "@langchain/openrouter";
import "dotenv/config";

const openAiLlmForEverything = new ChatGroq({
  apiKey: process.env.GROQ_API_KEY,
  model: "openai/gpt-oss-120b",
  temperature: 0.7
})

const deepseekLlmForCoding = new ChatOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
  model: "deepseek/deepseek-chat",
  maxTokens: 4096
});

const qwenLlmForImageAnalysis = new ChatGroq({
  apiKey: process.env.GROQ_API_KEY,
  model: "qwen/qwen3.8-27b",
  temperature: 0.6,
  topP: 0.8,
  maxTokens: 2048,
  modelKwargs: {
    top_k: 20,
    min_p: 0,
    presence_penalty: 1.5,
    reasoning_effort: "none",
    reasoning_format: "hidden",
  },
});

export const getDesiredModel = (agent) => {
  if (agent === "coding") return deepseekLlmForCoding;
  if (agent === "imageAnalyzer") return qwenLlmForImageAnalysis;
  return openAiLlmForEverything;
}