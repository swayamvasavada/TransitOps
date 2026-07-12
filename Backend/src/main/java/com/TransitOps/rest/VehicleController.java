package com.TransitOps.rest;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.TransitOps.dto.ResponseDTO;
import com.TransitOps.dto.VehicleDTO;
import com.TransitOps.service.VehicleService;

@CrossOrigin(origins = "*", allowedHeaders = "*")
@RestController
@RequestMapping("/api/vehicle")
public class VehicleController {

    @Autowired
    private VehicleService vehicleService;

    @PreAuthorize("hasRole('MANAGER')")
    @PostMapping("/create")
    public ResponseEntity<ResponseDTO> createVehicle(@RequestBody VehicleDTO vehicleDTO) {
        System.out.println("Entering into VehicleController -> createVehicle");
        ResponseDTO responseDTO = new ResponseDTO();
        try {
            vehicleService.createVehicle(vehicleDTO);
            responseDTO.setServiceResult("Vehicle created successfully");
            responseDTO.setMessage("Vehicle created successfully");
            responseDTO.setSuccess(true);
        } catch (Exception e) {
            e.printStackTrace();
            responseDTO.setServiceResult(e.getMessage());
            responseDTO.setMessage("Failed to create vehicle");
            responseDTO.setSuccess(false);
            return ResponseEntity.internalServerError().body(responseDTO);
        }
        System.out.println("Exiting from VehicleController -> createVehicle");
        return ResponseEntity.ok(responseDTO);
    }

    @PreAuthorize("hasRole('MANAGER')")
    @PutMapping("/update/")
    public ResponseEntity<ResponseDTO> updateVehicle(@RequestParam Long id, @RequestBody VehicleDTO vehicleDTO) {
        System.out.println("Entering into VehicleController -> updateVehicle");
        ResponseDTO responseDTO = new ResponseDTO();
        try {
            vehicleService.updateVehicle(id, vehicleDTO);
            responseDTO.setServiceResult("Vehicle updated successfully");
            responseDTO.setMessage("Vehicle updated successfully");
            responseDTO.setSuccess(true);
        } catch (Exception e) {
            e.printStackTrace();
            responseDTO.setServiceResult(e.getMessage());
            responseDTO.setMessage("Failed to update vehicle");
            responseDTO.setSuccess(false);
            return ResponseEntity.internalServerError().body(responseDTO);
        }
        System.out.println("Exiting from VehicleController -> updateVehicle");
        return ResponseEntity.ok(responseDTO);
    }

    @PreAuthorize("hasRole('MANAGER')")
    @DeleteMapping("/delete/")
    public ResponseEntity<ResponseDTO> deleteVehicle(@RequestParam Long id) {
        System.out.println("Entering into VehicleController -> deleteVehicle");
        ResponseDTO responseDTO = new ResponseDTO();
        try {
            vehicleService.deleteVehicle(id);
            responseDTO.setServiceResult("Vehicle deleted successfully");
            responseDTO.setMessage("Vehicle deleted successfully");
            responseDTO.setSuccess(true);
        } catch (Exception e) {
            e.printStackTrace();
            responseDTO.setServiceResult(e.getMessage());
            responseDTO.setMessage("Failed to delete vehicle");
            responseDTO.setSuccess(false);
            return ResponseEntity.internalServerError().body(responseDTO);
        }
        System.out.println("Exiting from VehicleController -> deleteVehicle");
        return ResponseEntity.ok(responseDTO);
    }

    @GetMapping("/")
    public ResponseEntity<ResponseDTO> getVehicles(@RequestParam(required = false) Long id) {
        System.out.println("Entering into VehicleController -> getVehicles");
        ResponseDTO responseDTO = new ResponseDTO();
        try {
            if (id != null) {
                VehicleDTO vehicle = vehicleService.getVehicle(id);
                responseDTO.setServiceResult(vehicle);
            } else {
                List<VehicleDTO> vehicles = vehicleService.getAllVehicles();
                responseDTO.setServiceResult(vehicles);
            }
            responseDTO.setMessage("Vehicle(s) retrieved successfully");
            responseDTO.setSuccess(true);
        } catch (Exception e) {
            e.printStackTrace();
            responseDTO.setServiceResult(e.getMessage());
            responseDTO.setMessage("Failed to retrieve vehicle(s)");
            responseDTO.setSuccess(false);
            return ResponseEntity.internalServerError().body(responseDTO);
        }
        System.out.println("Exiting from VehicleController -> getVehicles");
        return ResponseEntity.ok(responseDTO);
    }
}
