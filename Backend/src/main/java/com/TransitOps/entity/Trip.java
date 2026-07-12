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
import com.TransitOps.util.TripStatus;

@Entity
@Table(name = "TRIPS")
@Getter
@Setter
@NoArgsConstructor
public class Trip {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "TripID")
    private Long tripID;

    @Column(name = "Source")
    private String source;

    @Column(name = "Destination")
    private String destination;

    @ManyToOne
    @JoinColumn(name = "VehicleID")
    private Vehicle vehicle;

    @ManyToOne
    @JoinColumn(name = "DriverID")
    private Driver driver;

    @Column(name = "CargoWeight")
    private Double cargoWeight;

    @Column(name = "PlannedDistance")
    private Double plannedDistance;

    @Column(name = "StartingOdometer")
    private Double startingOdometer;

    @Column(name = "FinalOdometer")
    private Double finalOdometer;

    @Column(name = "FuelConsumed")
    private Double fuelConsumed;

    @Enumerated(EnumType.STRING)
    @Column(name = "Status")
    private TripStatus status;

    @Column(name = "Active")
    private Boolean active;

    @Column(name = "CreatedAt")
    private Date createdAt;

    @Column(name = "UpdatedAt")
    private Date updatedAt;
}
