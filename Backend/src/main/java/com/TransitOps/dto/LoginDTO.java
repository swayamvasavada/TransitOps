package com.TransitOps.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoginDTO {
    private String name;
    private String email;
    private String password;
    private String token;
    private String role;
    private Boolean isVerified;
}
