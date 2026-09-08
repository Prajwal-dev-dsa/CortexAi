import axios from "axios";
import { graph } from "../graph/graph.js";
import dotenv from "dotenv";
import { addNewMessage } from "../config/memory.js";

dotenv.config();

export const agentController = async (req, res) => {
    try {
        const { prompt, conversationId, agent } = req.body;
        if (!prompt || !conversationId) {
            return res.status(400).json({ error: "Prompt and conversationId are required" });
        }
        await axios.post(`${process.env.CHAT_SERVICE_URL}/save-message`, {
            content: prompt,
            conversationId,
            role: "user"
        });
        const result = await graph.invoke({ userPrompt: prompt, conversationId, agentUsed: agent });
        const response = result.aiResponse;
        console.log(result)
        await axios.post(`${process.env.CHAT_SERVICE_URL}/save-message`, {
            content: response,
            conversationId,
            role: "assistant",
            images: result?.searchImages || [],
            artifacts: result?.artifacts || []
        });
        await addNewMessage(conversationId, "user", prompt);
        await addNewMessage(conversationId, "assistant", response);
        return res.status(200).json({
            response,
            searchImages: result?.searchImages || [],
            artifacts: result?.artifacts || []
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: `Error in agent controller: ${error.message}` });
    }
};