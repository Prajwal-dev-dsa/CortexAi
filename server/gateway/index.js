import express from "express"
import dotenv from "dotenv"
import cors from "cors"
import proxy from "express-http-proxy"
import cookieParser from "cookie-parser"
import { getCurrentUser } from "./controllers/user.controller.js"
import { protectedRoute } from "./middlewares/protected.middleware.js"

dotenv.config()

const app = express()

const PORT = process.env.PORT || 8000

app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true
}))

app.use(cookieParser())

app.use("/api/auth", proxy(process.env.AUTH_SERVICE_URL))
app.get("/api/me", protectedRoute, getCurrentUser)

app.listen(PORT, () => {
    console.log(`Gateway running on port ${PORT}`)
})