import { axiosInstance } from "../../utils/axios";

export const generateTitleApi = async (userMessage, aiResponse) => {
    try {
        const { data } = await axiosInstance.post("/api/chat/generate-title", {
            userMessage,
            aiResponse
        });
        return data.title;
    } catch (error) {
        console.error("Failed to generate title", error);
        return null;
    }
};