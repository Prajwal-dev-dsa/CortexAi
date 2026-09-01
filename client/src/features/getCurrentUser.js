import { axiosInstance } from "../../utils/axios";

export const getCurrentUser = async () => {
    try {
        const { data } = await axiosInstance.get("/api/me");
        return data;
    } catch (error) {
        console.error(error);
        return null
    }
}