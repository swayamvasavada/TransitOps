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
import com.TransitOps.service.AuthService;

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
            driver.setIsAvailable(true);
            driver.setActive(true);
            driver.setCreatedAt(new Date());
            driver.setUpdatedAt(new Date());
            driverDAO.save(driver);
        }

        authService.sendVerificationMail(user.getEmail());
    }
}
