package com.stanford.schoolbackend.lms.enrollment;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface EnrollmentRepository extends JpaRepository<Enrollment, Long> {
    List<Enrollment> findByCourseId(Long courseId);
    List<Enrollment> findByStudentId(Long studentId);
    Optional<Enrollment> findByStudentIdAndCourseId(Long studentId, Long courseId);
    boolean existsByStudentIdAndCourseId(Long studentId, Long courseId);
}

//The unique constraint plus existsByStudentIdAndCourseId gives me,
// a clean way to reject duplicate enrollment attempts at the service layer ,
// before hitting a DB constraint violation