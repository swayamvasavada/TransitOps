import {create} from 'zustand';
import axios from 'axios';
import {Login, Signup, requestemail, resetPassword} from '../api/apiPath';
import {tokenStorage} from '../services/storage/tokenStorage';

type AuthState = {
  loading: boolean;
  user: any | null;
  token: string | null;
  error: string | null;
  hydrate: () => Promise<void>;
  login: (email: string, password: string, role: string) => Promise<any>;
  logout: () => Promise<void>;
  requestResetPassword: (email: string) => Promise<any>;
  resetUserPassword: (token: string, newPassword: string) => Promise<any>;
  signup: (payload: Record<string, unknown>) => Promise<any>;
};

const extractToken = (response: any) => {
  const data = response?.data || {};
  if (data?.token) return data.token;
  if (data?.accessToken) return data.accessToken;
  if (data?.data?.token) return data.data.token;
  const authHeader = response?.headers?.authorization;
  if (authHeader) {
    const parts = authHeader.split(' ');
    return parts.length === 2 ? parts[1] : authHeader;
  }
  return null;
};

const useAuthStore = create<AuthState>(set => ({
  loading: false,
  user: null,
  token: null,
  error: null,

  hydrate: async () => {
    const [token, user] = await Promise.all([tokenStorage.getToken(), tokenStorage.getUser()]);
    set({token, user});
  },

  login: async (email, password, role) => {
    try {
      set({loading: true, error: null});
      const response = await axios.post(Login, {email, password, role});
      const data = response.data;

      if (!data.success) {
        set({loading: false, error: data.message});
        return {success: false, message: data.message};
      }

      await tokenStorage.setToken(data.serviceResult.token);
      await tokenStorage.setUser(data.serviceResult);
      set({loading: false, user: data.serviceResult, token: data.serviceResult.token, error: null});
      return {success: true, data: data.serviceResult};
    } catch (error: any) {
      const message = error.response?.data?.message || 'Login failed';
      set({loading: false, error: message});
      return {success: false, message};
    }
  },

  logout: async () => {
    await tokenStorage.clearSession();
    set({user: null, token: null, error: null});
  },

  requestResetPassword: async email => {
    try {
      set({loading: true, error: null});
      const response = await axios.get(requestemail, {params: {email}});
      set({loading: false});
      return {success: true, data: response.data};
    } catch (error: any) {
      const message = error.response?.data?.message || 'Something went wrong';
      set({loading: false, error: message});
      return {success: false, message};
    }
  },

  resetUserPassword: async (token, newPassword) => {
    try {
      set({loading: true, error: null});
      const response = await axios.post(resetPassword, null, {params: {token, newPassword}});
      set({loading: false});
      return {success: true, data: response.data};
    } catch (error: any) {
      const message = error.response?.data?.message || 'Password reset failed';
      set({loading: false, error: message});
      return {success: false, message};
    }
  },

  signup: async payload => {
    try {
      set({loading: true, error: null});
      const authToken = await tokenStorage.getToken();
      const response = await axios.post(Signup, payload, {
        headers: authToken ? {Authorization: `Bearer ${authToken}`} : {},
      });
      const data = response.data || {};
      const newToken = extractToken(response) || data.token || data.accessToken || null;
      if (newToken) {
        await tokenStorage.setToken(newToken);
      }
      set({loading: false, user: data.user || null, token: newToken || authToken, error: null});
      return {success: true, data};
    } catch (error: any) {
      const message = error.response?.data?.message || error.message;
      set({loading: false, error: message});
      return {success: false, message};
    }
  },
}));

export default useAuthStore;
