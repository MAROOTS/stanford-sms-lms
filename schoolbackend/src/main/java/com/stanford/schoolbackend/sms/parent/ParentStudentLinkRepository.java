package com.stanford.schoolbackend.sms.parent;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ParentStudentLinkRepository extends JpaRepository<ParentStudentLink, Long> {
    List<ParentStudentLink> findByParentId(Long parentId);
    Optional<ParentStudentLink> findByParentIdAndStudentId(Long parentId, Long studentId);
    boolean existsByParentIdAndStudentId(Long parentId, Long studentId);
    List<ParentStudentLink> findByStudentId(Long studentId);
    @Query("SELECT l FROM ParentStudentLink l JOIN FETCH l.parent JOIN FETCH l.student WHERE l.parent.school.id = :schoolId")
    List<ParentStudentLink> findBySchoolId(@Param("schoolId") Long schoolId);
}