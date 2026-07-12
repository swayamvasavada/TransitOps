package com.TransitOps.rest;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.TransitOps.dto.ExpenseLogDTO;
import com.TransitOps.dto.ExpenseSummaryDTO;
import com.TransitOps.dto.FuelLogDTO;
import com.TransitOps.dto.ResponseDTO;
import com.TransitOps.service.LogService;

@CrossOrigin(origins = "*", allowedHeaders = "*")
@RestController
@RequestMapping("/api/log")
public class LogController {

    @Autowired
    private LogService logService;

    @PreAuthorize("hasAnyRole('MANAGER', 'DISPATCHER', 'DRIVER')")
    @PostMapping("/fuel")
    public ResponseEntity<ResponseDTO> addFuelLog(@RequestBody FuelLogDTO fuelLogDTO) {
        System.out.println("Entering into LogController -> addFuelLog");
        ResponseDTO responseDTO = new ResponseDTO();
        try {
            logService.addFuelLog(fuelLogDTO);
            responseDTO.setServiceResult("Fuel log added successfully");
            responseDTO.setMessage("Fuel log added successfully");
            responseDTO.setSuccess(true);
        } catch (Exception e) {
            e.printStackTrace();
            responseDTO.setServiceResult(e.getMessage());
            responseDTO.setMessage("Failed to add fuel log");
            responseDTO.setSuccess(false);
            return ResponseEntity.internalServerError().body(responseDTO);
        }
        System.out.println("Exiting from LogController -> addFuelLog");
        return ResponseEntity.ok(responseDTO);
    }

    @GetMapping("/fuel")
    public ResponseEntity<ResponseDTO> getFuelLogs(
            @RequestParam(required = false) Long vehicleID,
            @RequestParam(required = false) Long tripID) {
        System.out.println("Entering into LogController -> getFuelLogs");
        ResponseDTO responseDTO = new ResponseDTO();
        try {
            List<FuelLogDTO> logs = logService.getFuelLogs(vehicleID, tripID);
            responseDTO.setServiceResult(logs);
            responseDTO.setMessage("Fuel logs retrieved successfully");
            responseDTO.setSuccess(true);
        } catch (Exception e) {
            e.printStackTrace();
            responseDTO.setServiceResult(e.getMessage());
            responseDTO.setMessage("Failed to retrieve fuel logs");
            responseDTO.setSuccess(false);
            return ResponseEntity.internalServerError().body(responseDTO);
        }
        System.out.println("Exiting from LogController -> getFuelLogs");
        return ResponseEntity.ok(responseDTO);
    }

    @PreAuthorize("hasAnyRole('MANAGER', 'DISPATCHER', 'DRIVER')")
    @PostMapping("/expense")
    public ResponseEntity<ResponseDTO> addExpenseLog(@RequestBody ExpenseLogDTO expenseLogDTO) {
        System.out.println("Entering into LogController -> addExpenseLog");
        ResponseDTO responseDTO = new ResponseDTO();
        try {
            logService.addExpenseLog(expenseLogDTO);
            responseDTO.setServiceResult("Expense log added successfully");
            responseDTO.setMessage("Expense log added successfully");
            responseDTO.setSuccess(true);
        } catch (Exception e) {
            e.printStackTrace();
            responseDTO.setServiceResult(e.getMessage());
            responseDTO.setMessage("Failed to add expense log");
            responseDTO.setSuccess(false);
            return ResponseEntity.internalServerError().body(responseDTO);
        }
        System.out.println("Exiting from LogController -> addExpenseLog");
        return ResponseEntity.ok(responseDTO);
    }

    @GetMapping("/expense")
    public ResponseEntity<ResponseDTO> getExpenseLogs(
            @RequestParam(required = false) Long vehicleID,
            @RequestParam(required = false) Long tripID,
            @RequestParam(required = false) String category) {
        System.out.println("Entering into LogController -> getExpenseLogs");
        ResponseDTO responseDTO = new ResponseDTO();
        try {
            List<ExpenseLogDTO> logs = logService.getExpenseLogs(vehicleID, tripID, category);
            responseDTO.setServiceResult(logs);
            responseDTO.setMessage("Expense logs retrieved successfully");
            responseDTO.setSuccess(true);
        } catch (Exception e) {
            e.printStackTrace();
            responseDTO.setServiceResult(e.getMessage());
            responseDTO.setMessage("Failed to retrieve expense logs");
            responseDTO.setSuccess(false);
            return ResponseEntity.internalServerError().body(responseDTO);
        }
        System.out.println("Exiting from LogController -> getExpenseLogs");
        return ResponseEntity.ok(responseDTO);
    }

    @GetMapping("/summary")
    public ResponseEntity<ResponseDTO> getExpenseSummary(
            @RequestParam(required = false) Long vehicleID,
            @RequestParam(required = false) Long tripID) {
        System.out.println("Entering into LogController -> getExpenseSummary");
        ResponseDTO responseDTO = new ResponseDTO();
        try {
            ExpenseSummaryDTO summary = logService.getExpenseSummary(vehicleID, tripID);
            responseDTO.setServiceResult(summary);
            responseDTO.setMessage("Expense summary retrieved successfully");
            responseDTO.setSuccess(true);
        } catch (Exception e) {
            e.printStackTrace();
            responseDTO.setServiceResult(e.getMessage());
            responseDTO.setMessage("Failed to retrieve expense summary");
            responseDTO.setSuccess(false);
            return ResponseEntity.internalServerError().body(responseDTO);
        }
        System.out.println("Exiting from LogController -> getExpenseSummary");
        return ResponseEntity.ok(responseDTO);
    }
}
