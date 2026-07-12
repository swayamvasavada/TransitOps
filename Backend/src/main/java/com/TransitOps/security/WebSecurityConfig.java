package com.TransitOps.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;

@Configuration
@EnableMethodSecurity
public class WebSecurityConfig {
        @Autowired
        private AuthFilter authFilter;

        @Bean
        public SecurityFilterChain securityFilterChain(HttpSecurity httpSecurity) throws Exception {
                return httpSecurity
                                .csrf(csrf -> csrf.disable())
                                .sessionManagement(
                                                sessionConfig -> sessionConfig
                                                                .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                                .authorizeHttpRequests(
                                                auth -> auth.requestMatchers("/api/auth/**").permitAll()
                                                                .requestMatchers("/api/vehicle/**")
                                                                .authenticated()
                                                                .requestMatchers("/api/trip/**")
                                                                .hasAnyRole("MANAGER", "DISPATCHER")
                                                                .requestMatchers("/api/log/**")
                                                                .authenticated()
                                                                .requestMatchers("/api/maintenance/**")
                                                                .hasAnyRole("MANAGER", "DISPATCHER")
                                                                .requestMatchers("/api/analytics/**")
                                                                .hasRole("MANAGER")
                                                                .anyRequest().permitAll())
                                .addFilterBefore(authFilter, UsernamePasswordAuthenticationFilter.class).build();
        }
}