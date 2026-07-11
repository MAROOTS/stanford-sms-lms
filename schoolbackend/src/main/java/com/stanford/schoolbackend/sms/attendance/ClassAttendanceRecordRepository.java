package com.stanford.schoolbackend.sms.attendance;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ClassAttendanceRecordRepository extends JpaRepository<ClassAttendanceRecord, Long> {
    List<ClassAttendanceRecord> findByClassSessionId(Long classSessionId);
    List<ClassAttendanceRecord> findByStudentId(Long studentId);
}