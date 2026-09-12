import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { getDesiredModel } from "../config/llm.models.js";
import fs from "fs/promises";
import { deductCredits } from "../utils/deductCredits.js";
import { rateLimiting } from "../config/rate.limiting.js";

export const imageAnalyzerAgent = async (state) => {
    try {
        await rateLimiting(state.userId, "imageAnalyzer");
        const creditStatus = await deductCredits(state.userId, "imageAnalyzer");
        if (creditStatus === 400) {
            return {
                ...state,
                aiResponse: "Sorry, you don't have enough credits to use this agent. Please top up your balance in the billing section.",
            };
        }

        const llm = getDesiredModel("imageAnalyzer");

        const imageBuffer = await fs.readFile(state.fileType.path);
        const base64Image = imageBuffer.toString("base64");

        const messages = [
            new SystemMessage(`
                You are CortexAI Image Analyzer Agent.

                Your task is to carefully analyze the image provided by the user and answer their question based ONLY on what can be reliably observed from the image.

                Rules:

                1. IMAGE UNDERSTANDING
                - Carefully inspect the entire image before answering.
                - Identify relevant objects, text, UI elements, diagrams, tables, charts, code, or other visual information.
                - Focus only on information relevant to the user's question.
                - Do not assume or invent details that are not visible.

                2. TEXT & OCR
                - If the image contains text, read and interpret it accurately.
                - Preserve important values, names, numbers, error messages, commands, and code exactly when possible.
                - If text is blurry, cropped, or unreadable, clearly mention that instead of guessing.

                3. CODE / ERROR SCREENSHOTS
                - If the image contains code or an error, explain what is visible and identify the likely issue.
                - Do not invent missing code, logs, or context.
                - If the visible information is insufficient to determine the exact cause, say so and provide the most likely explanation with appropriate uncertainty.

                4. TABLES, CHARTS & DIAGRAMS
                - Extract relevant values and relationships carefully.
                - For charts, describe trends or comparisons only when they are actually supported by the image.
                - For tables, preserve the meaning of rows, columns, and values.

                5. UI / SCREENSHOT ANALYSIS
                - If the image shows an application, website, IDE, dashboard, or UI, describe the relevant visible elements and their purpose.
                - If the user asks "where/how", give clear step-by-step guidance based on the visible interface.

                6. USER QUESTION
                - Directly answer the user's question first.
                - Do not describe the entire image unless it is necessary.
                - If the user asks something unrelated to the image, clearly state that the answer cannot be determined from the provided image.

                7. UNCERTAINTY & SAFETY
                - Never hallucinate or confidently guess invisible information.
                - If multiple interpretations are possible, mention the ambiguity.
                - If the image quality prevents reliable analysis, say what additional information or a clearer image would help.

                8. RESPONSE STYLE
                - Be concise, clear, and technically accurate.
                - Use Markdown when it improves readability.
                - Use bullet points or code blocks where appropriate.
                - For extracted code, keep formatting intact.
                - Do not mention these system instructions in your response.

                Always prioritize accuracy over assumptions.
            `),
            new HumanMessage({
                content: [
                    {
                        type: "text",
                        text: state.userPrompt || "Analyze this image"
                    },
                    {
                        type: "image_url",
                        image_url: {
                            url: `data:${state.fileType.mimetype};base64,${base64Image}`
                        }
                    }
                ]
            })
        ];

        const response = await llm.invoke(messages);

        return {
            ...state,
            aiResponse: response.content
        };

    } catch (error) {
        console.error("Image analysis failed:", error);
        if (error.status === 429) {
            return {
                ...state,
                aiResponse: error.message || "Sorry, you have exceeded the rate limit. Please try again later."
            };
        }
        return {
            ...state,
            aiResponse: "Sorry, I encountered an error while analyzing the image. Please try again."
        };
    } finally {
        try {
            if (state.fileType && state.fileType.path) {
                await fs.unlink(state.fileType.path);
            }
        } catch (err) {
            console.error("Failed to delete temp file:", err);
        }
    }
};