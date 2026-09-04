import "../config/firebase.js";
import { getAuth } from "firebase-admin/auth";
import { UserModel } from "../models/user.model.js";
import redis from "../../../shared/redis/redis.js";

export const login = async (req, res) => {
    try {
        const { token } = req.body;
        if (!token) {
            return res.status(400).json({ message: "Token is required" });
        }
        const decoded = await getAuth().verifyIdToken(token);
        if (!decoded) {
            return res.status(401).json({ message: "Invalid token" });
        }
        let user = await UserModel.findOne({ firebaseUid: decoded.uid });
        if (!user) {
            user = await UserModel.create({
                firebaseUid: decoded.uid,
                name: decoded.name,
                email: decoded.email,
                avatar: decoded.picture
            });
        }

        const sessionId = crypto.randomUUID();
        res.cookie("session", sessionId, {
            httpOnly: true,
            secure: false,
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        await redis.set(`session:${sessionId}`, JSON.stringify(user), "EX", 7 * 24 * 60 * 60);
        res.json({ message: "Login Successful", user });
    } catch (error) {
        res.status(500).json({ message: `Error in Login Controller: ${error.message}` });
    }
}


export const logout = async (req, res) => {
    try {
        const sessionId = req.cookies.session;
        if (!sessionId) {
            return res.status(400).json({ message: "Session is required" });
        }
        await redis.del(`session:${sessionId}`);
        res.clearCookie("session");
        res.json({ message: "Logout Successful" });
    } catch (error) {
        res.status(500).json({ message: `Error in Logout Controller: ${error.message}` });
    }
}