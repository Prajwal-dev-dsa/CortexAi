import express from "express"
import { createConversation, getConversations, deleteConversation, saveMessage, getAllMessages, updateConversation, generateTitleForConversation } from "../controllers/chat.controller.js"


const router = express.Router()

router.get("/create-conversation", createConversation)
router.get("/get-conversations", getConversations)
router.post("/update-conversation-title", updateConversation)
router.delete("/delete-conversation/:conversationId", deleteConversation)
router.post("/save-message", saveMessage)
router.get("/get-all-messages/:conversationId", getAllMessages)
router.post("/generate-title", generateTitleForConversation)

export default router