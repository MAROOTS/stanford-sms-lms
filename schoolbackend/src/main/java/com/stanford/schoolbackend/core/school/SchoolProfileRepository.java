package com.stanford.schoolbackend.core.school;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SchoolProfileRepository extends JpaRepository<SchoolProfile, Long> {
    Optional<SchoolProfile> findBySchoolId(Long schoolId);
}