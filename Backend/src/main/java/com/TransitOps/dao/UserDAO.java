package com.TransitOps.dao;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.TransitOps.entity.User;

@Repository
public interface UserDAO extends JpaRepository<User, Long> {
    User findByEmailAndActive(String email, Boolean active);
    java.util.List<User> findByRoleAndActive(com.TransitOps.util.Role role, Boolean active);
    java.util.List<User> findByActive(Boolean active);

    boolean existsByEmail(String email);

	User findByUserIDAndActive(Long driverID, boolean active);
}
