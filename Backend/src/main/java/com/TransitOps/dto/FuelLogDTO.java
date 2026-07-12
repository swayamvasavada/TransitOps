package com.TransitOps.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FuelLogDTO {
    private Long fuelLogID;
    private Long expenseID;      // returned in response; not needed in create request
    private Long vehicleID;
    private Long tripID;
    private Double litresFilled;
    private Double totalCost;    // received directly from frontend
    private Double odometerReading;
    private String fuelStation;
    private String notes;
}
