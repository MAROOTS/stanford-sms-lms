package com.stanford.schoolbackend.sms.fees;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface FeeItemRepository extends JpaRepository<FeeItem, Long> {
    Optional<FeeItem> findByNameIgnoreCase(String name);
    List<FeeItem> findBySchoolId(Long schoolId);
    Optional<FeeItem> findByNameIgnoreCaseAndSchoolId(String name, Long schoolId);
}