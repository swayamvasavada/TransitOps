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

import com.TransitOps.dto.ResponseDTO;
import com.TransitOps.dto.TripDTO;
import com.TransitOps.service.TripService;

@CrossOrigin(origins = "*", allowedHeaders = "*")
@RestController
@RequestMapping("/api/trip")
public class TripController {

    @Autowired
    private TripService tripService;

    @PreAuthorize("hasAnyRole('MANAGER', 'DISPATCHER')")
    @PostMapping("/create")
    public ResponseEntity<ResponseDTO> createDraftTrip(@RequestBody TripDTO tripDTO) {
        ResponseDTO responseDTO = new ResponseDTO();
        try {
            tripService.createDraftTrip(tripDTO);
            responseDTO.setServiceResult("Trip draft created successfully");
            responseDTO.setMessage("Trip draft created successfully");
            responseDTO.setSuccess(true);
        } catch (Exception e) {
            e.printStackTrace();
            responseDTO.setServiceResult(e.getMessage());
            responseDTO.setMessage("Failed to create trip");
            responseDTO.setSuccess(false);
            return ResponseEntity.internalServerError().body(responseDTO);
        }
        return ResponseEntity.ok(responseDTO);
    }

    @PreAuthorize("hasAnyRole('MANAGER', 'DISPATCHER')")
    @PutMapping("/dispatch/{id}")
    public ResponseEntity<ResponseDTO> dispatchTrip(@PathVariable Long id) {
        ResponseDTO responseDTO = new ResponseDTO();
        try {
            tripService.dispatchTrip(id);
            responseDTO.setServiceResult("Trip dispatched successfully");
            responseDTO.setMessage("Trip dispatched successfully");
            responseDTO.setSuccess(true);
        } catch (Exception e) {
            e.printStackTrace();
            responseDTO.setServiceResult(e.getMessage());
            responseDTO.setMessage("Failed to dispatch trip");
            responseDTO.setSuccess(false);
            return ResponseEntity.internalServerError().body(responseDTO);
        }
        return ResponseEntity.ok(responseDTO);
    }

    @PreAuthorize("hasAnyRole('MANAGER', 'DISPATCHER', 'DRIVER')")
    @PutMapping("/complete/{id}")
    public ResponseEntity<ResponseDTO> completeTrip(@PathVariable Long id, @RequestParam Double finalOdometer, @RequestParam Double fuelConsumed) {
        ResponseDTO responseDTO = new ResponseDTO();
        try {
            tripService.completeTrip(id, finalOdometer, fuelConsumed);
            responseDTO.setServiceResult("Trip completed successfully");
            responseDTO.setMessage("Trip completed successfully");
            responseDTO.setSuccess(true);
        } catch (Exception e) {
            e.printStackTrace();
            responseDTO.setServiceResult(e.getMessage());
            responseDTO.setMessage("Failed to complete trip");
            responseDTO.setSuccess(false);
            return ResponseEntity.internalServerError().body(responseDTO);
        }
        return ResponseEntity.ok(responseDTO);
    }

    @PreAuthorize("hasAnyRole('MANAGER', 'DISPATCHER')")
    @PutMapping("/cancel/{id}")
    public ResponseEntity<ResponseDTO> cancelTrip(@PathVariable Long id, @RequestParam(required = false) Double finalOdometer, @RequestParam(required = false) Double fuelConsumed) {
        ResponseDTO responseDTO = new ResponseDTO();
        try {
            tripService.cancelTrip(id, finalOdometer, fuelConsumed);
            responseDTO.setServiceResult("Trip cancelled successfully");
            responseDTO.setMessage("Trip cancelled successfully");
            responseDTO.setSuccess(true);
        } catch (Exception e) {
            e.printStackTrace();
            responseDTO.setServiceResult(e.getMessage());
            responseDTO.setMessage("Failed to cancel trip");
            responseDTO.setSuccess(false);
            return ResponseEntity.internalServerError().body(responseDTO);
        }
        return ResponseEntity.ok(responseDTO);
    }

    @GetMapping
    public ResponseEntity<ResponseDTO> getTrips(@RequestParam(required = false) String status) {
        ResponseDTO responseDTO = new ResponseDTO();
        try {
            com.TransitOps.util.TripStatus tripStatus = status != null ? com.TransitOps.util.TripStatus.valueOf(status.toUpperCase()) : null;
            List<TripDTO> trips = tripService.getTrips(tripStatus);
            responseDTO.setServiceResult(trips);
            responseDTO.setMessage("Trips retrieved successfully");
            responseDTO.setSuccess(true);
        } catch (Exception e) {
            e.printStackTrace();
            responseDTO.setServiceResult(e.getMessage());
            responseDTO.setMessage("Failed to retrieve trips");
            responseDTO.setSuccess(false);
            return ResponseEntity.internalServerError().body(responseDTO);
        }
        return ResponseEntity.ok(responseDTO);
    }
}
