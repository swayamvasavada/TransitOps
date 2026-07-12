import { create } from "zustand";
import axios from "axios";
import { Login, requestemail, resetPassword, Signup } from "../api/apiPath";

const storedToken = localStorage.getItem("token");
const storedUser = localStorage.getItem("user");

const useAuthStore = create((set) => ({
  loading: false,
  user: storedUser ? JSON.parse(storedUser) : null,
  token: storedToken,
  error: null,

  login: async (email, password, role) => {
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

      if (!data.success) {
        set({
          loading: false,
          error: data.message,
        });

        return {
          success: false,
          message: data.message,
        };
      }

      localStorage.setItem("token", data.serviceResult.token);
      localStorage.setItem("user", JSON.stringify(data.serviceResult));
      console.log(
        ">>>>>>>>>>>",
        localStorage.getItem("token", data.serviceResult.token),
      );

      set({
        loading: false,
        user: data.serviceResult,
        token: data.serviceResult.token,
        error: null,
      });

      return {
        success: true,
        data: data.serviceResult,
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
    localStorage.removeItem("user");

    if (!data.success) {
      set({
        loading: false,
        error: data.message,
      });

      return {
        success: false,
        message: data.message,
      };
    }

    localStorage.setItem("token", data.serviceResult.token);
    localStorage.setItem("user", JSON.stringify(data.serviceResult));
    console.log(
      ">>>>>>>>>>>",
      localStorage.getItem("token", data.serviceResult.token),
    );

    set({
      loading: false,
      user: data.serviceResult,
      token: data.serviceResult.token,
      error: null,
    });

    return {
      success: true,
      data: data.serviceResult,
    };
  },
  catch(error) {
    set({
      loading: false,
      error: error.response?.data?.message || "Login failed",
    });

    return {
      success: false,
      message: error.response?.data?.message || "Login failed",
    };
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
        message: error.response?.data?.message || "Something went wrong",
      };
    }
  },

  resetUserPassword: async (token, newPassword) => {
    try {
      set({
        loading: true,
        error: null,
      });

      const response = await axios.post(resetPassword, null, {
        params: {
          token,
          newPassword,
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
        error: error.response?.data?.message || "Password reset failed",
      });

      return {
        success: false,
        message: error.response?.data?.message || "Password reset failed",
      };
    }
  },
  // ================= SIGNUP =================
  // ================= SIGNUP =================
// ================= SIGNUP =================
signup: async ({
  name,
  email,
  password,
  phoneNo,
  licenseNo,
  licenseExpiryDate,
  role,
  driverStatus,
  safetyScore,
  driverID,
}) => {
  try {
    set({
      loading: true,
      error: null,
    });

    const payload = {
      name,
      email,
      password,
      phoneNo,
      licenseNo,
      licenseExpiryDate,
      role,
    };

    // Extra fields only when provided
    if (driverStatus !== undefined) {
      payload.driverStatus = driverStatus;
    }

    if (safetyScore !== undefined) {
      payload.safetyScore = safetyScore;
    }

    if (driverID !== undefined) {
      payload.driverID = driverID;
    }

    const authToken = localStorage.getItem("token");

    const response = await axios.post(
      Signup,
      payload,
      {
        headers: authToken
          ? {
              Authorization: `Bearer ${authToken}`,
            }
          : {},
      }
    );

    const data = response.data || {};

    // Extract token from response (if signup returns one)
    const extractToken = (resp) => {
      const d = resp?.data || {};

      if (d?.token) return d.token;
      if (d?.accessToken) return d.accessToken;
      if (d?.data?.token) return d.data.token;

      if (resp?.headers?.authorization) {
        const parts = resp.headers.authorization.split(" ");
        return parts.length === 2
          ? parts[1]
          : resp.headers.authorization;
      }

      return null;
    };

    const newToken =
      extractToken(response) ||
      data.token ||
      data.accessToken ||
      null;

    if (newToken) {
      localStorage.setItem("token", newToken);
    }

    set({
      loading: false,
      user: data.user || null,
      token: newToken || authToken,
      error: null,
    });

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.log("Signup Error:", error);
    console.log("Response:", error.response);
    console.log("Data:", error.response?.data);

    set({
      loading: false,
      error: error.response?.data?.message || error.message,
    });

    return {
      success: false,
      message: error.response?.data?.message || error.message,
    };
  }
},

}));

export default useAuthStore;
