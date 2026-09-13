import { getDesiredModel } from "../config/llm.models.js"

const PLAN_ACCESS = {
    free: ["chat", "search"],
    go: ["chat", "search", "pdf", "ppt"],
    pro: ["chat", "search", "pdf", "ppt", "image", "coding"],
    enterprise: ["chat", "search", "pdf", "ppt", "image", "coding", "pdfRag", "imageAnalyzer"]
};

export const routerAgent = async (state) => {
    const userPlan = state.userPlan?.toLowerCase() || "free";
    const allowedAgents = PLAN_ACCESS[userPlan] || PLAN_ACCESS["free"];

    let selectedAgent = "chat";

    if (state.agentUsed && state.agentUsed !== "auto") {
        selectedAgent = state.agentUsed;
    }
    else if (state.fileType && state.fileType.mimetype) {
        if (state.fileType.mimetype === "application/pdf") {
            selectedAgent = "pdfRag";
        } else if (state.fileType.mimetype.startsWith("image/")) {
            selectedAgent = "imageAnalyzer";
        }
    }
    else {
        const llm = getDesiredModel("router");
        const prompt = `You are an AI Agent Router.

        Your task is to read the USER PROMPT provided below and select the ONE most appropriate agent to handle it.

        Available agents:
        - chat → Normal conversation, explanations, general questions.
        - coding → Programming, software development.
        - image → Image generation, illustrations.
        - pdf → Creating or editing PDF documents.
        - ppt → Creating or editing PowerPoint presentations.
        - search → Current, real-time web-based information.
        - pdfRag → Asking follow-up questions from an uploaded PDF.
        - imageAnalyzer → Analyzing details from an uploaded image.

        IMPORTANT ROUTING RULES:
        1. Choose the agent based on the user's PRIMARY INTENT.
        2. Never ask questions. Always select exactly one agent.
        3. Return ONLY ONE WORD matching the agent name exactly.

        USER PROMPT:
        ${state.userPrompt}`;

        const response = await llm.invoke(prompt);
        let aiChoice = response.content.trim();

        if (aiChoice.toLowerCase() === "pdfrag") aiChoice = "pdfRag";
        if (aiChoice.toLowerCase() === "imageanalyzer") aiChoice = "imageAnalyzer";

        selectedAgent = aiChoice;
    }

    if (!allowedAgents.includes(selectedAgent)) {
        return {
            ...state,
            agentUsed: "chat",
            userPrompt: `System Instruction: The user just attempted to request a feature that requires the '${selectedAgent}' agent, but their current billing plan ('${userPlan}') does not include access to it. 
            
            Respond politely as CortexAI: Tell the user that this specific feature requires an upgraded plan, and direct them to the Billing section to unlock it. Do not answer their original request. Do not tell the user the agent name which we have here in backend. Just tell that whatever you asked for requires an upgraded plan.`
        };
    }

    return {
        ...state,
        agentUsed: selectedAgent
    };
}