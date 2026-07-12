package com.TransitOps.service;

import java.util.Date;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.TransitOps.dao.DriverDAO;
import com.TransitOps.dao.UserDAO;
import com.TransitOps.dto.UserDTO;
import com.TransitOps.entity.Driver;
import com.TransitOps.entity.User;
import com.TransitOps.util.Role;

@Service
public class UserService {

    @Autowired
    private UserDAO userDAO;

    @Autowired
    private DriverDAO driverDAO;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AuthService authService;

    public void createUser(UserDTO userDTO) throws Exception {
        if (userDAO.existsByEmail(userDTO.getEmail())) {
            throw new Exception("Email already exists!");
        }

        User user = new User();
        user.setName(userDTO.getName());
        user.setEmail(userDTO.getEmail());
        user.setPassword(passwordEncoder.encode(userDTO.getPassword()));
        user.setPhoneNo(userDTO.getPhoneNo());
        user.setRole(userDTO.getRole());
        user.setIsVerified(false);
        user.setActive(true);
        user.setCreatedAt(new Date());
        user.setModifiedAt(new Date());

        user = userDAO.save(user);

        if (Role.ROLE_DRIVER.equals(userDTO.getRole())) {
            Driver driver = new Driver();
            driver.setUser(user);
            driver.setLicenseNo(userDTO.getLicenseNo());
            driver.setLicenseExpiryDate(userDTO.getLicenseExpiryDate());
            driver.setStatus(com.TransitOps.util.DriverStatus.AVAILABLE);
            driver.setSafetyScore(100.0); // Default safety score
            driver.setActive(true);
            driver.setCreatedAt(new Date());
            driver.setUpdatedAt(new Date());
            driverDAO.save(driver);
        }

        authService.sendVerificationMail(user.getEmail());
    }

    public java.util.List<UserDTO> getUsers(String roleStr) {
        java.util.List<User> users;
        if (roleStr != null && !roleStr.isEmpty()) {
            com.TransitOps.util.Role role = com.TransitOps.util.Role.valueOf(roleStr.toUpperCase());
            users = userDAO.findByRoleAndActive(role, true);
        } else {
            users = userDAO.findByActive(true);
        }
        return users.stream().map(u -> {
            UserDTO dto = new UserDTO();
            org.springframework.beans.BeanUtils.copyProperties(u, dto);
            dto.setPassword(null); // Don't expose password
            // Populate driver-specific fields if user is a driver
            if (com.TransitOps.util.Role.ROLE_DRIVER.equals(u.getRole())) {
                Driver driver = driverDAO.findByUserAndActive(u, true);
                if (driver != null) {
                    dto.setDriverStatus(driver.getStatus());
                    dto.setSafetyScore(driver.getSafetyScore());
                    dto.setDriverID(driver.getDriverID());
                }
            }
            return dto;
        }).collect(java.util.stream.Collectors.toList());
    }

    public void updateDriverStatus(Long id, String statusStr) throws Exception {
        Driver driver = driverDAO.findByDriverIDAndActive(id, true);
        if (driver == null) throw new com.TransitOps.exception.ResourceNotFoundExcepiton("Driver not found!");
        driver.setStatus(com.TransitOps.util.DriverStatus.valueOf(statusStr.toUpperCase()));
        driver.setUpdatedAt(new Date());
        driverDAO.save(driver);
    }
}
