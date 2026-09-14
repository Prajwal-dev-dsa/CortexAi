import express from "express"
import dotenv from "dotenv"
import connectDB from "./config/db.js"
import cookieParser from "cookie-parser"
import router from "./routes/billing.route.js"

dotenv.config()

const app = express()

app.use(express.json())
app.use(cookieParser())

app.use("/", router)

connectDB().then(() => {
    const PORT = 8004;
    app.listen(PORT, "127.0.0.1", () => {
        console.log(`Service securely running internally on http://127.0.0.1:${PORT}`);
    });
})