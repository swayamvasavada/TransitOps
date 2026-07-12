package com.TransitOps.util;

import java.security.Key;
import java.util.Date;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;

@Component
public class JwtUtil {

    private Key JWT_KEY;

    public JwtUtil(@Value("${jwt.secret}") String JWT_SECRET) {
        this.JWT_KEY = Keys.hmacShaKeyFor(JWT_SECRET.getBytes());
    }

    public String generateToken(String email, Long expiresIn) {
        return Jwts.builder().setSubject(email).setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + expiresIn))
                .signWith(JWT_KEY, SignatureAlgorithm.HS256).compact();
    }

    public String verifyToken(String token) {
        return Jwts.parserBuilder().setSigningKey(JWT_KEY).build().parseClaimsJws(token).getBody().getSubject();
    }
}