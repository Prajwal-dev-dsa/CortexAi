import { axiosInstance } from "../../utils/axios";

export const getAllMessages = async (conversationId) => {
    try {
        const { data } = await axiosInstance.get(`/api/chat/get-all-messages/${conversationId}`);
        return data;
    } catch (error) {
        console.error(error);
        return null
    }
}