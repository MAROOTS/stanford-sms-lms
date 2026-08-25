package com.stanford.schoolbackend.core.dashboard;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface DailyMetricsSnapshotRepository extends JpaRepository<DailyMetricsSnapshot, Long> {
    Optional<DailyMetricsSnapshot> findBySchoolIdAndSnapshotDate(Long schoolId, LocalDate date);
    Optional<DailyMetricsSnapshot> findTopBySchoolIdAndSnapshotDateLessThanOrderBySnapshotDateDesc(Long schoolId, LocalDate date);
    List<DailyMetricsSnapshot> findBySchoolIdAndSnapshotDateBetweenOrderBySnapshotDateAsc(Long schoolId, LocalDate start, LocalDate end);
}