import useAuthStore from "../store/AuthStore";
import useVehicleStore from "../store/VehicleStore";
import useTripStore from "../store/TripStore";
import useDriverStore from "../store/DriverStore";

export default function useGlobalLoading() {
  const authLoading = useAuthStore((s) => s.loading);
  const vehicleLoading = useVehicleStore((s) => s.loading);
  const tripLoading = useTripStore((s) => s.loading);
  const driverLoading = useDriverStore((s) => s.loading);

  return Boolean(authLoading || vehicleLoading || tripLoading || driverLoading);
}
