package com.TransitOps.service;

import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.TransitOps.dao.VehicleDAO;
import com.TransitOps.dto.VehicleDTO;
import com.TransitOps.entity.Vehicle;
import com.TransitOps.exception.ResourceNotFoundExcepiton;
import com.TransitOps.util.VehicleStatus;

@Service
public class VehicleService {

    @Autowired
    private VehicleDAO vehicleDAO;

    public void createVehicle(VehicleDTO vehicleDTO) throws Exception {
        if (vehicleDAO.existsByRegistrationNumberAndActive(vehicleDTO.getRegistrationNumber(), true)) {
            throw new Exception("Vehicle with this registration number already exists!");
        }

        Vehicle vehicle = new Vehicle();
        BeanUtils.copyProperties(vehicleDTO, vehicle);
        
        if (vehicle.getStatus() == null) {
            vehicle.setStatus(VehicleStatus.AVAILABLE);
        }
        if (vehicle.getOdometer() == null) {
            vehicle.setOdometer(0.0);
        }
        
        vehicle.setActive(true);
        vehicle.setCreatedAt(new Date());
        vehicle.setUpdatedAt(new Date());

        vehicleDAO.save(vehicle);
    }

    public void updateVehicle(Long id, VehicleDTO vehicleDTO) throws Exception {
        Vehicle vehicle = vehicleDAO.findByVehicleIDAndActive(id, true);
        if (vehicle == null) {
            throw new ResourceNotFoundExcepiton("Vehicle not found!");
        }

        if (!vehicle.getRegistrationNumber().equals(vehicleDTO.getRegistrationNumber()) && 
            vehicleDAO.existsByRegistrationNumberAndActive(vehicleDTO.getRegistrationNumber(), true)) {
            throw new Exception("Vehicle with this registration number already exists!");
        }

        vehicle.setRegistrationNumber(vehicleDTO.getRegistrationNumber());
        vehicle.setName(vehicleDTO.getName());
        vehicle.setType(vehicleDTO.getType());
        vehicle.setMaxLoadCapacity(vehicleDTO.getMaxLoadCapacity());
        vehicle.setOdometer(vehicleDTO.getOdometer());
        vehicle.setAcquisitionCost(vehicleDTO.getAcquisitionCost());
        
        if (vehicleDTO.getStatus() != null) {
            vehicle.setStatus(vehicleDTO.getStatus());
        }
        
        vehicle.setUpdatedAt(new Date());
        vehicleDAO.save(vehicle);
    }

    public void deleteVehicle(Long id) {
        Vehicle vehicle = vehicleDAO.findByVehicleIDAndActive(id, true);
        if (vehicle == null) {
            throw new ResourceNotFoundExcepiton("Vehicle not found!");
        }
        
        vehicle.setActive(false);
        vehicle.setUpdatedAt(new Date());
        vehicleDAO.save(vehicle);
    }

    public VehicleDTO getVehicle(Long id) {
        Vehicle vehicle = vehicleDAO.findByVehicleIDAndActive(id, true);
        if (vehicle == null) {
            throw new ResourceNotFoundExcepiton("Vehicle not found!");
        }
        VehicleDTO dto = new VehicleDTO();
        BeanUtils.copyProperties(vehicle, dto);
        return dto;
    }

    public List<VehicleDTO> getAllVehicles() {
        return vehicleDAO.findByActive(true).stream().map(vehicle -> {
            VehicleDTO dto = new VehicleDTO();
            BeanUtils.copyProperties(vehicle, dto);
            return dto;
        }).collect(Collectors.toList());
    }
}
