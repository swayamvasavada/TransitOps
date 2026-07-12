package com.TransitOps.dao;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.TransitOps.entity.Trip;
import java.util.List;

@Repository
public interface TripDAO extends JpaRepository<Trip, Long> {
    List<Trip> findByStatusAndActive(com.TransitOps.util.TripStatus status, Boolean active);
    List<Trip> findByActive(Boolean active);
    java.util.Optional<Trip> findByTripIDAndActive(Long tripID, Boolean active);
}
