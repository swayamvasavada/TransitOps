import axios from "axios";
import { BASE_URL } from "./apiPath";

const client = axios.create({
  baseURL: BASE_URL,
  // You can set common defaults here
});

// Attach token (from localStorage) to every request if present
client.interceptors.request.use(
  (config) => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers = config.headers || {};
        config.headers["Authorization"] = `Bearer ${token}`;
        // Debug: show that we're attaching a token (masked)
        try {
          const masked = token ? `${token.slice(0, 6)}...${token.slice(-4)}` : null;
          // eslint-disable-next-line no-console
          console.debug("axiosClient: attaching token", masked);
        } catch (e) {
          // ignore
        }
      }
    } catch (err) {
      // ignore
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Optional: expose 401/403 responses in console for debugging
client.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err?.response?.status;
    if (status === 401 || status === 403) {
      // eslint-disable-next-line no-console
      console.warn("API auth error", status, err?.response?.data || err?.message);
    }
    return Promise.reject(err);
  }
);

export default client;
