package com.stanford.schoolbackend.sms.academic;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TeachingAssignmentRepository extends JpaRepository<TeachingAssignment, Long> {
    List<TeachingAssignment> findBySchoolId(Long schoolId);
    List<TeachingAssignment> findByTeacherId(Long teacherId);
    List<TeachingAssignment> findByClassSectionId(Long classSectionId);

    boolean existsByClassSectionIdAndSubjectIdAndTeacherId(
            Long classSectionId, Long subjectId, Long teacherId);
}