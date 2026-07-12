package com.TransitOps.exception;

public class AuthenticationException extends RuntimeException {

    private static final long serialVersionUID = 1L;

    public AuthenticationException(String errorMessage) {
        super(errorMessage);
    }
}