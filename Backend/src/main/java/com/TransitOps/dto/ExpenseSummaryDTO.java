package com.TransitOps.dto;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ExpenseSummaryDTO {
    private List<FuelLogDTO> fuelLogs;
    private List<ExpenseLogDTO> expenseLogs;   // TOLL + OTHER + MAINTENANCE in one list
    private Double totalFuelCost;
    private Double totalOtherExpenses;         // TOLL + OTHER + MAINTENANCE combined
    private Double totalOperationalCost;       // totalFuelCost + totalOtherExpenses
}
