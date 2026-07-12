package com.stanford.schoolbackend.core.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

import java.util.ArrayList;
import java.util.List;

public class PasswordValidator implements ConstraintValidator<ValidPassword, String> {

    @Override
    public void initialize(ValidPassword constraintAnnotation) {
    }

    @Override
    public boolean isValid(String password, ConstraintValidatorContext context) {
        if (password == null || password.isBlank()) {
            context.disableDefaultConstraintViolation();
            context.buildConstraintViolationWithTemplate("Password is required")
                    .addConstraintViolation();
            return false;
        }

        List<String> violations = new ArrayList<>();

        if (password.length() < 8) {
            violations.add("at least 8 characters");
        }
        if (!password.matches(".*[A-Z].*")) {
            violations.add("one uppercase letter");
        }
        if (!password.matches(".*[a-z].*")) {
            violations.add("one lowercase letter");
        }
        if (!password.matches(".*[0-9].*")) {
            violations.add("one digit");
        }
        if (!password.matches(".*[!@#$%^&*()_+\\-=\\[\\]{};':\"\\\\|,.<>\\/?`~].*")) {
            violations.add("one special character");
        }

        if (violations.isEmpty()) {
            return true;
        }

        context.disableDefaultConstraintViolation();
        String message = "Password must contain " + String.join(", ", violations);
        context.buildConstraintViolationWithTemplate(message)
                .addConstraintViolation();
        return false;
    }
}
