import { Annotation } from "@langchain/langgraph";

export const agentState = Annotation.Root({
    userPrompt: Annotation(),
    aiResponse: Annotation(),
    agentUsed: Annotation(),
    conversationId: Annotation(),
});