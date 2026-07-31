package com.stanford.schoolbackend.core.exception;

public class IncorrectPasswordException extends RuntimeException {
    public IncorrectPasswordException(String message) { super(message); }
}