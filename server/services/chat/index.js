import express from "express"
import dotenv from "dotenv"
import connectDB from "./config/db.js"
import router from "./routes/chat.route.js"

dotenv.config()

const app = express()

app.use(express.json())

const PORT = process.env.PORT || 8002

app.use("/", router)

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Chat service running on port ${PORT}`)
    })
})