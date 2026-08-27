package com.stanford.schoolbackend.sms.exams;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ExamRepository extends JpaRepository<Exam, Long> {
    List<Exam> findBySchoolId(Long schoolId);
}