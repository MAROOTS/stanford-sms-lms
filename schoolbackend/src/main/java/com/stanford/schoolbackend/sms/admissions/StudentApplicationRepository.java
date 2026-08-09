package com.stanford.schoolbackend.sms.admissions;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface StudentApplicationRepository extends JpaRepository<StudentApplication, Long> {
    List<StudentApplication> findByStatus(ApplicationStatus status);
}