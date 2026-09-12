package com.stanford.schoolbackend.sms.academic;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TimetableSlotRepository extends JpaRepository<TimetableSlot, Long> {
    List<TimetableSlot> findBySchoolIdAndClassSectionId(Long schoolId, Long classSectionId);
    Optional<TimetableSlot> findByClassSectionIdAndPeriodIdAndDayOfWeek(
            Long classSectionId, Long periodId, int dayOfWeek);
    List<TimetableSlot> findBySchoolIdAndDayOfWeekAndPeriodId(
            Long schoolId, int dayOfWeek, Long periodId);
    boolean existsByTeachingAssignmentId(Long teachingAssignmentId);
    List<TimetableSlot> findBySchoolIdAndTeachingAssignment_Teacher_Id(Long schoolId, Long teacherId);
}
