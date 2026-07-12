package com.TransitOps.service;

import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.TransitOps.dao.ExpenseLogDAO;
import com.TransitOps.dao.FuelLogDAO;
import com.TransitOps.dao.TripDAO;
import com.TransitOps.dao.VehicleDAO;
import com.TransitOps.dto.ExpenseLogDTO;
import com.TransitOps.dto.ExpenseSummaryDTO;
import com.TransitOps.dto.FuelLogDTO;
import com.TransitOps.entity.ExpenseLog;
import com.TransitOps.entity.FuelLog;
import com.TransitOps.entity.Trip;
import com.TransitOps.entity.Vehicle;
import com.TransitOps.exception.ResourceNotFoundExcepiton;
import com.TransitOps.util.ExpenseCategory;

@Service
public class LogService {

    @Autowired
    private FuelLogDAO fuelLogDAO;

    @Autowired
    private ExpenseLogDAO expenseLogDAO;

    @Autowired
    private VehicleDAO vehicleDAO;

    @Autowired
    private TripDAO tripDAO;
    
    @Transactional
    public void addFuelLog(FuelLogDTO dto) throws Exception {
        Vehicle vehicle = vehicleDAO.findByVehicleIDAndActive(dto.getVehicleID(), true);
        if (vehicle == null) throw new ResourceNotFoundExcepiton("Vehicle not found!");

        Trip trip = null;
        if (dto.getTripID() != null) {
            trip = tripDAO.findByTripIDAndActive(dto.getTripID(), true)
                    .orElseThrow(() -> new ResourceNotFoundExcepiton("Trip not found!"));
        }

        // Use totalCost directly from frontend
        double totalCost = dto.getTotalCost() != null ? dto.getTotalCost() : 0.0;

        // Step 1: Create the central ExpenseLog entry (category = FUEL)
        ExpenseLog expenseLog = new ExpenseLog();
        expenseLog.setVehicle(vehicle);
        expenseLog.setTrip(trip);
        expenseLog.setCategory(ExpenseCategory.FUEL);
        expenseLog.setAmount(totalCost);
        expenseLog.setDescription("Fuel fill-up" + (dto.getFuelStation() != null ? " at " + dto.getFuelStation() : ""));
        expenseLog.setNotes(dto.getNotes());
        expenseLog.setActive(true);
        expenseLog.setCreatedAt(new Date());
        expenseLog = expenseLogDAO.save(expenseLog);

        // Step 2: Create the FuelLog with the returned ExpenseID
        FuelLog fuelLog = new FuelLog();
        fuelLog.setExpense(expenseLog);
        fuelLog.setVehicle(vehicle);
        fuelLog.setTrip(trip);
        fuelLog.setLitresFilled(dto.getLitresFilled());
        fuelLog.setOdometerReading(dto.getOdometerReading());
        fuelLog.setFuelStation(dto.getFuelStation());
        fuelLog.setNotes(dto.getNotes());
        fuelLog.setActive(true);
        fuelLog.setCreatedAt(new Date());
        fuelLogDAO.save(fuelLog);
    }

    public List<FuelLogDTO> getFuelLogs(Long vehicleID, Long tripID) {
        List<FuelLog> logs;
        if (vehicleID != null) {
            logs = fuelLogDAO.findByVehicle_VehicleIDAndActive(vehicleID, true);
        } else if (tripID != null) {
            logs = fuelLogDAO.findByTrip_TripIDAndActive(tripID, true);
        } else {
            logs = fuelLogDAO.findByActive(true);
        }
        return logs.stream().map(log -> {
            FuelLogDTO dto = new FuelLogDTO();
            BeanUtils.copyProperties(log, dto);
            dto.setVehicleID(log.getVehicle().getVehicleID());
            if (log.getTrip() != null) dto.setTripID(log.getTrip().getTripID());
            dto.setExpenseID(log.getExpense().getExpenseLogID());
            dto.setTotalCost(log.getExpense().getAmount());
            return dto;
        }).collect(Collectors.toList());
    }

    @Transactional
    public void addExpenseLog(ExpenseLogDTO dto) throws Exception {
        Vehicle vehicle = vehicleDAO.findByVehicleIDAndActive(dto.getVehicleID(), true);
        if (vehicle == null) throw new ResourceNotFoundExcepiton("Vehicle not found!");

        // Prevent FUEL and MAINTENANCE from being created directly via this endpoint
        // Fuel is created via /log/fuel and Maintenance via /maintenance
        if (dto.getCategory() == ExpenseCategory.FUEL || dto.getCategory() == ExpenseCategory.MAINTENANCE) {
            throw new Exception("Use the dedicated /log/fuel or /maintenance endpoint for this category.");
        }

        ExpenseLog log = new ExpenseLog();
        log.setVehicle(vehicle);
        log.setCategory(dto.getCategory());
        log.setAmount(dto.getAmount());
        log.setDescription(dto.getDescription());
        log.setNotes(dto.getNotes());
        log.setActive(true);
        log.setCreatedAt(new Date());

        if (dto.getTripID() != null) {
            Trip trip = tripDAO.findByTripIDAndActive(dto.getTripID(), true)
                    .orElseThrow(() -> new ResourceNotFoundExcepiton("Trip not found!"));
            log.setTrip(trip);
        }

        expenseLogDAO.save(log);
    }

    public List<ExpenseLogDTO> getExpenseLogs(Long vehicleID, Long tripID, String categoryStr) {
        List<ExpenseLog> logs;
        if (vehicleID != null) {
            logs = expenseLogDAO.findByVehicle_VehicleIDAndActive(vehicleID, true);
        } else if (tripID != null) {
            logs = expenseLogDAO.findByTrip_TripIDAndActive(tripID, true);
        } else if (categoryStr != null) {
            ExpenseCategory category = ExpenseCategory.valueOf(categoryStr.toUpperCase());
            logs = expenseLogDAO.findByCategoryAndActive(category, true);
        } else {
            logs = expenseLogDAO.findByActive(true);
        }
        return logs.stream().map(log -> {
            ExpenseLogDTO dto = new ExpenseLogDTO();
            BeanUtils.copyProperties(log, dto);
            dto.setVehicleID(log.getVehicle().getVehicleID());
            if (log.getTrip() != null) dto.setTripID(log.getTrip().getTripID());
            return dto;
        }).collect(Collectors.toList());
    }

    public ExpenseSummaryDTO getExpenseSummary() {
        // Fetch all active fuel logs
        List<FuelLogDTO> fuelLogs = getFuelLogs(null, null);

        // Single expense list: TOLL + OTHER + MAINTENANCE (all non-FUEL)
        List<ExpenseLogDTO> expenseLogs = expenseLogDAO.findByActive(true).stream()
                .filter(log -> log.getCategory() != ExpenseCategory.FUEL)
                .map(log -> {
                    ExpenseLogDTO dto = new ExpenseLogDTO();
                    BeanUtils.copyProperties(log, dto);
                    dto.setVehicleID(log.getVehicle().getVehicleID());
                    if (log.getTrip() != null) dto.setTripID(log.getTrip().getTripID());
                    return dto;
                }).collect(Collectors.toList());

        double totalFuelCost = fuelLogs.stream()
                .mapToDouble(f -> f.getTotalCost() != null ? f.getTotalCost() : 0.0).sum();
        double totalOtherExpenses = expenseLogs.stream()
                .mapToDouble(e -> e.getAmount() != null ? e.getAmount() : 0.0).sum();

        return new ExpenseSummaryDTO(
                fuelLogs,
                expenseLogs,
                totalFuelCost,
                totalOtherExpenses,
                totalFuelCost + totalOtherExpenses
        );
    }
}
