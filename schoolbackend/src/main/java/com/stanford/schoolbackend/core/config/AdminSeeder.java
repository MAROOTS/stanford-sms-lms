package com.stanford.schoolbackend.core.config;

import com.stanford.schoolbackend.core.enums.UserRole;
import com.stanford.schoolbackend.core.user.User;
import com.stanford.schoolbackend.core.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.jspecify.annotations.NonNull;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
@RequiredArgsConstructor
public class AdminSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String @NonNull ... args) {
        if (userRepository.findByEmail("admin@admin.com").isEmpty()) {
            User admin = User.builder()
                    .firstName("Admin")
                    .lastName("User")
                    .email("admin@admin.com")
                    .password(passwordEncoder.encode("ADMIN123"))
                    .role(UserRole.ADMIN)
                    .build();
            userRepository.save(admin);
        }
    }
}