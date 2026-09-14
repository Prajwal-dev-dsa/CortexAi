import express from "express"
import dotenv from "dotenv"
import connectDB from "./config/db.js"
import authRouter from "./routes/auth.route.js"
import paymentRouter from "./routes/payment.route.js"
import cookieParser from "cookie-parser"

dotenv.config()

const app = express()

app.use(express.json())
app.use(cookieParser())

app.use("/", authRouter)
app.use("/payment", paymentRouter)

connectDB().then(() => {
    const PORT = 8001;
    app.listen(PORT, "127.0.0.1", () => {
        console.log(`Service securely running internally on http://127.0.0.1:${PORT}`);
    });
})