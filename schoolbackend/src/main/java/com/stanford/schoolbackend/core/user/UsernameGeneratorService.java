package com.stanford.schoolbackend.core.user;

import com.stanford.schoolbackend.core.enums.UserRole;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Year;

@Service
@RequiredArgsConstructor
public class UsernameGeneratorService {

    private final UsernameSequenceRepository usernameSequenceRepository;

    public synchronized String generateUsername(UserRole role) {
        String prefix = prefixFor(role);
        String sequenceKey = prefix + "-" + Year.now().getValue();

        UsernameSequence sequence = usernameSequenceRepository.findBySequenceKey(sequenceKey)
                .orElseGet(() -> UsernameSequence.builder().sequenceKey(sequenceKey).lastValue(0).build());

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