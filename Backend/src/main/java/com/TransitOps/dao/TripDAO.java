package com.TransitOps.dao;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.TransitOps.entity.Trip;
import java.util.List;

@Repository
public interface TripDAO extends JpaRepository<Trip, Long> {
    List<Trip> findByStatus(com.TransitOps.util.TripStatus status);
}
