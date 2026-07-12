-- ============================================================
-- TransitOps - Full Database Schema
-- Run this script in order (foreign key dependencies respected)
-- ============================================================

-- 1. USERS
CREATE TABLE IF NOT EXISTS USERS (
    UserID     BIGINT AUTO_INCREMENT PRIMARY KEY,
    Email      VARCHAR(255) NOT NULL UNIQUE,
    Name       VARCHAR(255) NOT NULL UNIQUE,
    Password   VARCHAR(255),
    PhoneNo    VARCHAR(50),
    Role       VARCHAR(50),        -- ROLE_MANAGER | ROLE_DISPATCHER | ROLE_DRIVER
    IsVerified TINYINT(1) DEFAULT 0,
    Active     TINYINT(1) DEFAULT 1,
    CreatedAt  DATETIME,
    ModifiedAt DATETIME
);

-- 2. DRIVERS  (depends on USERS)
CREATE TABLE IF NOT EXISTS DRIVERS (
    DriverID          BIGINT AUTO_INCREMENT PRIMARY KEY,
    UserID            BIGINT NOT NULL,
    Status            VARCHAR(50) DEFAULT 'AVAILABLE',   -- AVAILABLE | ON_TRIP | OFF_DUTY | SUSPENDED
    SafetyScore       DOUBLE DEFAULT 100.0,
    LicenseNo         VARCHAR(255),
    LicenseExpiryDate DATE,
    Active            TINYINT(1) DEFAULT 1,
    CreatedAt         DATETIME,
    UpdatedAt         DATETIME,

    FOREIGN KEY (UserID) REFERENCES USERS(UserID)
);

-- 3. VEHICLES
CREATE TABLE IF NOT EXISTS VEHICLES (
    VehicleID           BIGINT AUTO_INCREMENT PRIMARY KEY,
    RegistrationNumber  VARCHAR(255) NOT NULL UNIQUE,
    Name                VARCHAR(255),
    Type                VARCHAR(255),
    MaxLoadCapacity     DOUBLE,
    Odometer            DOUBLE DEFAULT 0.0,
    AcquisitionCost     DOUBLE,
    Status              VARCHAR(50) DEFAULT 'AVAILABLE', -- AVAILABLE | ON_TRIP | IN_SHOP | RETIRED
    Active              TINYINT(1) DEFAULT 1,
    CreatedAt           DATETIME,
    UpdatedAt           DATETIME
);

-- 4. TRIPS  (depends on VEHICLES, DRIVERS)
CREATE TABLE IF NOT EXISTS TRIPS (
    TripID            BIGINT AUTO_INCREMENT PRIMARY KEY,
    Source            VARCHAR(255),
    Destination       VARCHAR(255),
    VehicleID         BIGINT,
    DriverID          BIGINT,
    CargoWeight       DOUBLE,
    PlannedDistance   DOUBLE,
    StartingOdometer  DOUBLE,
    FinalOdometer     DOUBLE,
    FuelConsumed      DOUBLE,
    Status            VARCHAR(50) DEFAULT 'DRAFT',  -- DRAFT | DISPATCHED | COMPLETED | CANCELLED
    Active            TINYINT(1) DEFAULT 1,
    CreatedAt         DATETIME,
    UpdatedAt         DATETIME,

    FOREIGN KEY (VehicleID) REFERENCES VEHICLES(VehicleID),
    FOREIGN KEY (DriverID)  REFERENCES DRIVERS(DriverID)
);

-- 5. EXPENSE_LOGS  (depends on VEHICLES, TRIPS)
--    Central expense ledger: FUEL | MAINTENANCE | TOLL | OTHER
CREATE TABLE IF NOT EXISTS EXPENSE_LOGS (
    ExpenseLogID BIGINT AUTO_INCREMENT PRIMARY KEY,
    VehicleID    BIGINT NOT NULL,
    TripID       BIGINT NULL,
    Category     VARCHAR(50),        -- FUEL | MAINTENANCE | TOLL | OTHER
    Amount       DOUBLE,
    Description  VARCHAR(255),
    Notes        TEXT,
    Active       TINYINT(1) DEFAULT 1,
    CreatedAt    DATETIME,

    FOREIGN KEY (VehicleID) REFERENCES VEHICLES(VehicleID),
    FOREIGN KEY (TripID)    REFERENCES TRIPS(TripID)
);

-- 6. FUEL_LOGS  (depends on EXPENSE_LOGS, VEHICLES, TRIPS)
--    Stores fuel-specific detail; cost lives in EXPENSE_LOGS
CREATE TABLE IF NOT EXISTS FUEL_LOGS (
    FuelLogID       BIGINT AUTO_INCREMENT PRIMARY KEY,
    ExpenseID       BIGINT NOT NULL,
    VehicleID       BIGINT NOT NULL,
    TripID          BIGINT NULL,
    LitresFilled    DOUBLE,
    OdometerReading DOUBLE,
    FuelStation     VARCHAR(255),
    Notes           TEXT,
    Active          TINYINT(1) DEFAULT 1,
    CreatedAt       DATETIME,

    FOREIGN KEY (ExpenseID)  REFERENCES EXPENSE_LOGS(ExpenseLogID),
    FOREIGN KEY (VehicleID)  REFERENCES VEHICLES(VehicleID),
    FOREIGN KEY (TripID)     REFERENCES TRIPS(TripID)
);

-- 7. MAINTENANCE  (depends on EXPENSE_LOGS, VEHICLES)
--    Stores maintenance detail; cost lives in EXPENSE_LOGS
CREATE TABLE IF NOT EXISTS MAINTENANCE (
    MaintenanceID   BIGINT AUTO_INCREMENT PRIMARY KEY,
    VehicleID       BIGINT NOT NULL,
    ExpenseID       BIGINT NOT NULL,
    ServiceType     VARCHAR(255),
    Notes           TEXT,
    MaintenanceDate DATETIME,
    Status          VARCHAR(50) DEFAULT 'IN_SHOP',  -- IN_SHOP | COMPLETED
    Active          TINYINT(1) DEFAULT 1,
    CreatedAt       DATETIME,
    UpdatedAt       DATETIME,

    FOREIGN KEY (VehicleID)  REFERENCES VEHICLES(VehicleID),
    FOREIGN KEY (ExpenseID)  REFERENCES EXPENSE_LOGS(ExpenseLogID)
);
