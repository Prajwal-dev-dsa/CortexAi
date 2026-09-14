import express from "express"
import dotenv from "dotenv"
import router from "./routes/agent.route.js"

dotenv.config()

const app = express()

app.use(express.json())

app.use("/", router)

app.use((err, req, res, next) => {
    console.error(err);
    if (res.status === 429) {
        return res.status(429).json({
            error: err.message,
            data: err.data || null
        });
    }
    return next(err);
});

const PORT = 8003;
app.listen(PORT, "127.0.0.1", () => {
    console.log(`Service securely running internally on http://127.0.0.1:${PORT}`);
});