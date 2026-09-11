import { axiosInstance } from "../../utils/axios";

export const createOrder = async (plan) => {
    try {
        const { data } = await axiosInstance.post("/api/billing/create-order", { plan });
        return data;
    } catch (error) {
        console.error(error);
        return null
    }
}