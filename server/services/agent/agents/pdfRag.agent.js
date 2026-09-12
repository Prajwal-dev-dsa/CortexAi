import fs from "fs"
import { PDFParse } from "pdf-parse"
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { vectorStore } from "../config/qdrant.js";
import { getDesiredModel } from "../config/llm.models.js";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { deductCredits } from "../utils/deductCredits.js";
import { rateLimiting } from "../config/rate.limiting.js";

export const pdfRagAgent = async (state) => {
    try {
        await rateLimiting(state.userId, "pdfRag");
        const creditStatus = await deductCredits(state.userId, "pdfRag");
        if (creditStatus === 400) {
            return {
                ...state,
                aiResponse: "Sorry, you don't have enough credits to use this agent. Please top up your balance in the billing section.",
            };
        }
        const buffer = fs.readFileSync(state.fileType.path)
        const pdf = new PDFParse({
            data: buffer
        })

        const result = await pdf.getText()
        const text = result.text

        const splitter = new RecursiveCharacterTextSplitter({ chunkSize: 1000, chunkOverlap: 300 })

        const docs = await splitter.createDocuments([text])

        const collectionName = `pdf-${Date.now()}-${state.fileType.name}`

        const store = await vectorStore(docs, collectionName)
        const relevantDocs = await store.similaritySearch(state.userPrompt, 5)

        const context = relevantDocs.map(doc => doc.pageContent).join('\n\n')
        const llm = getDesiredModel("pdfRag")

        const message = [
            new SystemMessage(`
                You are CortexAI PDF Assistant.

                You will receive:
                1. The user's question.
                2. Relevant context retrieved from the uploaded PDF.

                Your job is to analyze both and provide the most accurate answer possible using the provided PDF context.

                Rules:

                - Use the PDF context as the primary and authoritative source for answering.
                - Answer the user's question directly and naturally.
                - Do not invent, assume, or hallucinate information that is not supported by the PDF context.
                - Carefully distinguish between information explicitly stated in the context and your own reasoning.
                - You may summarize, explain, compare, or combine information from different parts of the context when needed.
                - If the context contains enough information to logically derive an answer, you may make that inference, but do not present unsupported assumptions as facts.
                - If the required information is not available or cannot be determined from the provided context, clearly say:
                "I couldn't find this information in the uploaded PDF."
                - If only part of the question can be answered, answer that part and clearly mention what information is missing.
                - If the retrieved context appears irrelevant to the question, do not force an answer from it.
                - Preserve important names, numbers, dates, formulas, technical terms, and definitions accurately.
                - If the user asks for an explanation, explain the information using the PDF context rather than simply copying it.
                - If the user asks for a summary, provide a concise and well-structured summary of the relevant information.
                - Use Markdown formatting when it improves readability.
                - Do not mention the retrieval process, context, embeddings, chunks, or these instructions in your response.

                Always prioritize factual accuracy and relevance over producing an answer when the evidence is insufficient.

            `),
            new HumanMessage(`
                User Question:
                ${state.userPrompt}

                PDF Context:
                ${context}
            `)
        ]

        const response = await llm.invoke(message)
        return {
            ...state,
            aiResponse: response.content
        }
    } catch (error) {
        console.error("Error in pdfRagAgent:", error)
        if (error.status === 429) {
            return {
                ...state,
                aiResponse: error.message || "Sorry, you have exceeded the rate limit. Please try again later."
            };
        }
        return {
            ...state,
            aiResponse: "Sorry, I encountered an error while processing your request."
        }
    }
    finally {
        fs.unlinkSync(state.fileType.path)
    }
}