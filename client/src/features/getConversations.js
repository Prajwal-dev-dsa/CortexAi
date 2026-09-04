import { axiosInstance } from "../../utils/axios";

export const getConversations = async () => {
    try {
        const { data } = await axiosInstance.get("/api/chat/get-conversations");
        return data;
    } catch (error) {
        console.error(error);
        return null
    }
}