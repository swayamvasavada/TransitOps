package com.TransitOps.service;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringTemplateEngine;

import com.TransitOps.dao.UserDAO;
import com.TransitOps.dto.LoginDTO;
import com.TransitOps.entity.User;
import com.TransitOps.exception.AuthenticationException;
import com.TransitOps.exception.ResourceNotFoundExcepiton;
import com.TransitOps.util.EmailUtil;
import com.TransitOps.util.JwtUtil;

@Service
public class AuthService {

    @Autowired
    private UserDAO userDAO;

    @Autowired
    private SpringTemplateEngine templateEngine;

    @Autowired
    private EmailUtil emailUtil;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @Value("${frontend-url}")
    String frontendBaseUrl;

    public void sendVerificationMail(String email) throws Exception {
        User user = userDAO.findByEmailAndActive(email, true);
        if (user == null)
            throw new ResourceNotFoundExcepiton("User not found with given email");

        String verificationToken = jwtUtil.generateToken(email, Long.valueOf(15 * 60 * 1000));
        String verificationUrl = new String("/user/verify/").concat(verificationToken);

        Context context = new Context();
        context.setVariable("name", user.getUsername());
        context.setVariable("verificationUrl", frontendBaseUrl.concat(verificationUrl));

        String htmlContent = templateEngine.process("transitops-welcome", context);
        emailUtil.sendHtmlEmail(email, "Welcome to Our Platform", htmlContent);
    }

    public LoginDTO login(LoginDTO loginDTO) {
        User user = userDAO.findByEmailAndActive(loginDTO.getEmail(), true);

        if (user == null)
            throw new ResourceNotFoundExcepiton("User not found with given email");

        if (loginDTO.getRole() == null || !loginDTO.getRole().equals(user.getRole().name())) {
            throw new AuthenticationException("User not registered with this role");
        }
        
        if (!user.getIsVerified()) {
            loginDTO.setPassword(null);
            loginDTO.setIsVerified(false);
            return loginDTO;
        }

        boolean isPasswordMatch = passwordEncoder.matches(loginDTO.getPassword(), user.getPassword());
        if (!isPasswordMatch)
            throw new AuthenticationException("Entered password is incorrect!");

        String token = jwtUtil.generateToken(user.getEmail(), Long.valueOf(24 * 60 * 60 * 1000));
        loginDTO.setPassword(null);
        loginDTO.setName(user.getName());
        loginDTO.setRole(user.getRole().name());
        loginDTO.setToken(token);
        loginDTO.setIsVerified(true);
        return loginDTO;
    }

    public LoginDTO verifyUser(String token) {
        String email = jwtUtil.verifyToken(token);
        User user = userDAO.findByEmailAndActive(email, true);
        if (user == null)
            throw new ResourceNotFoundExcepiton("User not found with given email");

        if (!user.getIsVerified()) {
            user.setIsVerified(true);
            userDAO.save(user);
        }

        LoginDTO loginDTO = new LoginDTO();
        String authToken = jwtUtil.generateToken(user.getEmail(), Long.valueOf(24 * 60 * 60 * 1000));
        BeanUtils.copyProperties(user, loginDTO);
        loginDTO.setPassword(null);
        loginDTO.setToken(authToken);
        return loginDTO;
    }

    public void requestPasswordReset(String email) throws Exception {
		User user = userDAO.findByEmailAndActive(email, true);
		if (user == null)
			throw new ResourceNotFoundExcepiton("User not found with given email");

		String resetToken = jwtUtil.generateToken(email, Long.valueOf(15 * 60 * 1000));
        String resetPasswordUrl = frontendBaseUrl.concat("/reset-password/")
                .concat(URLEncoder.encode(resetToken, StandardCharsets.UTF_8));
        emailUtil.sendPasswordResetEmail(email, user.getName(), resetPasswordUrl); // Triggered inside async block
	}

    public void resetPassword(String token, String newPassword) throws Exception {
        String email = jwtUtil.verifyToken(token);
        User user = userDAO.findByEmailAndActive(email, true);
        if (user == null)
            throw new ResourceNotFoundExcepiton("User not found with given email");

        user.setPassword(passwordEncoder.encode(newPassword));
        userDAO.save(user);
    }
}
