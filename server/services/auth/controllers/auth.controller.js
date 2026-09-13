import "../config/firebase.js";
import { getAuth } from "firebase-admin/auth";
import { UserModel } from "../models/user.model.js";
import redis from "../../../shared/redis/redis.js";
import crypto from "crypto";

const SESSION_DURATION = 7 * 24 * 60 * 60; // 7 days in seconds
const COOKIE_MAX_AGE = SESSION_DURATION * 1000; // 7 days in milliseconds

export const login = async (req, res) => {
    try {
        const { token } = req.body;

        if (!token) {
            return res.status(400).json({
                message: "Token is required"
            });
        }

        const decoded = await getAuth().verifyIdToken(token);

        if (!decoded) {
            return res.status(401).json({
                message: "Invalid token"
            });
        }

        let user = await UserModel.findOne({
            firebaseUid: decoded.uid
        });

        if (!user) {
            user = await UserModel.create({
                firebaseUid: decoded.uid,
                name: decoded.name,
                email: decoded.email,
                avatar: decoded.picture
            });
        }

        const sessionId = crypto.randomUUID();

        await redis.set(
            `user-session-${user._id}`,
            sessionId,
            "EX",
            SESSION_DURATION
        );

        await redis.set(
            `session:${sessionId}`,
            JSON.stringify(user),
            "EX",
            SESSION_DURATION
        );

        res.cookie("session", sessionId, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            maxAge: COOKIE_MAX_AGE,
            path: "/"
        });

        return res.status(200).json({
            message: "Login Successful",
            user
        });

    } catch (error) {
        console.error("Login Error:", error);

        return res.status(500).json({
            message: `Error in Login Controller: ${error.message}`
        });
    }
};


export const logout = async (req, res) => {
    try {
        const sessionId = req.cookies?.session;

        if (!sessionId) {
            res.clearCookie("session", {
                httpOnly: true,
                secure: true,
                sameSite: "none",
                path: "/"
            });

            return res.status(200).json({
                message: "Logout Successful"
            });
        }

        const sessionData = await redis.get(`session:${sessionId}`);

        await redis.del(`session:${sessionId}`);

        if (sessionData) {
            const user = JSON.parse(sessionData);

            if (user?._id) {
                await redis.del(`user-session-${user._id}`);
            }
        }

        res.clearCookie("session", {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            path: "/"
        });

        return res.status(200).json({
            message: "Logout Successful"
        });

    } catch (error) {
        console.error("Logout Error:", error);

        return res.status(500).json({
            message: `Error in Logout Controller: ${error.message}`
        });
    }
};