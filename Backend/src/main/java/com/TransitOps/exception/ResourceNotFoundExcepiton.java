package com.TransitOps.exception;

public class ResourceNotFoundExcepiton extends RuntimeException {

    private static final long serialVersionUID = 1L;

    public ResourceNotFoundExcepiton(String errorMessage) {
        super(errorMessage);
    }
}