import axios from "axios";
import { getAccessToken } from "./session";

const FALLBACK_API_URL = "http://localhost:3000";

export const http = axios.create({
  headers: { "Content-Type": "application/json" },
  validateStatus: () => true,
});

http.interceptors.request.use((config) => {
  config.baseURL = process.env.NEXT_PUBLIC_API_URL || FALLBACK_API_URL;
  const token = getAccessToken();
  if (token) {
    config.headers.set("Authorization", `Bearer ${token}`);
  }
  return config;
});
