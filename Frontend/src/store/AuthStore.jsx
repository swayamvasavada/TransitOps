import { create } from "zustand";
import axios from "axios";
import { Login , requestemail  } from "../api/apiPath";

const useAuthStore = create((set) => ({
  loading: false,
  user: null,
  token: localStorage.getItem("token") || null,
  error: null,

  login: async (email, password,role) => {
    try {
      set({
        loading: true,
        error: null,
      });

      const response = await axios.post(Login, {
        email,
        password,
        role,
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

  requestResetPassword: async (email) => {
  try {
    set({
      loading: true,
      error: null,
    });

    const response = await axios.get(requestemail, {
      params: {
        email,
      },
    });

    set({
      loading: false,
    });

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    set({
      loading: false,
      error: error.response?.data?.message || "Something went wrong",
    });

    return {
      success: false,
      message:
        error.response?.data?.message || "Something went wrong",
    };
  }
},
}));

export default useAuthStore;