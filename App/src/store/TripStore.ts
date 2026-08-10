import {create} from 'zustand';
import axios from '../api/axiosClient';
import {CancelTrip, CompleteTrip, DispatchTrip, GetTrips, RegisterTrip} from '../api/apiPath';

const extractList = (data: any) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.serviceResult)) return data.serviceResult;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.trips)) return data.trips;
  return [];
};

const extractItem = (data: any) => {
  if (!data) return null;
  if (data?.serviceResult && !Array.isArray(data.serviceResult)) return data.serviceResult;
  if (data?.data && !Array.isArray(data.data)) return data.data;
  return data;
};

const useTripStore = create<any>(set => ({
  loading: false,
  trips: [],
  trip: null,
  error: null,

  registerTrip: async (payload: any) => {
    try {
      set({loading: true, error: null});
      const response = await axios.post(RegisterTrip, payload);
      const data = extractItem(response.data);
      set((state: any) => ({loading: false, trip: data, trips: [...state.trips, data].filter(Boolean)}));
      return {success: true, data};
    } catch (error: any) {
      const message = error.response?.data?.message || 'Trip creation failed';
      set({loading: false, error: message});
      return {success: false, message};
    }
  },

  getTrips: async () => {
    try {
      set({loading: true, error: null});
      const response = await axios.get(GetTrips);
      set({loading: false, trips: extractList(response.data), error: null});
      return {success: true, data: response.data};
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to fetch trips';
      set({loading: false, error: message});
      return {success: false, message};
    }
  },

  dispatchTrip: async (tripID: string) => {
    try {
      set({loading: true, error: null});
      const response = await axios.put(`${DispatchTrip}/${tripID}`);
      const data = extractItem(response.data);
      set((state: any) => ({
        loading: false,
        trips: state.trips.map((trip: any) => (trip.tripID === tripID ? data : trip)),
      }));
      return {success: true, data};
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to dispatch trip';
      set({loading: false, error: message});
      return {success: false, message};
    }
  },

  completeTrip: async (tripID: string, finalOdometer: string, fuelConsumed: string) => {
    try {
      set({loading: true, error: null});
      const response = await axios.put(`${CompleteTrip}/${tripID}`, {finalOdometer, fuelConsumed});
      const data = extractItem(response.data);
      set((state: any) => ({
        loading: false,
        trips: state.trips.map((trip: any) => (trip.tripID === tripID ? data : trip)),
      }));
      return {success: true, data};
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to complete trip';
      set({loading: false, error: message});
      return {success: false, message};
    }
  },

  cancelTrip: async (tripID: string, finalOdometer: string, fuelConsumed: string) => {
    try {
      set({loading: true, error: null});
      const response = await axios.put(`${CancelTrip}/${tripID}`, {finalOdometer, fuelConsumed});
      const data = extractItem(response.data);
      set((state: any) => ({
        loading: false,
        trips: state.trips.map((trip: any) => (trip.tripID === tripID ? data : trip)),
      }));
      return {success: true, data};
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to cancel trip';
      set({loading: false, error: message});
      return {success: false, message};
    }
  },

  clearTrip: () => set({trip: null, error: null}),
}));

export default useTripStore;
