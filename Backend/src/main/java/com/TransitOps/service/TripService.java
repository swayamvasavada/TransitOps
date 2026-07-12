package com.TransitOps.service;

import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.TransitOps.dao.DriverDAO;
import com.TransitOps.dao.TripDAO;
import com.TransitOps.dao.VehicleDAO;
import com.TransitOps.dto.TripDTO;
import com.TransitOps.entity.Driver;
import com.TransitOps.entity.Trip;
import com.TransitOps.entity.Vehicle;
import com.TransitOps.exception.ResourceNotFoundExcepiton;
import com.TransitOps.util.DriverStatus;
import com.TransitOps.util.TripStatus;
import com.TransitOps.util.VehicleStatus;

@Service
public class TripService {

    @Autowired
    private TripDAO tripDAO;

    @Autowired
    private VehicleDAO vehicleDAO;

    @Autowired
    private DriverDAO driverDAO;

    @Transactional
    public void createDraftTrip(TripDTO tripDTO) throws Exception {
        Vehicle vehicle = vehicleDAO.findByVehicleIDAndActive(tripDTO.getVehicleID(), true);
        if (vehicle == null) throw new ResourceNotFoundExcepiton("Vehicle not found!");

        Driver driver = driverDAO.findByDriverIDAndActive(tripDTO.getDriverID(), true);
        if (driver == null) throw new ResourceNotFoundExcepiton("Driver not found!");

        Trip trip = new Trip();
        BeanUtils.copyProperties(tripDTO, trip);
        trip.setVehicle(vehicle);
        trip.setDriver(driver);
        trip.setStatus(TripStatus.DRAFT);
        trip.setCreatedAt(new Date());
        trip.setUpdatedAt(new Date());

        tripDAO.save(trip);
    }

    @Transactional
    public void dispatchTrip(Long tripId) throws Exception {
        Trip trip = tripDAO.findById(tripId).orElseThrow(() -> new ResourceNotFoundExcepiton("Trip not found!"));
        
        if (trip.getStatus() != TripStatus.DRAFT) {
            throw new Exception("Only DRAFT trips can be dispatched.");
        }

        Vehicle vehicle = trip.getVehicle();
        Driver driver = trip.getDriver();

        // Business Rule Validations
        if (vehicle.getStatus() == VehicleStatus.RETIRED || vehicle.getStatus() == VehicleStatus.IN_SHOP) {
            throw new Exception("Vehicle is Retired or In Shop and cannot be dispatched.");
        }
        if (vehicle.getStatus() == VehicleStatus.ON_TRIP) {
            throw new Exception("Vehicle is already On Trip.");
        }
        
        if (driver.getStatus() == DriverStatus.SUSPENDED) {
            throw new Exception("Driver is Suspended and cannot be assigned to trips.");
        }
        if (driver.getStatus() == DriverStatus.ON_TRIP) {
            throw new Exception("Driver is already On Trip.");
        }
        if (driver.getLicenseExpiryDate() != null && driver.getLicenseExpiryDate().before(new Date())) {
            throw new Exception("Driver license is expired.");
        }

        if (trip.getCargoWeight() != null && vehicle.getMaxLoadCapacity() != null && trip.getCargoWeight() > vehicle.getMaxLoadCapacity()) {
            throw new Exception("Cargo weight exceeds vehicle's maximum load capacity.");
        }

        // State Transitions
        vehicle.setStatus(VehicleStatus.ON_TRIP);
        driver.setStatus(DriverStatus.ON_TRIP);
        trip.setStatus(TripStatus.DISPATCHED);
        trip.setStartingOdometer(vehicle.getOdometer());
        
        vehicleDAO.save(vehicle);
        driverDAO.save(driver);
        tripDAO.save(trip);
    }

    @Transactional
    public void completeTrip(Long tripId, Double finalOdometer, Double fuelConsumed) throws Exception {
        Trip trip = tripDAO.findById(tripId).orElseThrow(() -> new ResourceNotFoundExcepiton("Trip not found!"));
        
        if (trip.getStatus() != TripStatus.DISPATCHED) {
            throw new Exception("Only DISPATCHED trips can be completed.");
        }

        Vehicle vehicle = trip.getVehicle();
        Driver driver = trip.getDriver();

        // Update Trip Final Stats
        trip.setFinalOdometer(finalOdometer);
        trip.setFuelConsumed(fuelConsumed);
        trip.setStatus(TripStatus.COMPLETED);

        // State Transitions back to Available
        vehicle.setStatus(VehicleStatus.AVAILABLE);
        vehicle.setOdometer(finalOdometer);
        driver.setStatus(DriverStatus.AVAILABLE);

        // Safety Score Calculation
        if (driver.getSafetyScore() != null && driver.getSafetyScore() < 100.0) {
            driver.setSafetyScore(Math.min(100.0, driver.getSafetyScore() + 1.0));
        } else if (driver.getSafetyScore() == null) {
            driver.setSafetyScore(100.0);
        }

        vehicleDAO.save(vehicle);
        driverDAO.save(driver);
        tripDAO.save(trip);
    }

    @Transactional
    public void cancelTrip(Long tripId, Double finalOdometer, Double fuelConsumed) throws Exception {
        Trip trip = tripDAO.findById(tripId).orElseThrow(() -> new ResourceNotFoundExcepiton("Trip not found!"));
        
        if (trip.getStatus() == TripStatus.COMPLETED || trip.getStatus() == TripStatus.CANCELLED) {
            throw new Exception("Trip is already completed or cancelled.");
        }

        // If dispatched, restore vehicle and driver to available
        if (trip.getStatus() == TripStatus.DISPATCHED) {
            Vehicle vehicle = trip.getVehicle();
            Driver driver = trip.getDriver();
            
            vehicle.setStatus(VehicleStatus.AVAILABLE);
            driver.setStatus(DriverStatus.AVAILABLE);
            
            if (finalOdometer != null) {
                vehicle.setOdometer(finalOdometer);
                trip.setFinalOdometer(finalOdometer);
            }
            if (fuelConsumed != null) {
                trip.setFuelConsumed(fuelConsumed);
            }
            
            // Deduct safety score for cancelled dispatch
            if (driver.getSafetyScore() != null) {
                driver.setSafetyScore(Math.max(0.0, driver.getSafetyScore() - 5.0));
            } else {
                driver.setSafetyScore(95.0);
            }
            
            vehicleDAO.save(vehicle);
            driverDAO.save(driver);
        }

        trip.setStatus(TripStatus.CANCELLED);
        tripDAO.save(trip);
    }

    public List<TripDTO> getTrips(TripStatus status) {
        List<Trip> trips = status == null ? tripDAO.findAll() : tripDAO.findByStatus(status);
        return trips.stream().map(trip -> {
            TripDTO dto = new TripDTO();
            BeanUtils.copyProperties(trip, dto);
            dto.setVehicleID(trip.getVehicle().getVehicleID());
            dto.setDriverID(trip.getDriver().getDriverID());
            return dto;
        }).collect(Collectors.toList());
    }
}
