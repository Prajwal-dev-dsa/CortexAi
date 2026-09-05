import axios from "axios"

export const getAllMessages = async (conversationId) => {
    try {
        const { data } = await axios.get(`${process.env.CHAT_SERVICE_URL}/get-all-messages/${conversationId}`);
        return data;
    } catch (error) {
        console.error(error);
        return null
    }
}