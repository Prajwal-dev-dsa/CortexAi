import redis from "../../../shared/redis/redis.js"
import { UserModel } from "../models/user.model.js"
import { CREDITS_COST } from "../utils/credits.js"


export const updateUserPayment = async (req, res) => {
    try {
        const { plan, credits, userId } = req.body
        if (!plan || !credits || !userId) {
            return res.status(400).json({ message: "All fields are required" })
        }
        const user = await UserModel.findById(userId)
        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }
        user.plan = plan
        user.credits += parseInt(credits)
        await user.save()

        const sessionId = await redis.get(`user-session-${userId}`);
        if (!sessionId) {
            return res.status(400).json({ message: "Session is required" });
        }

        await redis.set(`session:${sessionId}`, JSON.stringify(user), "EX", 7 * 24 * 60 * 60);
        res.status(200).json({ message: "Payment updated successfully" });
    } catch (error) {
        res.status(500).json(`Error updating payment: ${error.message}`)
    }
}


export const deductCredits = async (req, res) => {
    try {
        const { userId, agentUsed } = req.body;
        if (!userId || !agentUsed) {
            return res.status(400).json({ message: "User ID and agent used are required" });
        }
        const user = await UserModel.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const credits = CREDITS_COST[agentUsed]
        if (!credits) {
            return res.status(400).json({ message: "Invalid agent used" });
        }
        if (user.credits < credits) {
            return res.status(400).json({ message: "Insufficient credits" });
        }
        user.credits -= credits;
        await user.save();
        const sessionId = await redis.get(`user-session-${userId}`);
        if (!sessionId) {
            return res.status(400).json({ message: "Session is required" });
        }

        await redis.set(`session:${sessionId}`, JSON.stringify(user), "EX", 7 * 24 * 60 * 60);
        res.status(200).json({ message: "Credits deducted successfully" });
    } catch (error) {
        res.status(500).json(`Error deducting credits: ${error.message}`)
    }
}
