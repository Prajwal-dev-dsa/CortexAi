import axios from "axios"

const VITE_SERVER_URL = "https://cortexai-a21z.onrender.com"
export const axiosInstance = axios.create({
    baseURL: VITE_SERVER_URL,
    withCredentials: true
})