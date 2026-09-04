import express from "express"
import { createConversation, getConversations, deleteConversation, saveMessage, getAllMessages, updateConversation } from "../controllers/chat.controller.js"


const router = express.Router()

router.get("/create-conversation", createConversation)
router.get("/get-conversations", getConversations)
router.post("/update-conversation", updateConversation)
router.delete("/delete-conversation/:conversationId", deleteConversation)
router.post("/save-message", saveMessage)
router.get("/get-all-messages/:conversationId", getAllMessages)

export default router