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
            responseDTO.setSuccess(true);
        } catch (ResourceNotFoundExcepiton e) {
            e.printStackTrace();
            responseDTO.setServiceResult(e.getMessage());
            responseDTO.setMessage(e.getMessage());
            responseDTO.setSuccess(false);
            return new ResponseEntity<>(responseDTO, HttpStatusCode.valueOf(404));
        } catch (Exception e) {
            e.printStackTrace();
            responseDTO.setServiceResult("Failed to create verification link");
            responseDTO.setMessage("Failed to create verification link");
            responseDTO.setSuccess(false);

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
                responseDTO.setSuccess(true);
            } else {
                responseDTO.setMessage("Email is not verified");
                responseDTO.setSuccess(false);
            }
        } catch (ResourceNotFoundExcepiton e) {
            e.printStackTrace();
            responseDTO.setServiceResult(e.getMessage());
            responseDTO.setMessage(e.getMessage());
            responseDTO.setSuccess(false);
            return new ResponseEntity<>(responseDTO, HttpStatusCode.valueOf(404));
        } catch (AuthenticationException e) {
            e.printStackTrace();
            responseDTO.setServiceResult(e.getMessage());
            responseDTO.setMessage(e.getMessage());
            responseDTO.setSuccess(false);
            return new ResponseEntity<>(responseDTO, HttpStatusCode.valueOf(401));
        } catch (Exception e) {
            e.printStackTrace();
            responseDTO.setServiceResult("Failed to login");
            responseDTO.setMessage("Failed to login");
            responseDTO.setSuccess(false);

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
            responseDTO.setSuccess(true);
        } catch (ResourceNotFoundExcepiton e) {
            e.printStackTrace();
            responseDTO.setServiceResult(e.getMessage());
            responseDTO.setMessage(e.getMessage());
            responseDTO.setSuccess(false);
            return new ResponseEntity<>(responseDTO, HttpStatusCode.valueOf(404));
        } catch (Exception e) {
            e.printStackTrace();
            responseDTO.setServiceResult("Failed to verify user");
            responseDTO.setMessage("Failed to verify user");
            responseDTO.setSuccess(false);

            return new ResponseEntity<>(responseDTO, HttpStatusCode.valueOf(500));
        }

        System.out.println("Exiting from AuthController -> verifyEmail");
        return ResponseEntity.ok(responseDTO);
    }

    @GetMapping("/request-reset-password")
	public ResponseEntity<ResponseDTO> requestResetPassword(@RequestParam(required = true) String email) {
		System.out.println("Entering into AuthController -> requestResetPassword");

		ResponseDTO responseDTO = new ResponseDTO();

		try {
			authService.requestPasswordReset(email);
			responseDTO.setServiceResult("Password reset link sent successfully");
			responseDTO.setMessage("Password reset link sent successfully");
			responseDTO.setSuccess(Boolean.TRUE);
		} catch (ResourceNotFoundExcepiton e) {
			e.printStackTrace();
			responseDTO.setServiceResult(e.getMessage());
			responseDTO.setMessage(e.getMessage());
			responseDTO.setSuccess(Boolean.FALSE);
			return new ResponseEntity<>(responseDTO, HttpStatusCode.valueOf(404));
		} catch (Exception e) {
			e.printStackTrace();
			responseDTO.setServiceResult("Failed to send password reset link");
			responseDTO.setMessage("Failed to send password reset link");
			responseDTO.setSuccess(Boolean.FALSE);

			return new ResponseEntity<>(responseDTO, HttpStatusCode.valueOf(500));
		}

		System.out.println("Exiting from AuthController -> requestResetPassword");
		return ResponseEntity.ok(responseDTO);
	}

	@PostMapping("/reset-password")
	public ResponseEntity<ResponseDTO> resetPassword(@RequestParam(required = true) String token, @RequestParam(required = true) String newPassword) {
		System.out.println("Entering into AuthController -> resetPassword");

		ResponseDTO responseDTO = new ResponseDTO();

		try {
			authService.resetPassword(token, newPassword);
			responseDTO.setServiceResult("Password reset successfully");
			responseDTO.setMessage("Password reset successfully");
			responseDTO.setSuccess(Boolean.TRUE);
        } catch (ResourceNotFoundExcepiton e) {
			e.printStackTrace();
			responseDTO.setServiceResult(e.getMessage());
			responseDTO.setMessage(e.getMessage());
			responseDTO.setSuccess(Boolean.FALSE);
			return new ResponseEntity<>(responseDTO, HttpStatusCode.valueOf(404));
		} catch (Exception e) {
			e.printStackTrace();
			responseDTO.setServiceResult("Failed to reset password");
			responseDTO.setMessage("Failed to reset password");
			responseDTO.setSuccess(Boolean.FALSE);

			return new ResponseEntity<>(responseDTO, HttpStatusCode.valueOf(500));
		}

		System.out.println("Exiting from AuthController -> resetPassword");
		return ResponseEntity.ok(responseDTO);
	}
}
