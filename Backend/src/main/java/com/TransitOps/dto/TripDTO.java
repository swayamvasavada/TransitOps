package com.TransitOps.dto;

import com.TransitOps.util.TripStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TripDTO {
    private Long tripID;
    private String source;
    private String destination;
    private Long vehicleID;
    private Long driverID;
    private Double cargoWeight;
    private Double plannedDistance;
    private Double startingOdometer;
    private Double finalOdometer;
    private Double fuelConsumed;
    private TripStatus status;
}
