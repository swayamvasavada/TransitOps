import {create} from 'zustand';
import axios from '../api/axiosClient';
import {GetDrivers} from '../api/apiPath';

const extractList = (data: any) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.serviceResult)) return data.serviceResult;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.drivers)) return data.drivers;
  return [];
};

const useDriverStore = create<any>((set, get) => ({
  loading: false,
  drivers: [],
  driver: null,
  error: null,

  fetchDrivers: async () => {
    try {
      set({loading: true, error: null});
      const response = await axios.get(GetDrivers, {params: {role: 'ROLE_DRIVER'}});
      set({loading: false, drivers: extractList(response.data)});
      return {success: true, data: response.data};
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to fetch drivers';
      set({loading: false, error: message});
      return {success: false, message};
    }
  },

  getDrivers: async () => get().fetchDrivers(),
  clearDriver: () => set({driver: null, error: null}),
}));

export default useDriverStore;
