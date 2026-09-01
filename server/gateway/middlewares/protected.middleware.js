import redis from "../../shared/redis/redis.js";

export const protectedRoute = async (req, res, next) => {
    try {
        const sessionId = req.cookies.session;
        if (!sessionId) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const data = await redis.get(`session:${sessionId}`);
        if (!data) {
            return res.status(401).json({ message: "Session expired" });
        }
        req.user = JSON.parse(data);
        next();
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: `Error in protected middleware: ${error.message}` });
    }
}