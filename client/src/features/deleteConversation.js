import { axiosInstance } from "../../utils/axios";

export const deleteConversation = async (conversationId) => {
    try {
        const { data } = await axiosInstance.delete(`/api/chat/delete-conversation/${conversationId}`);
        return data;
    } catch (error) {
        console.error(error);
        return null;
    }
};