package com.TransitOps.rest;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.TransitOps.dto.MaintenanceDTO;
import com.TransitOps.dto.ResponseDTO;
import com.TransitOps.service.MaintenanceService;

@CrossOrigin(origins = "*", allowedHeaders = "*")
@RestController
@RequestMapping("/api/maintenance")
public class MaintenanceController {

    @Autowired
    private MaintenanceService maintenanceService;

    @PreAuthorize("hasAnyRole('MANAGER', 'DISPATCHER')")
    @PostMapping("/create")
    public ResponseEntity<ResponseDTO> createMaintenance(@RequestBody MaintenanceDTO maintenanceDTO) {
        System.out.println("Entering into MaintenanceController -> createMaintenance");
        ResponseDTO responseDTO = new ResponseDTO();
        try {
            maintenanceService.createMaintenance(maintenanceDTO);
            responseDTO.setServiceResult("Maintenance record created successfully");
            responseDTO.setMessage("Maintenance record created successfully");
            responseDTO.setSuccess(true);
        } catch (Exception e) {
            e.printStackTrace();
            responseDTO.setServiceResult(e.getMessage());
            responseDTO.setMessage("Failed to create maintenance record");
            responseDTO.setSuccess(false);
            return ResponseEntity.internalServerError().body(responseDTO);
        }
        System.out.println("Exiting from MaintenanceController -> createMaintenance");
        return ResponseEntity.ok(responseDTO);
    }

    @PreAuthorize("hasAnyRole('MANAGER', 'DISPATCHER')")
    @PutMapping("/complete/{id}")
    public ResponseEntity<ResponseDTO> completeMaintenance(@PathVariable Long id) {
        System.out.println("Entering into MaintenanceController -> completeMaintenance");
        ResponseDTO responseDTO = new ResponseDTO();
        try {
            maintenanceService.completeMaintenance(id);
            responseDTO.setServiceResult("Maintenance completed successfully");
            responseDTO.setMessage("Maintenance completed successfully");
            responseDTO.setSuccess(true);
        } catch (Exception e) {
            e.printStackTrace();
            responseDTO.setServiceResult(e.getMessage());
            responseDTO.setMessage("Failed to complete maintenance");
            responseDTO.setSuccess(false);
            return ResponseEntity.internalServerError().body(responseDTO);
        }
        System.out.println("Exiting from MaintenanceController -> completeMaintenance");
        return ResponseEntity.ok(responseDTO);
    }

    @GetMapping
    public ResponseEntity<ResponseDTO> getMaintenanceLogs(
            @RequestParam(required = false) Long vehicleID,
            @RequestParam(required = false) String status) {
        System.out.println("Entering into MaintenanceController -> getMaintenanceLogs");
        ResponseDTO responseDTO = new ResponseDTO();
        try {
            List<MaintenanceDTO> logs = maintenanceService.getMaintenanceLogs(vehicleID, status);
            responseDTO.setServiceResult(logs);
            responseDTO.setMessage("Maintenance logs retrieved successfully");
            responseDTO.setSuccess(true);
        } catch (Exception e) {
            e.printStackTrace();
            responseDTO.setServiceResult(e.getMessage());
            responseDTO.setMessage("Failed to retrieve maintenance logs");
            responseDTO.setSuccess(false);
            return ResponseEntity.internalServerError().body(responseDTO);
        }
        System.out.println("Exiting from MaintenanceController -> getMaintenanceLogs");
        return ResponseEntity.ok(responseDTO);
    }
}
