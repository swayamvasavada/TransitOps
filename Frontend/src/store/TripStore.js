// import { create } from "zustand";
// import axios from "axios";
// import {
//   RegisterTrip,
//   GetTrips,
// //   UpdateTrip,
// //   DeleteTrip,
// } from "../api/apiPath";

// const useTripStore = create((set) => ({
//   loading: false,
//   trips: [],
//   trip: null,
//   error: null,

//   // ================= CREATE TRIP =================
//   registerTrip: async ({
//     tripID,
//     source,
//     destination,
//     vehicleID,
//     driverID,
//     cargoWeight,
//     plannedDistance,
//     startingOdometer,
//     finalOdometer,
//     fuelConsumed,
//     status,
//   }) => {
//     try {
//       set({
//         loading: true,
//         error: null,
//       });

//       const response = await axios.post(RegisterTrip, {
//         tripID,
//         source,
//         destination,
//         vehicleID,
//         driverID,
//         cargoWeight,
//         plannedDistance,
//         startingOdometer,
//         finalOdometer,
//         fuelConsumed,
//         status,
//       });

//       const data = response.data;

//       set((state) => ({
//         loading: false,
//         trip: data,
//         trips: [...state.trips, data],
//         error: null,
//       }));

//       return {
//         success: true,
//         data,
//       };
//     } catch (error) {
//       set({
//         loading: false,
//         error: error.response?.data?.message || "Trip creation failed",
//       });

//       return {
//         success: false,
//         message: error.response?.data?.message || "Trip creation failed",
//       };
//     }
//   },

//   // ================= GET TRIPS =================
//   getTrips: async () => {
//     try {
//       set({
//         loading: true,
//         error: null,
//       });

//       const response = await axios.get(GetTrips);

//       set({
//         loading: false,
//         trips: response.data,
//       });

//       return {
//         success: true,
//         data: response.data,
//       };
//     } catch (error) {
//       set({
//         loading: false,
//         error: error.response?.data?.message || "Failed to fetch trips",
//       });

//       return {
//         success: false,
//         message: error.response?.data?.message || "Failed to fetch trips",
//       };
//     }
//   },

// //   // ================= UPDATE TRIP =================
// //   updateTrip: async (
// //     tripID,
// //     {
// //       source,
// //       destination,
// //       vehicleID,
// //       driverID,
// //       cargoWeight,
// //       plannedDistance,
// //       startingOdometer,
// //       finalOdometer,
// //       fuelConsumed,
// //       status,
// //     }
// //   ) => {
// //     try {
// //       set({
// //         loading: true,
// //         error: null,
// //       });

// //       const response = await axios.put(`${UpdateTrip}/${tripID}`, {
// //         tripID,
// //         source,
// //         destination,
// //         vehicleID,
// //         driverID,
// //         cargoWeight,
// //         plannedDistance,
// //         startingOdometer,
// //         finalOdometer,
// //         fuelConsumed,
// //         status,
// //       });

// //       const data = response.data;

// //       set((state) => ({
// //         loading: false,
// //         trips: state.trips.map((trip) =>
// //           trip.tripID === tripID ? data : trip
// //         ),
// //         error: null,
// //       }));

// //       return {
// //         success: true,
// //         data,
// //       };
// //     } catch (error) {
// //       set({
// //         loading: false,
// //         error: error.response?.data?.message || "Failed to update trip",
// //       });

// //       return {
// //         success: false,
// //         message: error.response?.data?.message || "Failed to update trip",
// //       };
// //     }
// //   },

// //   // ================= DELETE TRIP =================
// //   deleteTrip: async (tripID) => {
// //     try {
// //       set({
// //         loading: true,
// //         error: null,
// //       });

// //       await axios.delete(`${DeleteTrip}/${tripID}`);

// //       set((state) => ({
// //         loading: false,
// //         trips: state.trips.filter(
// //           (trip) => trip.tripID !== tripID
// //         ),
// //       }));

// //       return {
// //         success: true,
// //       };
// //     } catch (error) {
// //       set({
// //         loading: false,
// //         error: error.response?.data?.message || "Failed to delete trip",
// //       });

// //       return {
// //         success: false,
// //         message: error.response?.data?.message || "Failed to delete trip",
// //       };
// //     }
// //   },

//   clearTrip: () => {
//     set({
//       trip: null,
//       error: null,
//     });
//   },
// }));

// export default useTripStore;

import { create } from "zustand";
import axios from "axios";
import {
  RegisterTrip,
  GetTrips,
  DispatchTrip,
  CompleteTrip,
  CancelTrip,
} from "../api/apiPath";

const useTripStore = create((set) => ({
  loading: false,
  trips: [],
  trip: null,
  error: null,

  // ================= CREATE TRIP =================
  registerTrip: async ({
    tripID,
    source,
    destination,
    vehicleID,
    driverID,
    cargoWeight,
    plannedDistance,
    startingOdometer,
    finalOdometer,
    fuelConsumed,
    status,
  }) => {
    try {
      set({
        loading: true,
        error: null,
      });

      const response = await axios.post(RegisterTrip, {
        tripID,
        source,
        destination,
        vehicleID,
        driverID,
        cargoWeight,
        plannedDistance,
        startingOdometer,
        finalOdometer,
        fuelConsumed,
        status,
      });

      const data = response.data;

      set((state) => ({
        loading: false,
        trip: data,
        trips: [...state.trips, data],
        error: null,
      }));

      return {
        success: true,
        data,
      };
    } catch (error) {
      set({
        loading: false,
        error: error.response?.data?.message || "Trip creation failed",
      });

      return {
        success: false,
        message: error.response?.data?.message || "Trip creation failed",
      };
    }
  },

  // ================= GET ALL TRIPS =================
  getTrips: async () => {
    try {
      set({
        loading: true,
        error: null,
      });

      const response = await axios.get(GetTrips);

      set({
        loading: false,
        trips: response.data,
        error: null,
      });

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      set({
        loading: false,
        error: error.response?.data?.message || "Failed to fetch trips",
      });

      return {
        success: false,
        message: error.response?.data?.message || "Failed to fetch trips",
      };
    }
  },

  // ================= DISPATCH TRIP =================
  dispatchTrip: async (tripID) => {
    try {
      set({
        loading: true,
        error: null,
      });

      const response = await axios.put(
        `${DispatchTrip}/${tripID}`
      );

      const data = response.data;

      set((state) => ({
        loading: false,
        trips: state.trips.map((trip) =>
          trip.tripID === tripID ? data : trip
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
        error:
          error.response?.data?.message || "Failed to dispatch trip",
      });

      return {
        success: false,
        message:
          error.response?.data?.message || "Failed to dispatch trip",
      };
    }
  },

  // ================= COMPLETE TRIP =================
  completeTrip: async (
    tripID,
    finalOdometer,
    fuelConsumed
  ) => {
    try {
      set({
        loading: true,
        error: null,
      });

      const response = await axios.put(
        `${CompleteTrip}/${tripID}`,
        {
          finalOdometer,
          fuelConsumed,
        }
      );

      const data = response.data;

      set((state) => ({
        loading: false,
        trips: state.trips.map((trip) =>
          trip.tripID === tripID ? data : trip
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
        error:
          error.response?.data?.message || "Failed to complete trip",
      });

      return {
        success: false,
        message:
          error.response?.data?.message || "Failed to complete trip",
      };
    }
  },

  // ================= CANCEL TRIP =================
  cancelTrip: async (
    tripID,
    finalOdometer,
    fuelConsumed
  ) => {
    try {
      set({
        loading: true,
        error: null,
      });

      const response = await axios.put(
        `${CancelTrip}/${tripID}`,
        {
          finalOdometer,
          fuelConsumed,
        }
      );

      const data = response.data;

      set((state) => ({
        loading: false,
        trips: state.trips.map((trip) =>
          trip.tripID === tripID ? data : trip
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
        error:
          error.response?.data?.message || "Failed to cancel trip",
      });

      return {
        success: false,
        message:
          error.response?.data?.message || "Failed to cancel trip",
      };
    }
  },

  // ================= CLEAR STATE =================
  clearTrip: () => {
    set({
      trip: null,
      error: null,
    });
  },
}));

export default useTripStore;