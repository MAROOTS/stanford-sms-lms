package com.stanford.schoolbackend.core.user;

import com.stanford.schoolbackend.core.enums.UserRole;
import com.stanford.schoolbackend.core.exception.ResourceNotFoundException;
import com.stanford.schoolbackend.core.school.School;
import com.stanford.schoolbackend.core.school.SchoolRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Year;

@Service
@RequiredArgsConstructor
public class UsernameGeneratorService {

    private final UsernameSequenceRepository usernameSequenceRepository;
    private final SchoolRepository schoolRepository;
    public synchronized String generateUsername(UserRole role, Long schoolId) {
        School school = schoolRepository.findById(schoolId)
                .orElseThrow(() -> new ResourceNotFoundException("School not found"));
        String prefix = prefixFor(role);
        String sequenceKey = prefix + "-" + Year.now().getValue();

        UsernameSequence sequence = usernameSequenceRepository.findBySchoolIdAndSequenceKey(schoolId, sequenceKey)
                .orElseGet(() -> UsernameSequence.builder().school(school).sequenceKey(sequenceKey).lastValue(0).build());

        int next = sequence.getLastValue() + 1;
        sequence.setLastValue(next);
        usernameSequenceRepository.save(sequence);

        return String.format("%s-%03d", sequenceKey, next); // e.g. ADM-2026-001
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