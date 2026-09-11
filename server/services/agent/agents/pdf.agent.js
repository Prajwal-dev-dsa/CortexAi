import { getDesiredModel } from "../config/llm.models.js";
import { generatePdfBuffer } from "../utils/generatePdf.js";
import { uploadToS3 } from "../utils/uploadToS3.js";
import { fetchFromS3 } from "../utils/fetchFromS3.js";
import { deductCredits } from "../utils/deductCredits.js";

export const pdfAgent = async (state) => {
    try {
        const creditStatus = await deductCredits(state.userId, "pdf");
        if (creditStatus === 400) {
            return {
                ...state,
                aiResponse: "Sorry, you don't have enough credits to use this agent. Please top up your balance in the billing section.",
            };
        }
        await deductCredits(state.userId, "pdf");
        const llm = getDesiredModel("pdf");

        const prompt = `
        You are an expert educational document writer.

        The user wants to generate a PDF about a given topic.
        Your job is to generate the COMPLETE content of the PDF.
        Do NOT generate the PDF file itself.

        Return ONLY valid JSON.
        Do NOT return Markdown, explanations, or any text outside the JSON.

        Use this exact structure:

        {
        "title": "Document Title",
        "subtitle": "Informative Document Subtitle",
        "sections": [
            {
            "heading": "Section Heading",
            "points": [
                "Detailed point 1",
                "Detailed point 2"
            ]
            }
        ]
        }

        Content Guidelines:
        - Create a clear and professional title and subtitle.
        - Cover the topic from basic concepts to important advanced concepts where relevant.
        - Generate 4-8 well-organized sections.
        - Each section should contain 3-6 concise but informative points.
        - STRICT: Do NOT number the headings (e.g., write "Overview", not "1. Overview").
        - STRICT: Do NOT include bullet characters (*, -, •) in the points array. Just write the plain text.
        - Explain concepts clearly and in a logical order.
        - Keep the content educational, accurate, and easy to understand.

        Topic:
        ${state.userPrompt}
        `;

        const res = await llm.invoke(prompt);
        let rawContent = res.content.trim();

        if (rawContent.startsWith("```")) {
            const match = rawContent.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
            if (match) {
                rawContent = match[1].trim();
            }
        }

        let pdfData;
        try {
            pdfData = JSON.parse(rawContent);
        } catch (parseError) {
            console.error("PDF Agent JSON parsing failed:", parseError, "Raw:", rawContent);
            return {
                ...state,
                aiResponse: "I encountered an error parsing the document outline. Please try requesting the PDF again.",
            };
        }

        const pdfBuffer = await generatePdfBuffer(pdfData);
        const fileName = `document_${Date.now()}.pdf`;

        await uploadToS3(fileName, pdfBuffer, "application/pdf");

        const downloadUrl = await fetchFromS3(fileName);

        return {
            ...state,
            aiResponse: `### ${pdfData.title}\n*${pdfData.subtitle}*\n\nYour PDF document has been compiled and is ready for download.\n\n[Download PDF Document](${downloadUrl})\n\n*Note: This secure link expires in 60 minutes.*`,
        };
    } catch (error) {
        console.error("PDF agent error:", error);
        return {
            ...state,
            aiResponse: "Sorry, I encountered an issue generating your PDF. Please try again.",
        };
    }
};