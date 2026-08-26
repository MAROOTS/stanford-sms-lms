package com.stanford.schoolbackend.sms.exams;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TermRepository extends JpaRepository<Term, Long> {
    Optional<Term> findByIsCurrentTrue();
    List<Term> findBySchoolId(Long schoolId);
    Optional<Term> findByIsCurrentTrueAndSchoolId(Long schoolId);
}