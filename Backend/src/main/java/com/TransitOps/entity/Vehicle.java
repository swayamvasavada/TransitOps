package com.TransitOps.entity;

import java.util.Date;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import com.TransitOps.util.VehicleStatus;

@Entity
@Table(name = "VEHICLES")
@Getter
@Setter
@NoArgsConstructor
public class Vehicle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "VehicleID")
    private Long vehicleID;

    @Column(name = "RegistrationNumber", unique = true, nullable = false)
    private String registrationNumber;

    @Column(name = "Name")
    private String name;

    @Column(name = "Type")
    private String type;

    @Column(name = "MaxLoadCapacity")
    private Double maxLoadCapacity;

    @Column(name = "Odometer")
    private Double odometer;

    @Column(name = "AcquisitionCost")
    private Double acquisitionCost;

    @Enumerated(EnumType.STRING)
    @Column(name = "Status")
    private VehicleStatus status;

    @Column(name = "Active")
    private Boolean active;

    @Column(name = "CreatedAt")
    private Date createdAt;

    @Column(name = "UpdatedAt")
    private Date updatedAt;
}
