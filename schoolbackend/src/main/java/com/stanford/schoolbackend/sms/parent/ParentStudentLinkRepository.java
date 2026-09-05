package com.stanford.schoolbackend.sms.parent;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface ParentStudentLinkRepository extends JpaRepository<ParentStudentLink, Long> {
    List<ParentStudentLink> findByParentId(Long parentId);
    Optional<ParentStudentLink> findByParentIdAndStudentId(Long parentId, Long studentId);
    boolean existsByParentIdAndStudentId(Long parentId, Long studentId);
    List<ParentStudentLink> findByStudentId(Long studentId);
}