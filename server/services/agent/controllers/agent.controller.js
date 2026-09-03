import axios from "axios";
import { graph } from "../graph/graph.js";
import dotenv from "dotenv";

dotenv.config();

export const agentController = async (req, res) => {
    try {
        const { prompt, conversationId } = req.body;
        if (!prompt || !conversationId) {
            return res.status(400).json({ error: "Prompt and conversationId are required" });
        }
        await axios.post(`${process.env.CHAT_SERVICE_URL}/save-message`, {
            content: prompt,
            conversationId,
            role: "user"
        });
        const result = await graph.invoke({ userPrompt: prompt, conversationId });
        const response = result.aiResponse;
        await axios.post(`${process.env.CHAT_SERVICE_URL}/save-message`, {
            content: response,
            conversationId,
            role: "assistant"
        });
        return res.status(200).json(response);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: `Error in agent controller: ${error.message}` });
    }
};