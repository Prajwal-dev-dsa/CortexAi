import axios from "axios";

export const deductCredits = async (userId, agentUsed) => {
    try {
        const res = await axios.post(`${process.env.AUTH_SERVICE_URL}/payment/deduct-credits`, { userId, agentUsed });
        return res.status;
    } catch (error) {
        if (error.response && error.response.status) {
            return error.response.status;
        }
        console.error("Credit deduction failed:", error.message);
        return null;
    }
}