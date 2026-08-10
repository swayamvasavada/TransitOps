import {create} from 'zustand';
import axios from '../api/axiosClient';
import {DeleteVehicle, GetVehicles, RegisterVehicle, UpdateVehicle} from '../api/apiPath';

const extractList = (data: any) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.serviceResult)) return data.serviceResult;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.vehicles)) return data.vehicles;
  return [];
};

const useVehicleStore = create<any>(set => ({
  loading: false,
  vehicles: [],
  vehicle: null,
  error: null,

  registerVehicle: async (payload: any) => {
    try {
      set({loading: true, error: null});
      const response = await axios.post(RegisterVehicle, payload);
      set({loading: false, vehicle: response.data});
      return {success: true, data: response.data};
    } catch (error: any) {
      const message = error.response?.data?.message || 'Vehicle registration failed';
      set({loading: false, error: message});
      return {success: false, message};
    }
  },

  getVehicles: async () => {
    try {
      set({loading: true, error: null});
      const response = await axios.get(GetVehicles);
      set({loading: false, vehicles: extractList(response.data)});
      return {success: true, data: response.data};
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to fetch vehicles';
      set({loading: false, error: message});
      return {success: false, message};
    }
  },

  deleteVehicle: async (id: string) => {
    try {
      set({loading: true, error: null});
      await axios.delete(DeleteVehicle, {params: {id}});
      set((state: any) => ({
        loading: false,
        vehicles: state.vehicles.filter((vehicle: any) => vehicle.vehicleID !== id),
      }));
      return {success: true};
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to delete vehicle';
      set({loading: false, error: message});
      return {success: false, message};
    }
  },

  updateVehicle: async (id: string, payload: any) => {
    try {
      set({loading: true, error: null});
      const response = await axios.put(UpdateVehicle, payload, {params: {id}});
      const data = response.data;
      set((state: any) => ({
        loading: false,
        vehicles: state.vehicles.map((vehicle: any) => (vehicle.vehicleID === id ? data : vehicle)),
        error: null,
      }));
      return {success: true, data};
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to update vehicle';
      set({loading: false, error: message});
      return {success: false, message};
    }
  },

  clearVehicle: () => set({vehicle: null, error: null}),
}));

export default useVehicleStore;
