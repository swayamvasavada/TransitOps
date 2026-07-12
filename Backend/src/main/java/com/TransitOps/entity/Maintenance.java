package com.TransitOps.entity;

import java.util.Date;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import com.TransitOps.util.MaintenanceStatus;

@Entity
@Table(name = "MAINTENANCE")
@Getter
@Setter
@NoArgsConstructor
public class Maintenance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "MaintenanceID")
    private Long maintenanceID;

    @ManyToOne
    @JoinColumn(name = "VehicleID", nullable = false)
    private Vehicle vehicle;

    // Links to the central expense entry (cost lives in ExpenseLog)
    @ManyToOne
    @JoinColumn(name = "ExpenseID", nullable = false)
    private ExpenseLog expense;

    @Column(name = "ServiceType")
    private String serviceType;

    @Column(name = "Notes", columnDefinition = "TEXT")
    private String notes;

    @Column(name = "MaintenanceDate")
    private Date maintenanceDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "Status")
    private MaintenanceStatus status;

    @Column(name = "Active")
    private Boolean active;

    @Column(name = "CreatedAt")
    private Date createdAt;

    @Column(name = "UpdatedAt")
    private Date updatedAt;
}
