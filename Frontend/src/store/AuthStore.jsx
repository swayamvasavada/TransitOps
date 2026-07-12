import { create } from "zustand";
import axios from "axios";
import { Login } from "../api/apiPath";

const useAuthStore = create((set) => ({
  loading: false,
  user: null,
  token: localStorage.getItem("token") || null,
  error: null,

  login: async (email, password) => {
    try {
      set({
        loading: true,
        error: null,
      });

      const response = await axios.post(Login, {
        email,
        password,
      });

      const data = response.data;

      // Save token
      if (data.token) {
        localStorage.setItem("token", data.token);
      }

      set({
        loading: false,
        user: data.user,
        token: data.token,
        error: null,
      });

      return {
        success: true,
        data,
      };
    } catch (error) {
      set({
        loading: false,
        error: error.response?.data?.message || "Login failed",
      });

      return {
        success: false,
        message: error.response?.data?.message || "Login failed",
      };
    }
  },

  logout: () => {
    localStorage.removeItem("token");

    set({
      user: null,
      token: null,
      error: null,
    });
  },
}));

export default useAuthStore;