import express from "express"
import { agentController } from "../controllers/agent.controller.js"
import { upload } from "../config/multer.js"

const router = express.Router()

router.post("/chat", upload.single("file"), agentController)

export default router;