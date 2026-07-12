package com.TransitOps.rest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.access.prepost.PreAuthorize;

import com.TransitOps.dto.ResponseDTO;
import com.TransitOps.dto.UserDTO;
import com.TransitOps.service.UserService;

@CrossOrigin(origins = "*", allowedHeaders = "*")
@RestController
@RequestMapping("/api/user")
public class UserController {

    @Autowired
    private UserService userService;

    @PreAuthorize("hasRole('MANAGER')")
    @PostMapping("/create")
    public ResponseEntity<ResponseDTO> createUser(@RequestBody UserDTO userDTO) {
        System.out.println("Entering into UserController -> createUser");
        ResponseDTO responseDTO = new ResponseDTO();

        try {
            userService.createUser(userDTO);
            responseDTO.setServiceResult("User created successfully");
            responseDTO.setMessage("User created successfully");
            responseDTO.setSuccess(true);
        } catch (Exception e) {
            e.printStackTrace();
            responseDTO.setServiceResult(e.getMessage());
            responseDTO.setMessage("Failed to create user");
            responseDTO.setSuccess(false);
            return ResponseEntity.internalServerError().body(responseDTO);
        }

        System.out.println("Exiting from UserController -> createUser");
        return ResponseEntity.ok(responseDTO);
    }
}
