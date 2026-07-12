package com.TransitOps.dto;

import java.util.Date;
import com.TransitOps.util.MaintenanceStatus;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MaintenanceDTO {
    private Long maintenanceID;
    private Long vehicleID;
    private Long expenseID;       // returned in response after creation
    private String serviceType;
    private String notes;
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    private Date maintenanceDate;
    private Double cost;          // sent on create, stored in ExpenseLog
    private MaintenanceStatus status;
}
