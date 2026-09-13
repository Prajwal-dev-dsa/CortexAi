import dotenv from "dotenv";
dotenv.config();
import Redis from "ioredis";

const redis = new Redis(process.env.REDIS_URL, {
    family: 0,
    tls: {
        rejectUnauthorized: false
    }
});

redis.on("connect", () => {
    console.log("Connected to Upstash Redis securely");
});

redis.on("error", (err) => {
    console.error("Upstash Redis connection error:", err);
});

export default redis;