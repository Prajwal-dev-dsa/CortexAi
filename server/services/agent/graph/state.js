import { Annotation } from "@langchain/langgraph";

export const agentState = Annotation.Root({
    userId: Annotation(),
    userPrompt: Annotation(),
    aiResponse: Annotation(),
    agentUsed: Annotation(),
    conversationId: Annotation(),
    searchResults: Annotation(),
    searchImages: Annotation(),
    artifacts: Annotation(),
});