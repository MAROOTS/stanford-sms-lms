package com.stanford.schoolbackend.sms.attendance;

import com.stanford.schoolbackend.core.exception.ResourceNotFoundException;
import com.stanford.schoolbackend.core.security.SecurityUtils;
import com.stanford.schoolbackend.sms.attendance.dto.AttendanceRecordResponse;
import com.stanford.schoolbackend.sms.attendance.dto.MarkAttendanceRequest;
import com.stanford.schoolbackend.sms.student.Student;
import com.stanford.schoolbackend.sms.student.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AttendanceService {

    private final AttendanceRecordRepository attendanceRecordRepository;
    private final SessionService sessionService;
    private final StudentRepository studentRepository;

    public List<AttendanceRecordResponse> markAttendance(Long sessionId, MarkAttendanceRequest request) {
        Session session = sessionService.getOwnedSessionOrThrow(sessionId);

        List<AttendanceRecord> saved = request.getEntries().stream()
                .map(entry -> {
                    Student student = studentRepository.findById(entry.getStudentId())
                            .orElseThrow(() -> new ResourceNotFoundException(
                                    "Student not found: " + entry.getStudentId()));

                    AttendanceRecord record = attendanceRecordRepository
                            .findBySessionId(session.getId()).stream()
                            .filter(r -> r.getStudent().getId().equals(student.getId()))
                            .findFirst()
                            .orElse(AttendanceRecord.builder().session(session).student(student).build());

                    record.setStatus(entry.getStatus());
                    return attendanceRecordRepository.save(record);
                })
                .toList();

        return saved.stream().map(this::toResponse).toList();
    }

    public List<AttendanceRecordResponse> listBySession(Long sessionId) {
        sessionService.getOwnedSessionOrThrow(sessionId);
        return attendanceRecordRepository.findBySessionId(sessionId).stream()
                .map(this::toResponse)
                .toList();
    }

    public List<AttendanceRecordResponse> listByStudent(Long studentId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));

        boolean isPrivileged = SecurityUtils.currentUserHasRole("TEACHER")
                || SecurityUtils.currentUserHasRole("ADMIN");

        if (!isPrivileged && !student.getEmail().equals(SecurityUtils.currentUserEmail())) {
            throw new AccessDeniedException("You can only view your own attendance");
        }

        return attendanceRecordRepository.findByStudentId(studentId).stream()
                .map(this::toResponse)
                .toList();
    }

    private AttendanceRecordResponse toResponse(AttendanceRecord r) {
        return AttendanceRecordResponse.builder()
                .id(r.getId())
                .sessionId(r.getSession().getId())
                .studentId(r.getStudent().getId())
                .studentName(r.getStudent().getFirstName() + " " + r.getStudent().getLastName())
                .status(r.getStatus())
                .build();
    }
}
//Note the upsert logic in markAttendance — re-marking the same session updates existing records rather than creating duplicates,
// same pattern as Submission. This also means a teacher can safely re-run the same "mark all present" call if they made a mistake,
// without needing a separate update endpoint.