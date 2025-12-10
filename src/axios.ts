import axios from "axios";

const isServer = typeof window === "undefined";

const baseURL = isServer
	? process.env.VITE_API_URL
	: import.meta.env.VITE_API_URL;

const axiosClient = axios.create({ baseURL });

axiosClient.interceptors.request.use((config) => {
	if (isServer) return config;
	const token = localStorage.getItem("token");
	if (token) {
		config.headers.Authorization = `Bearer ${token}`;
	}
	return config;
});

export default axiosClient;
