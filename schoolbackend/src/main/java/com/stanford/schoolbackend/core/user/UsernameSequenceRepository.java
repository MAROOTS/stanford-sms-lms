package com.stanford.schoolbackend.core.user;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UsernameSequenceRepository extends JpaRepository<UsernameSequence, Long> {
    Optional<UsernameSequence> findBySequenceKey(String sequenceKey);
}