package com.stanford.schoolbackend.core.user;

import com.stanford.schoolbackend.core.enums.UserRole;
import com.stanford.schoolbackend.core.exception.ResourceNotFoundException;
import com.stanford.schoolbackend.core.school.School;
import com.stanford.schoolbackend.core.school.SchoolRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Year;
import java.util.concurrent.ThreadLocalRandom;

@Service
@RequiredArgsConstructor
public class UsernameGeneratorService {

    private final SchoolRepository schoolRepository;
    private final UserRepository userRepository;

    public synchronized String generateUsername(UserRole role, Long schoolId) {
        School school = schoolRepository.findById(schoolId)
                .orElseThrow(() -> new ResourceNotFoundException("School not found"));

        String prefix = prefixFor(role);
        int year = Year.now().getValue();

        for (int attempt = 0; attempt < 25; attempt++) {
            int code = ThreadLocalRandom.current().nextInt(1000, 10000);

            String username = String.format(
                    "%s-%s-%d-%04d",
                    school.getSlug(),
                    prefix,
                    year,
                    code
            );

            if (!userRepository.existsByUsername(username)) {
                return username;
            }
        }

        throw new IllegalStateException(
                "Could not generate a unique username — try again"
        );
    }

    public String admissionNumberFromUsername(String username) {
        // alliance-ADM-2026-6487 -> ADM-2026-6487
        int firstDash = username.indexOf('-');

        if (firstDash < 0) {
            return username;
        }

        return username.substring(firstDash + 1);
    }

    private String prefixFor(UserRole role) {
        return switch (role) {
            case STUDENT -> "ADM";
            case PARENT -> "PAR";
            case TEACHER, LIBRARIAN, ACCOUNTANT, ADMIN -> "EMP";
            case PLATFORM_ADMIN -> "PTM";
        };
    }
}