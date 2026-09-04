import { axiosInstance } from "../../utils/axios";

export const createConversation = async () => {
    try {
        const { data } = await axiosInstance.get("/api/chat/create-conversation");
        return data;
    } catch (error) {
        console.error(error);
        return null
    }
}