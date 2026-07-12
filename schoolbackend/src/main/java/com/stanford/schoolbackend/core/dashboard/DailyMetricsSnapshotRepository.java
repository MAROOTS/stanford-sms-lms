package com.stanford.schoolbackend.core.dashboard;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface DailyMetricsSnapshotRepository extends JpaRepository<DailyMetricsSnapshot, Long> {
    Optional<DailyMetricsSnapshot> findBySnapshotDate(LocalDate date);
    Optional<DailyMetricsSnapshot> findTopBySnapshotDateLessThanOrderBySnapshotDateDesc(LocalDate date);
    List<DailyMetricsSnapshot> findBySnapshotDateBetweenOrderBySnapshotDateAsc(LocalDate start, LocalDate end);
}