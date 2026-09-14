import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import proxy from "express-http-proxy";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import { getCurrentUser } from "./controllers/user.controller.js";
import { protectedRoute } from "./middlewares/protected.middleware.js";
import { proxyWithHeader } from "./utils/proxyWithHeader.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

app.use(morgan("dev"));

app.use(cors({
    origin: [
        "https://cortex-ai-nu.vercel.app",
        "http://localhost:5173",
        process.env.CLIENT_URL
    ].filter(Boolean),
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
}));

app.use(cookieParser());

app.use("/api/auth", proxy("http://127.0.0.1:8001"));
app.use("/api/chat", protectedRoute, proxyWithHeader("http://127.0.0.1:8002"));
app.use("/api/agent", protectedRoute, proxyWithHeader("http://127.0.0.1:8003"));
app.use("/api/billing", protectedRoute, proxyWithHeader("http://127.0.0.1:8004"));

app.get("/api/me", protectedRoute, getCurrentUser);

app.listen(PORT, () => {
    console.log(`Gateway securely running on port ${PORT}`);
});