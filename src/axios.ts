import axios from "axios";

const isServer = typeof window === "undefined";

const baseURL = isServer
  ? process.env.VITE_API_URL
  : import.meta.env.VITE_API_URL;

const axiosClient = axios.create({ baseURL });

export default axiosClient;
