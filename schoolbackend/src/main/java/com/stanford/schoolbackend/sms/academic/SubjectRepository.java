package com.stanford.schoolbackend.sms.academic;

import org.springframework.data.jpa.repository.JpaRepository;

public interface SubjectRepository extends JpaRepository<Subject, Long> {
    java.util.Optional<Subject> findByName(String name);
}