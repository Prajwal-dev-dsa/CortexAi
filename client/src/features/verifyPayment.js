import { axiosInstance } from "../../utils/axios";

export const verifyPayment = async (signature) => {
    try {
        const { data } = await axiosInstance.post("/api/billing/verify-payment", signature);
        return data;
    } catch (error) {
        console.error(error);
        return null
    }
}