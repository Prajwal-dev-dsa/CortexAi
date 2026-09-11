import axios from "axios";
import { graph } from "../graph/graph.js";
import dotenv from "dotenv";
import { addNewMessage } from "../config/memory.js";

dotenv.config();

export const agentController = async (req, res) => {
    try {
        const { prompt, conversationId, agent } = req.body;
        const fileType = req.file;

        if (!prompt || !conversationId) {
            return res.status(400).json({ error: "Prompt and conversationId are required" });
        }

        const userId = req.headers["x-user-id"];
        if (!userId) {
            return res.status(401).json({ error: "User not authenticated" });
        }

        await axios.post(`${process.env.CHAT_SERVICE_URL}/save-message`, {
            content: prompt,
            conversationId,
            role: "user"
        });

        const result = await graph.invoke({
            userPrompt: prompt,
            conversationId,
            agentUsed: agent,
            userId,
            fileType
        });

        let normalizedResponse = "";
        if (typeof result.aiResponse === "string") {
            normalizedResponse = result.aiResponse;
        } else if (Array.isArray(result.aiResponse)) {
            normalizedResponse = result.aiResponse.map(part => part.text || "").join("");
        } else {
            normalizedResponse = JSON.stringify(result.aiResponse);
        }

        await axios.post(`${process.env.CHAT_SERVICE_URL}/save-message`, {
            content: normalizedResponse,
            conversationId,
            role: "assistant",
            images: result?.searchImages || [],
            artifacts: result?.artifacts || [],
        });

        await addNewMessage(conversationId, "user", prompt);
        await addNewMessage(conversationId, "assistant", normalizedResponse);

        return res.status(200).json({
            response: normalizedResponse,
            searchImages: result?.searchImages || [],
            artifacts: result?.artifacts || [],
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: `Error in agent controller: ${error.message}` });
    }
};