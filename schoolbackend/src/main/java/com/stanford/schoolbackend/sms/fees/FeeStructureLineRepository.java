package com.stanford.schoolbackend.sms.fees;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FeeStructureLineRepository extends JpaRepository<FeeStructureLine, Long> {
    List<FeeStructureLine> findBySchoolId(Long schoolId);
    List<FeeStructureLine> findBySchoolIdAndGradeLevelId(Long schoolId, Long gradeLevelId);
    void deleteBySchoolIdAndGradeLevelId(Long schoolId, Long gradeLevelId);
    void deleteByFeeItemId(Long feeItemId);
    boolean existsByFeeItemId(Long feeItemId);
}