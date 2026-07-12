package com.TransitOps.dto;

import com.TransitOps.util.VehicleStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class VehicleDTO {
    private Long vehicleID;
    private String registrationNumber;
    private String name;
    private String type;
    private Double maxLoadCapacity;
    private Double odometer;
    private Double acquisitionCost;
    private VehicleStatus status;
}
