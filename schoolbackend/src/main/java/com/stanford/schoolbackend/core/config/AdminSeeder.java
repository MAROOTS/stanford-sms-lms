package com.stanford.schoolbackend.core.config;

import com.stanford.schoolbackend.core.enums.UserRole;
import com.stanford.schoolbackend.core.security.SecurePasswordGenerator;
import com.stanford.schoolbackend.core.user.User;
import com.stanford.schoolbackend.core.user.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;



@Slf4j
@Configuration
@RequiredArgsConstructor
public class AdminSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final SecurePasswordGenerator securePasswordGenerator;


    @Value("${app.admin.email}")
    private String adminEmail;

    @Value("${app.admin.password}")
    private String adminPassword;

    @Value("${app.admin.first-name}")
    private String adminFirstName;

    @Value("${app.admin.last-name}")
    private String adminLastName;

    @Override
    public void run(String... args) {
        if (userRepository.existsByRole(UserRole.ADMIN)) return;

        boolean generated = adminPassword == null || adminPassword.isBlank();
        String passwordToUse = generated ? securePasswordGenerator.generate() : adminPassword;
        String username = adminEmail.contains("@") ? adminEmail.substring(0, adminEmail.indexOf("@")) : adminEmail;
        User admin = User.builder()
                .firstName(adminFirstName)
                .lastName(adminLastName)
                .email(adminEmail)
                .username(username)
                .password(passwordEncoder.encode(passwordToUse))
                .role(UserRole.ADMIN)
                .build();
        userRepository.save(admin);

        if (generated) {
            log.warn(".........");
            log.warn("No ADMIN_PASSWORD was set, a random admin password was generated.");
            log.warn("Email:    {}", adminEmail);
            log.warn("Password: {}", passwordToUse);
            log.warn("Log in now and store this securely,it will not be shown again.");
            log.warn("......");
        }
    }


}