import { StateGraph } from "@langchain/langgraph";
import { agentState } from "./state.js";
import { routerAgent } from "./router.agent.js";
import { chatAgent } from "../agents/chat.agent.js";
import { codingAgent } from "../agents/coding.agent.js";
import { pdfAgent } from "../agents/pdf.agent.js";
import { pptAgent } from "../agents/ppt.agent.js";
import { imageAgent } from "../agents/image.agent.js";
import { searchAgent } from "../agents/search.agent.js";


const workflow = new StateGraph(agentState);

workflow.addNode("router", routerAgent)
workflow.addNode("chat", chatAgent)
workflow.addNode("coding", codingAgent)
workflow.addNode("pdf", pdfAgent)
workflow.addNode("ppt", pptAgent)
workflow.addNode("image", imageAgent)
workflow.addNode("search", searchAgent)

workflow.addEdge("__start__", "router")
workflow.addConditionalEdges("router", (state) => {
    switch (state.agentUsed) {
        case "chat":
            return "chat";
        case "coding":
            return "coding";
        case "pdf":
            return "pdf";
        case "ppt":
            return "ppt";
        case "image":
            return "image";
        case "search":
            return "search";
        default:
            return "chat";
    }
}, {
    chat: "chat",
    coding: "coding",
    pdf: "pdf",
    ppt: "ppt",
    image: "image",
    search: "search",
})

workflow.addEdge("search", "chat")
workflow.addEdge("chat", "__end__")
workflow.addEdge("coding", "__end__")
workflow.addEdge("pdf", "__end__")
workflow.addEdge("ppt", "__end__")
workflow.addEdge("image", "__end__")

export const graph = workflow.compile()