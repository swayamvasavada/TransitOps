package com.TransitOps.dao;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.TransitOps.entity.Vehicle;
import java.util.List;

@Repository
public interface VehicleDAO extends JpaRepository<Vehicle, Long> {
    boolean existsByRegistrationNumberAndActive(String registrationNumber, Boolean active);
    Vehicle findByRegistrationNumberAndActive(String registrationNumber, Boolean active);
    Vehicle findByVehicleIDAndActive(Long vehicleID, Boolean active);
    List<Vehicle> findByActive(Boolean active);
    List<Vehicle> findByStatusAndActive(com.TransitOps.util.VehicleStatus status, Boolean active);
}
