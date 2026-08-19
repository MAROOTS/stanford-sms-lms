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
public class PlatformAdminSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final SecurePasswordGenerator securePasswordGenerator;

    @Value("${app.platform-admin.email}")
    private String platformAdminEmail;

    @Value("${app.platform-admin.password}")
    private String platformAdminPassword;

    @Value("${app.platform-admin.first-name}")
    private String firstName;

    @Value("${app.platform-admin.last-name}")
    private String lastName;

    @Override
    public void run(String... args) {
        if (userRepository.existsByRole(UserRole.PLATFORM_ADMIN)) return;

        boolean generated = platformAdminPassword == null || platformAdminPassword.isBlank();
        String passwordToUse = generated ? securePasswordGenerator.generate() : platformAdminPassword;
        String username = platformAdminEmail.contains("@")
                ? platformAdminEmail.substring(0, platformAdminEmail.indexOf("@"))
                : platformAdminEmail;

        User platformAdmin = User.builder()
                .firstName(firstName)
                .lastName(lastName)
                .email(platformAdminEmail)
                .username(username)
                .password(passwordEncoder.encode(passwordToUse))
                .role(UserRole.PLATFORM_ADMIN)
                .school(null)
                .build();
        userRepository.save(platformAdmin);

        if (generated) {
            log.warn("....");
            log.warn("No PLATFORM_ADMIN_PASSWORD was set — a random password was generated.");
            log.warn("Email:    {}", platformAdminEmail);
            log.warn("Password: {}", passwordToUse);
            log.warn("Log in now and store this securely — it will not be shown again.");
            log.warn("......");
        }
    }
}