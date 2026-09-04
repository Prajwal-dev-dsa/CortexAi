import { axiosInstance } from "../../utils/axios";

export const logOut = async () => {
    try {
        const { data } = await axiosInstance.get("/api/auth/logout");
        return data;
    } catch (error) {
        console.error(error);
        return null
    }
}