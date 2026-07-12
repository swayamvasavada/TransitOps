import { create } from "zustand";
import axios from "../api/axiosClient";
import { RegisterVehicle, GetVehicles, DeleteVehicle } from "../api/apiPath";

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

      set({
        loading: false,
        vehicles: response.data,
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
  deleteVehicle: async (vehicleID) => {
    try {
      set({
        loading: true,
        error: null,
      });

      await axios.delete(DeleteVehicle, {
        params: {
          vehicleID,
        },
      });

      set((state) => ({
        loading: false,
        vehicles: state.vehicles.filter(
          (vehicle) => vehicle.vehicleID !== vehicleID,
        ),
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
    vehicleID,
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

      const response = await axios.put(`${UpdateVehicle}/${vehicleID}`, {
        vehicleID,
        registrationNumber,
        name,
        type,
        maxLoadCapacity,
        odometer,
        acquisitionCost,
        status,
      });

      const data = response.data;

      set((state) => ({
        loading: false,
        vehicles: state.vehicles.map((vehicle) =>
          vehicle.vehicleID === vehicleID ? data : vehicle,
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