package com.TransitOps.entity;

import java.util.Date;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "FUEL_LOGS")
@Getter
@Setter
@NoArgsConstructor
public class FuelLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "FuelLogID")
    private Long fuelLogID;

    // Links to the central expense entry (cost lives in ExpenseLog)
    @ManyToOne
    @JoinColumn(name = "ExpenseID", nullable = false)
    private ExpenseLog expense;

    @ManyToOne
    @JoinColumn(name = "VehicleID")
    private Vehicle vehicle;

    @ManyToOne
    @JoinColumn(name = "TripID", nullable = true)
    private Trip trip;

    @Column(name = "LitresFilled")
    private Double litresFilled;

    @Column(name = "OdometerReading")
    private Double odometerReading;

    @Column(name = "FuelStation")
    private String fuelStation;

    @Column(name = "Notes")
    private String notes;

    @Column(name = "Active")
    private Boolean active;

    @Column(name = "CreatedAt")
    private Date createdAt;
}
