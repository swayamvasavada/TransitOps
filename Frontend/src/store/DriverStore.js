import { create } from "zustand";
import axios from "../api/axiosClient";
import { GetDrivers } from "../api/apiPath";

const useDriverStore = create((set, get) => ({
  loading: false,
  drivers: [],
  driver: null,
  error: null,

  // ================= FETCH DRIVERS =================
  fetchDrivers: async () => {
    try {
      set({
        loading: true,
        error: null,
      });

      const response = await axios.get(GetDrivers, { params: { role: "ROLE_DRIVER" } });

      const data = response.data;
      let list = [];
      if (Array.isArray(data)) list = data;
      else if (Array.isArray(data?.serviceResult)) list = data.serviceResult;
      else if (Array.isArray(data?.data)) list = data.data;
      else if (Array.isArray(data?.drivers)) list = data.drivers;
      else list = [];

      set({
        loading: false,
        drivers: list,
      });

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      set({
        loading: false,
        error: error.response?.data?.message || "Failed to fetch drivers",
      });

      return {
        success: false,
        message: error.response?.data?.message || "Failed to fetch drivers",
      };
    }
  },

  // Alias — TripDispatcher.jsx (and possibly other screens) call
  // `getDrivers()`. Kept as a thin wrapper so nothing else has to change.
  getDrivers: async () => {
    return get().fetchDrivers();
  },

  // ================= CLEAR STATE =================
  clearDriver: () => {
    set({
      driver: null,
      error: null,
    });
  },
}));

export default useDriverStore;