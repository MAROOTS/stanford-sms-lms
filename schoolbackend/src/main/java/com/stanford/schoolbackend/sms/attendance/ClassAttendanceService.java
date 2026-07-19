package com.stanford.schoolbackend.sms.attendance;

import com.stanford.schoolbackend.core.enums.NotificationType;
import com.stanford.schoolbackend.core.enums.UserRole;
import com.stanford.schoolbackend.core.exception.ResourceNotFoundException;
import com.stanford.schoolbackend.core.notification.NotificationService;
import com.stanford.schoolbackend.core.security.SecurityUtils;
import com.stanford.schoolbackend.sms.academic.ClassSection;
import com.stanford.schoolbackend.sms.academic.ClassSectionOwnershipService;
import com.stanford.schoolbackend.sms.attendance.dto.*;
import com.stanford.schoolbackend.sms.student.Student;
import com.stanford.schoolbackend.sms.student.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ClassAttendanceService {

    private final ClassSessionRepository classSessionRepository;
    private final ClassAttendanceRecordRepository classAttendanceRecordRepository;
    private final StudentRepository studentRepository;
    private final ClassSectionOwnershipService classSectionOwnershipService;
private final NotificationService notificationService;
    public List<ClassAttendanceSheetRow> getEntrySheet(Long classSectionId, LocalDate date) {
        classSectionOwnershipService.getOwnedClassSectionOrThrow(classSectionId);

        List<Student> students = studentRepository.findByClassSectionId(classSectionId);

        Map<Long, ClassAttendanceRecord> existing = classSessionRepository
                .findByClassSectionIdAndSessionDate(classSectionId, date)
                .map(session -> classAttendanceRecordRepository.findByClassSessionId(session.getId()).stream()
                        .collect(Collectors.toMap(r -> r.getStudent().getId(), Function.identity())))
                .orElse(Map.of());

        return students.stream()
                .map(student -> ClassAttendanceSheetRow.builder()
                        .studentId(student.getId())
                        .studentName(student.getFirstName() + " " + student.getLastName())
                        .status(existing.containsKey(student.getId()) ? existing.get(student.getId()).getStatus() : null)
                        .build())
                .toList();
    }

    public List<ClassAttendanceRecordResponse> markAttendance(
            Long classSectionId, LocalDate date, MarkClassAttendanceRequest request) {

        ClassSection classSection = classSectionOwnershipService.getOwnedClassSectionOrThrow(classSectionId);
        ClassSession session = getOrCreateSession(classSection, date);

        List<ClassAttendanceRecord> saved = request.getEntries().stream()
                .map(entry -> {
                    Student student = studentRepository.findById(entry.getStudentId())
                            .orElseThrow(() -> new ResourceNotFoundException(
                                    "Student not found: " + entry.getStudentId()));

                    ClassAttendanceRecord record = classAttendanceRecordRepository
                            .findByClassSessionId(session.getId()).stream()
                            .filter(r -> r.getStudent().getId().equals(student.getId()))
                            .findFirst()
                            .orElse(ClassAttendanceRecord.builder().classSession(session).student(student).build());

                    record.setStatus(entry.getStatus());
                    return classAttendanceRecordRepository.save(record);
                })
                .toList();
        notificationService.notifyRole(UserRole.ADMIN, NotificationType.ATTENDANCE_TAKEN,
                "Attendance taken for " + classSection.getName() + " on " + date + ".",
                "/attendance");

        return saved.stream().map(this::toRecordResponse).toList();
    }

    public List<ClassSessionResponse> listSessions(Long classSectionId) {
        classSectionOwnershipService.getOwnedClassSectionOrThrow(classSectionId);
        return classSessionRepository.findByClassSectionIdOrderBySessionDateDesc(classSectionId).stream()
                .map(this::toSessionResponse)
                .toList();
    }

    public List<ClassAttendanceRecordResponse> listByStudent(Long studentId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));

        boolean isPrivileged = SecurityUtils.currentUserHasRole("TEACHER")
                || SecurityUtils.currentUserHasRole("ADMIN");
        if (!isPrivileged && !student.getEmail().equals(SecurityUtils.currentUserEmail())) {
            throw new AccessDeniedException("You can only view your own attendance");
        }

        return classAttendanceRecordRepository.findByStudentId(studentId).stream()
                .map(this::toRecordResponse)
                .toList();
    }

    private ClassSession getOrCreateSession(ClassSection classSection, LocalDate date) {
        return classSessionRepository.findByClassSectionIdAndSessionDate(classSection.getId(), date)
                .orElseGet(() -> classSessionRepository.save(
                        ClassSession.builder().classSection(classSection).sessionDate(date).build()));
    }



    private ClassSessionResponse toSessionResponse(ClassSession s) {
        return ClassSessionResponse.builder()
                .id(s.getId())
                .classSectionId(s.getClassSection().getId())
                .classSectionName(s.getClassSection().getName())
                .sessionDate(s.getSessionDate())
                .note(s.getNote())
                .build();
    }

    private ClassAttendanceRecordResponse toRecordResponse(ClassAttendanceRecord r) {
        return ClassAttendanceRecordResponse.builder()
                .id(r.getId())
                .classSessionId(r.getClassSession().getId())
                .sessionDate(r.getClassSession().getSessionDate())
                .studentId(r.getStudent().getId())
                .studentName(r.getStudent().getFirstName() + " " + r.getStudent().getLastName())
                .status(r.getStatus())
                .build();
    }
}