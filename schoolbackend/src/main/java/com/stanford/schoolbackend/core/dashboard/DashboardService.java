package com.stanford.schoolbackend.core.dashboard;

import com.stanford.schoolbackend.core.enums.AttendanceStatus;
import com.stanford.schoolbackend.core.exception.ResourceNotFoundException;
import com.stanford.schoolbackend.core.dashboard.dto.AttendanceTrendPoint;
import com.stanford.schoolbackend.core.dashboard.dto.DashboardSummaryResponse;
import com.stanford.schoolbackend.sms.academic.ClassSectionRepository;
import com.stanford.schoolbackend.sms.attendance.ClassAttendanceRecord;
import com.stanford.schoolbackend.sms.attendance.ClassAttendanceRecordRepository;
import com.stanford.schoolbackend.sms.attendance.ClassSession;
import com.stanford.schoolbackend.sms.attendance.ClassSessionRepository;
import com.stanford.schoolbackend.sms.exams.Term;
import com.stanford.schoolbackend.sms.exams.TermRepository;
import com.stanford.schoolbackend.sms.student.StudentRepository;
import com.stanford.schoolbackend.sms.teacher.TeacherRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final DailyMetricsSnapshotRepository snapshotRepository;
    private final StudentRepository studentRepository;
    private final TeacherRepository teacherRepository;
    private final ClassSectionRepository classSectionRepository;
    private final ClassSessionRepository classSessionRepository;
    private final ClassAttendanceRecordRepository classAttendanceRecordRepository;
    private final TermRepository termRepository;

    public DailyMetricsSnapshot captureSnapshot(LocalDate date) {
        DailyMetricsSnapshot snapshot = snapshotRepository.findBySnapshotDate(date)
                .orElse(DailyMetricsSnapshot.builder().snapshotDate(date).build());

        snapshot.setTotalStudents((int) studentRepository.count());
        snapshot.setTotalTeachers((int) teacherRepository.count());
        snapshot.setActiveClasses((int) classSectionRepository.count());
        snapshot.setAttendancePercentage(computeAttendancePercentage(date));

        return snapshotRepository.save(snapshot);
    }

    public DashboardSummaryResponse getSummary() {
        LocalDate today = LocalDate.now();
        DailyMetricsSnapshot todaySnapshot = captureSnapshot(today); // always refresh "today" live

        DailyMetricsSnapshot comparison = snapshotRepository
                .findTopBySnapshotDateLessThanOrderBySnapshotDateDesc(today)
                .orElse(null);

        return DashboardSummaryResponse.builder()
                .asOfDate(today)
                .totalStudents(todaySnapshot.getTotalStudents())
                .totalStudentsChangePercent(percentChange(todaySnapshot.getTotalStudents(),
                        comparison != null ? comparison.getTotalStudents() : null))
                .totalTeachers(todaySnapshot.getTotalTeachers())
                .totalTeachersChangePercent(percentChange(todaySnapshot.getTotalTeachers(),
                        comparison != null ? comparison.getTotalTeachers() : null))
                .activeClasses(todaySnapshot.getActiveClasses())
                .activeClassesChangePercent(percentChange(todaySnapshot.getActiveClasses(),
                        comparison != null ? comparison.getActiveClasses() : null))
                .attendanceToday(todaySnapshot.getAttendancePercentage())
                .attendanceTodayChangePercent(percentChangeDouble(todaySnapshot.getAttendancePercentage(),
                        comparison != null ? comparison.getAttendancePercentage() : null))
                .build();
    }

    public List<AttendanceTrendPoint> getAttendanceTrend(String range, Long termId) {
        LocalDate today = LocalDate.now();
        LocalDate start;

        switch (range.toUpperCase()) {
            case "MONTH" -> start = today.minusDays(29);
            case "TERM" -> {
                Term term = termId != null
                        ? termRepository.findById(termId).orElseThrow(() -> new ResourceNotFoundException("Term not found"))
                        : termRepository.findByIsCurrentTrue().orElse(null);
                start = (term != null && term.getStartDate() != null) ? term.getStartDate() : today.minusDays(29);
            }
            default -> start = today.minusDays(6); // WEEK
        }

        return snapshotRepository.findBySnapshotDateBetweenOrderBySnapshotDateAsc(start, today).stream()
                .filter(s -> s.getAttendancePercentage() != null)
                .map(s -> AttendanceTrendPoint.builder()
                        .date(s.getSnapshotDate())
                        .attendancePercentage(s.getAttendancePercentage())
                        .build())
                .toList();
    }

    private Double computeAttendancePercentage(LocalDate date) {
        List<ClassSession> sessions = classSessionRepository.findBySessionDate(date);
        if (sessions.isEmpty()) return null;

        int total = 0;
        int presentOrLate = 0;
        for (ClassSession session : sessions) {
            List<ClassAttendanceRecord> records = classAttendanceRecordRepository.findByClassSessionId(session.getId());
            for (ClassAttendanceRecord record : records) {
                total++;
                if (record.getStatus() == AttendanceStatus.PRESENT || record.getStatus() == AttendanceStatus.LATE) {
                    presentOrLate++;
                }
            }
        }
        if (total == 0) return null;
        return round2((presentOrLate / (double) total) * 100);
    }

    private Double percentChange(int current, Integer previous) {
        if (previous == null || previous <= 0) return null;
        return round2(((current - previous) / (double) previous) * 100);
    }

    private Double percentChangeDouble(Double current, Double previous) {
        if (current == null || previous == null || previous <= 0) return null;
        return round2(((current - previous) / previous) * 100);
    }

    private double round2(double value) {
        return Math.round(value * 100.0) / 100.0;
    }
}