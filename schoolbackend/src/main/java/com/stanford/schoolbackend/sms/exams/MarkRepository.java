package com.stanford.schoolbackend.sms.exams;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MarkRepository extends JpaRepository<Mark, Long> {
    List<Mark> findByExamIdAndSubjectId(Long examId, Long subjectId);
    List<Mark> findByStudentId(Long studentId);
    List<Mark> findByStudentIdAndExamId(Long studentId, Long examId);
    Optional<Mark> findByExamIdAndSubjectIdAndStudentId(Long examId, Long subjectId, Long studentId);
    List<Mark> findByExamId(Long examId);
}