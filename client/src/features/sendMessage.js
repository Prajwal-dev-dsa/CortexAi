import { axiosInstance } from "../../utils/axios";

export const sendMessage = async (payload) => {
    try {
        const formData = new FormData();
        formData.append("prompt", payload.prompt);
        formData.append("conversationId", payload.conversationId);
        formData.append("agent", payload.agent);

        if (payload.file) {
            formData.append("file", payload.file);
        }

        const { data } = await axiosInstance.post(`/api/agent/chat`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        return data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}