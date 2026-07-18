package com.stanford.schoolbackend.sms.academic;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ClassSectionRepository extends JpaRepository<ClassSection, Long> {
    List<ClassSection> findByGradeLevelId(Long gradeLevelId);
    List<ClassSection> findByHomeroomTeacherId(Long teacherId);
}