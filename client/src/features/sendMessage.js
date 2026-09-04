import { axiosInstance } from "../../utils/axios";

export const sendMessage = async (payload) => {
    try {
        const { data } = await axiosInstance.post(`/api/agent/chat`, payload);
        return data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}