import { getDesiredModel } from "../../agent/config/llm.models.js";
import { ConversationModel } from "../models/conversation.model.js"
import { MessageModel } from "../models/message.model.js"


export const createConversation = async (req, res) => {
    try {
        const userId = req.headers['x-user-id']
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" })
        }

        const conversation = await ConversationModel.create({
            userId
        })
        return res.status(201).json(conversation)
    } catch (error) {
        console.error(error)
        return res.status(500).json({ message: `Error in creating conversation: ${error.message}` })
    }
}


export const getConversations = async (req, res) => {
    try {
        const userId = req.headers['x-user-id']
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" })
        }

        const conversations = await ConversationModel.find({ userId }).sort({ updatedAt: -1 })
        return res.status(200).json(conversations)
    } catch (error) {
        console.error(error)
        return res.status(500).json({ message: `Error in getting conversations: ${error.message}` })
    }
}


export const updateConversation = async (req, res) => {
    try {
        const userId = req.headers['x-user-id']
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" })
        }
        const { conversationId, title } = req.body
        if (!conversationId || !title) {
            return res.status(400).json({ message: "Conversation ID and title are required" })
        }
        const conversation = await ConversationModel.findByIdAndUpdate(conversationId, { title }, { new: true })
        return res.status(200).json(conversation)
    } catch (error) {
        console.error(error)
        return res.status(500).json({ message: `Error in updating conversation: ${error.message}` })
    }
}


export const deleteConversation = async (req, res) => {
    try {
        const userId = req.headers['x-user-id']
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" })
        }
        const { conversationId } = req.params
        if (!conversationId) {
            return res.status(400).json({ message: "Conversation ID is required" })
        }
        const conversation = await ConversationModel.findByIdAndDelete(conversationId)
        return res.status(200).json(conversation)
    } catch (error) {
        console.error(error)
        return res.status(500).json({ message: `Error in deleting conversation: ${error.message}` })
    }
}


export const saveMessage = async (req, res) => {
    try {
        const { conversationId, content, role } = req.body
        if (!conversationId || !content || !role) {
            return res.status(400).json({ message: "Conversation ID, content and role are required" })
        }
        const message = await MessageModel.create({ conversationId, content, role })
        return res.status(200).json(message)
    } catch (error) {
        console.error(error)
        return res.status(500).json({ message: `Error in saving message: ${error.message}` })
    }
}


export const getAllMessages = async (req, res) => {
    try {
        const { conversationId } = req.params
        if (!conversationId) {
            return res.status(400).json({ message: "Conversation ID is required" })
        }
        const messages = await MessageModel.find({ conversationId })
        return res.status(200).json(messages)
    } catch (error) {
        console.error(error)
        return res.status(500).json({ message: `Error in getting messages: ${error.message}` })
    }
}


export const generateTitleForConversation = async (req, res) => {
    try {
        const { userMessage, aiResponse } = req.body;

        if (!userMessage || !aiResponse) {
            return res.status(400).json({ error: "Missing message context" });
        }

        const llm = getDesiredModel("title");

        const system_prompt = `You are an expert conversational summarizer for CortexAI.
            Your ONLY job is to read the first exchange between a user and an AI, and generate a short, highly relevant title for the conversation.

            RULES:
            1. The title MUST be between 3 to 5 words.
            2. DO NOT use quotes, punctuation marks at the end, or introductory text.
            3. Write in Title Case.
            4. Output NOTHING but the title.`;

        const prompt = `User said: "${userMessage}"\nAI replied: "${aiResponse}"\n\nGenerate Title:`;

        const response = await llm.invoke([
            { role: "system", content: system_prompt },
            { role: "human", content: prompt }
        ]);

        const rawTitle = response.content.trim().replace(/['"]/g, "");

        return res.status(200).json({ title: rawTitle });
    } catch (error) {
        console.error("Title generation error:", error);
        return res.status(500).json({ error: "Title generation failed" });
    }
};