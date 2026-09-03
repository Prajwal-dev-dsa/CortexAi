import { getDesiredModel } from "../config/llm.models.js"


export const routerAgent = async (state) => {
    const llm = getDesiredModel("router")
    const prompt = `You are an AI Agent Router.

Your task is to read the USER PROMPT provided below and select the ONE most appropriate agent to handle it.

Available agents:

- chat → Normal conversation, explanations, general questions, advice, brainstorming, rewriting, etc.
- coding → Programming, coding, debugging, algorithms, software development, technical implementation, etc.
- image → Image generation, image editing, visual designs, illustrations, logos, diagrams, etc.
- pdf → Creating, editing, analyzing, converting, or processing PDF documents.
- ppt → Creating, editing, analyzing, or generating PowerPoint presentations/slides.
- search → Current, real-time, latest, recent, web-based, external, or frequently changing information.

IMPORTANT ROUTING RULES:

1. Choose the agent based on the user's PRIMARY INTENT, not individual keywords.
2. If the user wants code or a software implementation, choose coding.
3. If the user wants an image to be generated or edited, choose image.
4. If the user wants a PDF created, edited, analyzed, or processed, choose pdf.
5. If the user wants a PowerPoint/presentation/slides created, edited, or processed, choose ppt.
6. If the user needs current, latest, real-time, recent, or web-based information, choose search.
7. For normal conversation, stable knowledge, explanations, advice, or general assistance, choose chat.
8. If multiple agents seem relevant, choose the ONE that is most important for completing the user's primary objective.
9. Never ask questions. Always select exactly one agent.
10. Do not solve or answer the user's request. Only classify it.

USER PROMPT:
${state.userPrompt}

OUTPUT FORMAT:

Return ONLY ONE WORD.

The response MUST be exactly one of:

chat
coding
image
pdf
ppt
search

No explanation, punctuation, markdown, JSON, or additional text.`

    const response = await llm.invoke(prompt);
    return {
        ...state,
        agentUsed: response.content.trim().toLowerCase()
    };
}