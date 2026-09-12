package com.stanford.schoolbackend.sms.academic;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TimetablePeriodRepository extends JpaRepository<TimetablePeriod,Long> {
    List<TimetablePeriod> findBySchoolIdOrderBySortOrderAsc(Long schoolId);
    boolean existsBySchoolId(Long schoolId);
}
