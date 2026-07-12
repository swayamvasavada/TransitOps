package com.TransitOps.dao;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.TransitOps.entity.Driver;
import com.TransitOps.entity.User;

@Repository
public interface DriverDAO extends JpaRepository<Driver, Long> {
    Driver findByUserAndActive(User user, Boolean active);
    Driver findByDriverIDAndActive(Long driverID, Boolean active);
}
