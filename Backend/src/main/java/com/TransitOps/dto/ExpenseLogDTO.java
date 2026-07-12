package com.TransitOps.dto;

import com.TransitOps.util.ExpenseCategory;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ExpenseLogDTO {
    private Long expenseLogID;
    private Long vehicleID;
    private Long tripID;
    private ExpenseCategory category;
    private Double amount;
    private String description;
    private String notes;
}
