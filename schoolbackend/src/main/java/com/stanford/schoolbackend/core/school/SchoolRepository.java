package com.stanford.schoolbackend.core.school;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SchoolRepository extends JpaRepository<School, Long> {
    Optional<School> findBySlug(String slug);
    boolean existsBySlug(String slug);
    long countByStatus(com.stanford.schoolbackend.core.enums.SchoolStatus status);

    long countByCreatedAtAfter(java.time.Instant after);
}
