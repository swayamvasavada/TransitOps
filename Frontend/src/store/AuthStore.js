import { create } from "zustand";
import axios from "axios";
import { Login, requestemail, resetPassword } from "../api/apiPath";

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
            console.log( ">>>>>>>>>>>",localStorage.getItem("token", data.serviceResult.token));
            

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

    resetUserPassword: async (token, newPassword) => {
        try {
            set({
                loading: true,
                error: null,
            });

            const response = await axios.post(
                resetPassword,
                null,
                {
                    params: {
                        token,
                        newPassword,
                    },
                }
            );

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
                message:
                    error.response?.data?.message || "Password reset failed",
            };
        }
    },
}));

export default useAuthStore;