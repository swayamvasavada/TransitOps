package com.TransitOps.rest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.TransitOps.dto.LoginDTO;
import com.TransitOps.dto.ResponseDTO;
import com.TransitOps.exception.AuthenticationException;
import com.TransitOps.exception.ResourceNotFoundExcepiton;
import com.TransitOps.service.AuthService;

@CrossOrigin(origins = "*", allowedHeaders = "*")
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;
    
    @GetMapping(value = "/verify")
    public ResponseEntity<ResponseDTO> verifyEmail(@RequestParam(required = true) String email) {
        System.out.println("Entering into AuthController -> verifyEmail");

        ResponseDTO responseDTO = new ResponseDTO();

        try {
            authService.sendVerificationMail(email);
            responseDTO.setServiceResult("Email sent successfully");
            responseDTO.setMessage("Email sent successfully");
            responseDTO.setSuccess(1);
        } catch (ResourceNotFoundExcepiton e) {
            e.printStackTrace();
            responseDTO.setServiceResult(e.getMessage());
            responseDTO.setMessage(e.getMessage());
            responseDTO.setSuccess(0);
            return new ResponseEntity<>(responseDTO, HttpStatusCode.valueOf(404));
        } catch (Exception e) {
            e.printStackTrace();
            responseDTO.setServiceResult("Failed to create verification link");
            responseDTO.setMessage("Failed to create verification link");
            responseDTO.setSuccess(0);

            return new ResponseEntity<>(responseDTO, HttpStatusCode.valueOf(500));
        }

        System.out.println("Exiting from AuthController -> verifyEmail");
        return ResponseEntity.ok(responseDTO);
    }

    @PostMapping(value = "/login")
    public ResponseEntity<ResponseDTO> login(@RequestBody LoginDTO loginDTO) {
        System.out.println("Entering into AuthController -> login");

        ResponseDTO responseDTO = new ResponseDTO();

        try {
            loginDTO = authService.login(loginDTO);
            responseDTO.setServiceResult(loginDTO);
            
            if (loginDTO.getIsVerified()) {
                responseDTO.setMessage("Signed in successfully");
                responseDTO.setSuccess(1);
            } else {
                responseDTO.setMessage("Email is not verified");
                responseDTO.setSuccess(0);
            }
        } catch (ResourceNotFoundExcepiton e) {
            e.printStackTrace();
            responseDTO.setServiceResult(e.getMessage());
            responseDTO.setMessage(e.getMessage());
            responseDTO.setSuccess(0);
            return new ResponseEntity<>(responseDTO, HttpStatusCode.valueOf(404));
        } catch (AuthenticationException e) {
            e.printStackTrace();
            responseDTO.setServiceResult(e.getMessage());
            responseDTO.setMessage(e.getMessage());
            responseDTO.setSuccess(0);
            return new ResponseEntity<>(responseDTO, HttpStatusCode.valueOf(401));
        } catch (Exception e) {
            e.printStackTrace();
            responseDTO.setServiceResult("Failed to login");
            responseDTO.setMessage("Failed to login");
            responseDTO.setSuccess(0);

            return new ResponseEntity<>(responseDTO, HttpStatusCode.valueOf(500));
        }

        System.out.println("Exiting from AuthController -> login");
        return ResponseEntity.ok(responseDTO);
    }

    @PostMapping(value = "/verify")
    public ResponseEntity<ResponseDTO> verifyUser(@RequestParam(required = true) String token) {
        System.out.println("Entering into AuthController -> verifyUser");

        ResponseDTO responseDTO = new ResponseDTO();

        try {
            authService.verifyUser(token);
            responseDTO.setServiceResult("User verified successfully");
            responseDTO.setMessage("User verified successfully");
            responseDTO.setSuccess(1);
        } catch (ResourceNotFoundExcepiton e) {
            e.printStackTrace();
            responseDTO.setServiceResult(e.getMessage());
            responseDTO.setMessage(e.getMessage());
            responseDTO.setSuccess(0);
            return new ResponseEntity<>(responseDTO, HttpStatusCode.valueOf(404));
        } catch (Exception e) {
            e.printStackTrace();
            responseDTO.setServiceResult("Failed to verify user");
            responseDTO.setMessage("Failed to verify user");
            responseDTO.setSuccess(0);

            return new ResponseEntity<>(responseDTO, HttpStatusCode.valueOf(500));
        }

        System.out.println("Exiting from AuthController -> verifyEmail");
        return ResponseEntity.ok(responseDTO);
    }
}