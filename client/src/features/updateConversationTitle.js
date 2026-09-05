import { axiosInstance } from "../../utils/axios";

export const updateConversationTitle = async (conversationId, title) => {
    try {
        const { data } = await axiosInstance.post("/api/chat/update-conversation-title", { conversationId, title });
        return data;
    } catch (error) {
        console.error(error);
        return null
    }
}