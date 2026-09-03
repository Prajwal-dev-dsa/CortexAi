import express from "express"
import dotenv from "dotenv"
import router from "./routes/agent.route.js"

dotenv.config()

const app = express()

app.use(express.json())

const PORT = process.env.PORT || 8003

app.use("/", router)

app.listen(PORT, () => {
    console.log(`Agent service running on port ${PORT}`)
})