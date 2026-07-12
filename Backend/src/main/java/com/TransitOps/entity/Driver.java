package com.TransitOps.entity;

import java.util.Date;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "DRIVERS")
@Getter
@Setter
@NoArgsConstructor
public class Driver {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "DriverID")
    private Long driverID;

    @JoinColumn(name = "UserID")
    private User user;

    @Column(name = "IsAvailable")
    private Boolean isAvailable;

    @Column(name = "LicenseNo")
    private String licenseNo;

    @Column(name = "LicenseExpiryDate")
    private Date licenseExpiryDate;

    @Column(name = "Active")
    private Boolean active;

    @Column(name = "CreatedAt")
    private Date createdAt;

    @Column(name = "UpdatedAt")
    private Date updatedAt;
}
