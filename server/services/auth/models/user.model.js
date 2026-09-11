import mongoose from "mongoose"

const userSchema = new mongoose.Schema({
    firebaseUid: {
        type: String,
        unique: true
    },
    name: String,
    email: String,
    avatar: String,
    plan: {
        type: String,
        default: "free"
    },
    credits: {
        type: Number,
        default: 100
    }
}, {
    timestamps: true
})

export const UserModel = mongoose.model("User", userSchema)