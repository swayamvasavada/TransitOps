package com.TransitOps.service;

import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.TransitOps.dao.ExpenseLogDAO;
import com.TransitOps.dao.MaintenanceDAO;
import com.TransitOps.dao.VehicleDAO;
import com.TransitOps.dto.MaintenanceDTO;
import com.TransitOps.entity.ExpenseLog;
import com.TransitOps.entity.Maintenance;
import com.TransitOps.entity.Vehicle;
import com.TransitOps.exception.ResourceNotFoundExcepiton;
import com.TransitOps.util.ExpenseCategory;
import com.TransitOps.util.MaintenanceStatus;
import com.TransitOps.util.VehicleStatus;

@Service
public class MaintenanceService {

    @Autowired
    private MaintenanceDAO maintenanceDAO;

    @Autowired
    private VehicleDAO vehicleDAO;

    @Autowired
    private ExpenseLogDAO expenseLogDAO;

    @Transactional
    public void createMaintenance(MaintenanceDTO dto) throws Exception {
        Vehicle vehicle = vehicleDAO.findByVehicleIDAndActive(dto.getVehicleID(), true);
        if (vehicle == null) throw new ResourceNotFoundExcepiton("Vehicle not found!");

        // Business Rule: Vehicle must be AVAILABLE or IN_SHOP to log maintenance
        if (vehicle.getStatus() == VehicleStatus.ON_TRIP) {
            throw new Exception("Vehicle is currently On Trip and cannot be sent for maintenance.");
        }
        if (vehicle.getStatus() == VehicleStatus.RETIRED) {
            throw new Exception("Vehicle is Retired and cannot be sent for maintenance.");
        }

        // Step 1: Create the central ExpenseLog entry (category = MAINTENANCE)
        ExpenseLog expenseLog = new ExpenseLog();
        expenseLog.setVehicle(vehicle);
        expenseLog.setCategory(ExpenseCategory.MAINTENANCE);
        expenseLog.setAmount(dto.getCost() != null ? dto.getCost() : 0.0);
        expenseLog.setDescription(dto.getServiceType());
        expenseLog.setNotes(dto.getNotes());
        expenseLog.setActive(true);
        expenseLog.setCreatedAt(new Date());
        expenseLog = expenseLogDAO.save(expenseLog);

        // Step 2: Create the Maintenance record with the returned ExpenseID
        Maintenance maintenance = new Maintenance();
        maintenance.setVehicle(vehicle);
        maintenance.setExpense(expenseLog);
        maintenance.setServiceType(dto.getServiceType());
        maintenance.setNotes(dto.getNotes());
        maintenance.setMaintenanceDate(dto.getMaintenanceDate() != null ? dto.getMaintenanceDate() : new Date());
        maintenance.setStatus(MaintenanceStatus.IN_SHOP);
        maintenance.setActive(true);
        maintenance.setCreatedAt(new Date());
        maintenance.setUpdatedAt(new Date());
        maintenanceDAO.save(maintenance);

        // Step 3: Business Rule — set vehicle status to IN_SHOP
        vehicle.setStatus(VehicleStatus.IN_SHOP);
        vehicle.setUpdatedAt(new Date());
        vehicleDAO.save(vehicle);
    }

    @Transactional
    public void completeMaintenance(Long id) throws Exception {
        Maintenance maintenance = maintenanceDAO.findByMaintenanceIDAndActive(id, true);
        if (maintenance == null) throw new ResourceNotFoundExcepiton("Maintenance record not found!");

        if (maintenance.getStatus() == MaintenanceStatus.COMPLETED) {
            throw new Exception("Maintenance is already completed.");
        }

        // Business Rule: Set vehicle back to AVAILABLE
        Vehicle vehicle = maintenance.getVehicle();
        vehicle.setStatus(VehicleStatus.AVAILABLE);
        vehicle.setUpdatedAt(new Date());
        vehicleDAO.save(vehicle);

        maintenance.setStatus(MaintenanceStatus.COMPLETED);
        maintenance.setUpdatedAt(new Date());
        maintenanceDAO.save(maintenance);
    }

    public List<MaintenanceDTO> getMaintenanceLogs(Long vehicleID, String statusStr) {
        List<Maintenance> logs;
        if (vehicleID != null) {
            logs = maintenanceDAO.findByVehicle_VehicleIDAndActive(vehicleID, true);
        } else if (statusStr != null) {
            MaintenanceStatus status = MaintenanceStatus.valueOf(statusStr.toUpperCase());
            logs = maintenanceDAO.findByStatusAndActive(status, true);
        } else {
            logs = maintenanceDAO.findByActive(true);
        }
        return logs.stream().map(this::toDTO).collect(Collectors.toList());
    }

    private MaintenanceDTO toDTO(Maintenance m) {
        MaintenanceDTO dto = new MaintenanceDTO();
        BeanUtils.copyProperties(m, dto);
        dto.setVehicleID(m.getVehicle().getVehicleID());
        dto.setExpenseID(m.getExpense().getExpenseLogID());
        dto.setCost(m.getExpense().getAmount());
        return dto;
    }
}
