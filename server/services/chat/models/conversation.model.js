import mongoose from "mongoose"


const conversationSchema = new mongoose.Schema({
    title: {
        type: String,
        default: "New Conversation"
    },
    userId: String
}, {
    timestamps: true
})

export const ConversationModel = mongoose.model("Conversation", conversationSchema)