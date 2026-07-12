package com.TransitOps.dao;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.TransitOps.entity.FuelLog;

@Repository
public interface FuelLogDAO extends JpaRepository<FuelLog, Long> {
    List<FuelLog> findByVehicle_VehicleIDAndActive(Long vehicleID, Boolean active);
    List<FuelLog> findByTrip_TripIDAndActive(Long tripID, Boolean active);
    List<FuelLog> findByActive(Boolean active);
}
