package com.TransitOps.dao;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.TransitOps.entity.ExpenseLog;
import com.TransitOps.util.ExpenseCategory;

@Repository
public interface ExpenseLogDAO extends JpaRepository<ExpenseLog, Long> {
    List<ExpenseLog> findByVehicle_VehicleIDAndActive(Long vehicleID, Boolean active);
    List<ExpenseLog> findByTrip_TripIDAndActive(Long tripID, Boolean active);
    List<ExpenseLog> findByCategoryAndActive(ExpenseCategory category, Boolean active);
    List<ExpenseLog> findByActive(Boolean active);
}
