import { create } from "zustand";
import axios from "../api/axiosClient";
import {
  RegisterVehicle,
  GetVehicles,
  DeleteVehicle,
  UpdateVehicle,
} from "../api/apiPath";

const useVehicleStore = create((set) => ({
  loading: false,
  vehicles: [],
  vehicle: null,
  error: null,

  // ================= REGISTER VEHICLE =================
  registerVehicle: async ({
    vehicleID,
    registrationNumber,
    name,
    type,
    maxLoadCapacity,
    odometer,
    acquisitionCost,
    status,
  }) => {
    try {
      set({
        loading: true,
        error: null,
      });

      const response = await axios.post(RegisterVehicle, {
        vehicleID,
        registrationNumber,
        name,
        type,
        maxLoadCapacity,
        odometer,
        acquisitionCost,
        status,
      });

      set({
        loading: false,
        vehicle: response.data,
      });

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      set({
        loading: false,
        error: error.response?.data?.message || "Vehicle registration failed",
      });

      return {
        success: false,
        message: error.response?.data?.message || "Vehicle registration failed",
      };
    }
  },

  // ================= FETCH VEHICLES =================
  getVehicles: async () => {
    try {
      set({
        loading: true,
        error: null,
      });

      const response = await axios.get(GetVehicles);

      const data = response.data;

      // Normalize different response shapes into an array for `vehicles`.
      let list = [];
      if (Array.isArray(data)) list = data;
      else if (Array.isArray(data?.serviceResult)) list = data.serviceResult;
      else if (Array.isArray(data?.data)) list = data.data;
      else if (Array.isArray(data?.vehicles)) list = data.vehicles;
      else list = [];

      set({
        loading: false,
        vehicles: list,
      });

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      set({
        loading: false,
        error: error.response?.data?.message || "Failed to fetch vehicles",
      });

      return {
        success: false,
        message: error.response?.data?.message || "Failed to fetch vehicles",
      };
    }
  },
  // ================= DELETE VEHICLE =================
  deleteVehicle: async (id) => {
    try {
      set({
        loading: true,
        error: null,
      });

      await axios.delete(DeleteVehicle, {
        params: {
          id,
        },
      });

      set((state) => ({
        loading: false,
        vehicles: state.vehicles.filter((vehicle) => vehicle.vehicleID !== id),
      }));

      return {
        success: true,
      };
    } catch (error) {
      set({
        loading: false,
        error: error.response?.data?.message || "Failed to delete vehicle",
      });

      return {
        success: false,
        message: error.response?.data?.message || "Failed to delete vehicle",
      };
    }
  },    

  // ================= UPDATE VEHICLE =================
  updateVehicle: async (
    id,
    {
      registrationNumber,
      name,
      type,
      maxLoadCapacity,
      odometer,
      acquisitionCost,
      status,
    },
  ) => {
    try {
      set({
        loading: true,
        error: null,
      });

      const payload = {
        registrationNumber,
        name,
        type,
        maxLoadCapacity,
        odometer,
        acquisitionCost,
        status,
      };

      const response = await axios.put(UpdateVehicle, payload, {
        params: { id },
      });

      const data = response.data;

      set((state) => ({
        loading: false,
        vehicles: state.vehicles.map((vehicle) =>
          vehicle.vehicleID === id ? data : vehicle,
        ),
        error: null,
      }));

      return {
        success: true,
        data,
      };
    } catch (error) {
      set({
        loading: false,
        error: error.response?.data?.message || "Failed to update vehicle",
      });

      return {
        success: false,
        message: error.response?.data?.message || "Failed to update vehicle",
      };
    }
  },

  clearVehicle: () =>
    set({
      vehicle: null,
      error: null,
    }),
}));

export default useVehicleStore;
