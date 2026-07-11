package com.stanford.schoolbackend.sms.attendance;

import com.stanford.schoolbackend.core.exception.ResourceNotFoundException;
import com.stanford.schoolbackend.core.security.SecurityUtils;
import com.stanford.schoolbackend.sms.academic.ClassSection;
import com.stanford.schoolbackend.sms.academic.ClassSectionRepository;
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
    private final ClassSectionRepository classSectionRepository;
    private final StudentRepository studentRepository;

    public List<ClassAttendanceSheetRow> getEntrySheet(Long classSectionId, LocalDate date) {
        getOwnedClassSectionOrThrow(classSectionId);

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

        ClassSection classSection = getOwnedClassSectionOrThrow(classSectionId);
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

        return saved.stream().map(this::toRecordResponse).toList();
    }

    public List<ClassSessionResponse> listSessions(Long classSectionId) {
        getOwnedClassSectionOrThrow(classSectionId);
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

    private ClassSection getOwnedClassSectionOrThrow(Long classSectionId) {
        ClassSection classSection = classSectionRepository.findById(classSectionId)
                .orElseThrow(() -> new ResourceNotFoundException("Class section not found"));

        boolean isAdmin = SecurityUtils.currentUserHasRole("ADMIN");
        boolean isHomeroomTeacher = classSection.getHomeroomTeacher() != null
                && classSection.getHomeroomTeacher().getEmail().equals(SecurityUtils.currentUserEmail());

        if (!isAdmin && !isHomeroomTeacher) {
            throw new AccessDeniedException("You are not the homeroom teacher for this class");
        }
        return classSection;
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
                .studentId(r.getStudent().getId())
                .studentName(r.getStudent().getFirstName() + " " + r.getStudent().getLastName())
                .status(r.getStatus())
                .build();
    }
}