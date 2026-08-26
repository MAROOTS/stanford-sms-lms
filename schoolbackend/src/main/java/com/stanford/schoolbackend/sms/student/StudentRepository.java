package com.stanford.schoolbackend.sms.student;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface StudentRepository extends JpaRepository<Student, Long> {
    List<Student> findByClassSectionId(Long classSectionId);
    List<Student> findByClassSectionIdIn(List<Long> classSectionIds);
    Optional<Student> findByUsername(String username);
    long countBySchoolId(Long schoolId);
    List<Student> findBySchoolId(Long schoolId);

}
