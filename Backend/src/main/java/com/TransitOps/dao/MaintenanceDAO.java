package com.TransitOps.dao;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.TransitOps.entity.Maintenance;
import com.TransitOps.util.MaintenanceStatus;

@Repository
public interface MaintenanceDAO extends JpaRepository<Maintenance, Long> {
    List<Maintenance> findByVehicle_VehicleIDAndActive(Long vehicleID, Boolean active);
    List<Maintenance> findByStatusAndActive(MaintenanceStatus status, Boolean active);
    List<Maintenance> findByActive(Boolean active);
    Maintenance findByMaintenanceIDAndActive(Long maintenanceID, Boolean active);
}
