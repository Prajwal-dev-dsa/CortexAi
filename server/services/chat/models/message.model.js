import mongoose from "mongoose"


const messageSchema = new mongoose.Schema({
    conversationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Conversation"
    },
    role: {
        type: String,
        enum: ["user", "assistant"]
    },
    content: String,
    images: [String]
}, {
    timestamps: true
})

export const MessageModel = mongoose.model("Message", messageSchema)