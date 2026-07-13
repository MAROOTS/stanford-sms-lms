package com.stanford.schoolbackend.core.admin.upload;

import com.stanford.schoolbackend.core.admin.upload.dto.UploadResult;
import com.stanford.schoolbackend.core.enums.AttendanceStatus;
import com.stanford.schoolbackend.core.enums.UserRole;
import com.stanford.schoolbackend.core.user.UserRepository;
import com.stanford.schoolbackend.sms.academic.Subject;
import com.stanford.schoolbackend.sms.academic.SubjectRepository;
import com.stanford.schoolbackend.sms.attendance.*;
import com.stanford.schoolbackend.sms.exams.*;
import com.stanford.schoolbackend.sms.fees.FeeItem;
import com.stanford.schoolbackend.sms.fees.FeeItemRepository;
import com.stanford.schoolbackend.sms.library.Book;
import com.stanford.schoolbackend.sms.library.BookRepository;
import com.stanford.schoolbackend.sms.student.Student;
import com.stanford.schoolbackend.sms.student.StudentRepository;
import com.stanford.schoolbackend.sms.teacher.Teacher;
import com.stanford.schoolbackend.sms.teacher.TeacherRepository;
import lombok.RequiredArgsConstructor;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.Reader;
import java.time.LocalDate;
import java.util.*;

@Service
@RequiredArgsConstructor
public class UploadService {

    private final StudentRepository studentRepository;
    private final TeacherRepository teacherRepository;
    private final UserRepository userRepository;
    private final SubjectRepository subjectRepository;
    private final MarkRepository markRepository;
    private final ExamRepository examRepository;
    private final BookRepository bookRepository;
    private final SessionRepository sessionRepository;
    private final AttendanceRecordRepository attendanceRecordRepository;
    private final FeeItemRepository feeItemRepository;
    private final PasswordEncoder passwordEncoder;

    private static final String DEFAULT_PASSWORD = "changeme123";

    @Transactional
    public UploadResult processFile(MultipartFile file, String entityType) {
        String filename = file.getOriginalFilename();
        if (filename == null) throw new IllegalArgumentException("File name is missing");

        List<Map<String, String>> rows;
        if (filename.endsWith(".csv")) {
            rows = parseCSV(file);
        } else if (filename.endsWith(".xlsx") || filename.endsWith(".xls")) {
            rows = parseExcel(file);
        } else {
            throw new IllegalArgumentException("Unsupported file type. Please upload a .csv or .xlsx file.");
        }
        if (rows.isEmpty()) throw new IllegalArgumentException("The file is empty or has no data rows.");

        return createEntities(rows, entityType.toUpperCase());
    }

    // ── CSV parsing ──
    private List<Map<String, String>> parseCSV(MultipartFile file) {
        List<Map<String, String>> rows = new ArrayList<>();
        try (Reader reader = new BufferedReader(new InputStreamReader(file.getInputStream()));
             CSVParser parser = CSVFormat.Builder.create()
                     .setHeader().setSkipHeaderRecord(true)
                     .setIgnoreHeaderCase(true).setTrim(true)
                     .build().parse(reader)) {
            for (var record : parser) {
                Map<String, String> row = new LinkedHashMap<>();
                for (String header : parser.getHeaderNames()) {
                    row.put(header, record.get(header));
                }
                rows.add(row);
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse CSV: " + e.getMessage());
        }
        return rows;
    }

    // ── Excel parsing ──
    private List<Map<String, String>> parseExcel(MultipartFile file) {
        List<Map<String, String>> rows = new ArrayList<>();
        try (Workbook workbook = new XSSFWorkbook(file.getInputStream())) {
            Sheet sheet = workbook.getSheetAt(0);
            if (sheet.getPhysicalNumberOfRows() <= 1) return rows;
            Row headerRow = sheet.getRow(0);
            List<String> headers = new ArrayList<>();
            for (Cell cell : headerRow) headers.add(getCellString(cell).trim().toLowerCase());
            for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row == null) continue;
                Map<String, String> rowData = new LinkedHashMap<>();
                boolean hasData = false;
                for (int j = 0; j < headers.size(); j++) {
                    String value = getCellString(row.getCell(j)).trim();
                    rowData.put(headers.get(j), value);
                    if (!value.isEmpty()) hasData = true;
                }
                if (hasData) rows.add(rowData);
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse Excel: " + e.getMessage());
        }
        return rows;
    }

    private String getCellString(Cell cell) {
        if (cell == null) return "";
        return switch (cell.getCellType()) {
            case STRING -> cell.getStringCellValue();
            case NUMERIC -> {
                if (DateUtil.isCellDateFormatted(cell))
                    yield cell.getLocalDateTimeCellValue().toLocalDate().toString();
                double v = cell.getNumericCellValue();
                yield (v == Math.floor(v) && !Double.isInfinite(v)) ? String.valueOf((long) v) : String.valueOf(v);
            }
            case BOOLEAN -> String.valueOf(cell.getBooleanCellValue());
            case FORMULA -> { try { yield cell.getStringCellValue(); } catch (Exception e) { yield String.valueOf(cell.getNumericCellValue()); } }
            default -> "";
        };
    }

    // ── Entity creation dispatcher ──
    private UploadResult createEntities(List<Map<String, String>> rows, String entityType) {
        List<UploadResult.RowError> errors = new ArrayList<>();
        int success = 0;
        for (int i = 0; i < rows.size(); i++) {
            int rowNum = i + 2;
            try {
                switch (entityType) {
                    case "STUDENT" -> createStudent(rows.get(i));
                    case "TEACHER" -> createTeacher(rows.get(i));
                    case "SUBJECT" -> createSubject(rows.get(i));
                    case "MARKS" -> createMark(rows.get(i));
                    case "BOOKS" -> createBook(rows.get(i));
                    case "ATTENDANCE" -> createAttendance(rows.get(i));
                    case "FEE_ITEMS" -> createFeeItem(rows.get(i));
                    default -> throw new IllegalArgumentException("Unsupported entity type: " + entityType);
                }
                success++;
            } catch (Exception e) {
                errors.add(UploadResult.RowError.builder().row(rowNum).message(e.getMessage()).build());
            }
        }
        return UploadResult.builder()
                .totalRows(rows.size()).successCount(success).errorCount(errors.size()).errors(errors).build();
    }

    // ── Student ──
    private void createStudent(Map<String, String> r) {
        String email = getRequired(r, "email");
        if (studentRepository.findByEmail(email).isPresent() || userRepository.findByEmail(email).isPresent())
            throw new RuntimeException("Email already exists: " + email);

        Student s = Student.builder()
                .firstName(getRequired(r, "firstname", "first_name", "first name"))
                .middleName(nullIfBlank(getOrDefault(r, "middlename", "middle_name", "middle name")))
                .lastName(getRequired(r, "lastname", "last_name", "last name"))
                .email(email)
                .password(passwordEncoder.encode(DEFAULT_PASSWORD))
                .role(UserRole.STUDENT)
                // Personal
                .dateOfBirth(parseDate(getOrDefault(r, "dateofbirth", "date_of_birth", "dob")))
                .gender(nullIfBlank(getOrDefault(r, "gender", "sex")))
                .nationality(nullIfBlank(getOrDefault(r, "nationality")))
                .religion(nullIfBlank(getOrDefault(r, "religion")))
                // Contact & Address
                .address(nullIfBlank(getOrDefault(r, "address", "street", "streetaddress")))
                .city(nullIfBlank(getOrDefault(r, "city")))
                .stateProvince(nullIfBlank(getOrDefault(r, "stateprovince", "state_province", "state", "province")))
                .postalCode(nullIfBlank(getOrDefault(r, "postalcode", "postal_code", "zip", "zipcode")))
                .country(nullIfBlank(getOrDefault(r, "country")))
                .phoneNumber(nullIfBlank(getOrDefault(r, "phonenumber", "phone_number", "phone")))
                // Guardian
                .guardianName(nullIfBlank(getOrDefault(r, "guardianname", "guardian_name", "parentname", "parent_name", "fathername", "mothername")))
                .guardianRelationship(nullIfBlank(getOrDefault(r, "guardianrelationship", "guardian_relationship", "relationship", "relation")))
                .guardianEmail(nullIfBlank(getOrDefault(r, "guardianemail", "guardian_email", "parentemail", "parent_email")))
                .guardianPhone(nullIfBlank(getOrDefault(r, "guardianphone", "guardian_phone", "parentphone", "parent_phone", "parentcontact", "parent_contact")))
                .emergencyContactName(nullIfBlank(getOrDefault(r, "emergencycontactname", "emergency_contact_name", "emergencyname", "emergency_name")))
                .emergencyContactPhone(nullIfBlank(getOrDefault(r, "emergencycontactphone", "emergency_contact_phone", "emergencyphone", "emergency_phone")))
                // Medical
                .bloodGroup(nullIfBlank(getOrDefault(r, "bloodgroup", "blood_group", "bloodtype", "blood_type")))
                .medicalNotes(nullIfBlank(getOrDefault(r, "medicalnotes", "medical_notes", "medical", "allergies", "conditions")))
                // Academic
                .admissionNumber(nullIfBlank(getOrDefault(r, "admissionnumber", "admission_number", "admission no", "admission")))
                .rollNumber(nullIfBlank(getOrDefault(r, "rollnumber", "roll_number", "roll no", "roll")))
                .enrollmentDate(parseDate(getOrDefault(r, "enrollmentdate", "enrollment_date", "enrolmentdate", "enrolled")))
                .previousSchool(nullIfBlank(getOrDefault(r, "previousschool", "previous_school", "lastschool", "last_school")))
                .build();

        studentRepository.save(s);
    }

    private LocalDate parseDate(String val) {
        if (val == null || val.isBlank()) return null;
        try { return LocalDate.parse(val); } catch (Exception e) { return null; }
    }

    // ── Teacher ──
    private void createTeacher(Map<String, String> r) {
        String email = getRequired(r, "email");
        if (teacherRepository.findByEmail(email).isPresent() || userRepository.findByEmail(email).isPresent())
            throw new RuntimeException("Email already exists: " + email);
        teacherRepository.save(Teacher.builder()
                .firstName(getRequired(r, "firstname", "first_name", "first name"))
                .lastName(getRequired(r, "lastname", "last_name", "last name"))
                .email(email)
                .password(passwordEncoder.encode(DEFAULT_PASSWORD))
                .role(UserRole.TEACHER)
                .qualification(nullIfBlank(getOrDefault(r, "qualification", "qualifications")))
                .department(nullIfBlank(getOrDefault(r, "department", "dept")))
                .build());
    }

    // ── Subject ──
    private void createSubject(Map<String, String> r) {
        String name = getRequired(r, "name", "subjectname", "subject_name", "subject");
        if (subjectRepository.findByName(name).isPresent())
            throw new RuntimeException("Subject already exists: " + name);
        subjectRepository.save(Subject.builder()
                .name(name)
                .code(nullIfBlank(getOrDefault(r, "code", "subjectcode", "subject_code")))
                .build());
    }

    // ── Marks ──
    private void createMark(Map<String, String> r) {
        long examId = Long.parseLong(getRequired(r, "examid", "exam_id", "exam id"));
        long subjectId = Long.parseLong(getRequired(r, "subjectid", "subject_id", "subject id"));
        String studentEmail = getRequired(r, "studentemail", "student_email", "student email", "email");
        double score = Double.parseDouble(getRequired(r, "score", "marks", "mark"));
        double maxScore = Double.parseDouble(getOrDefault(r, "maxscore", "max_score", "max score", "outof", "out of", "100"));

        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new RuntimeException("Exam not found: " + examId));
        Subject subject = subjectRepository.findById(subjectId)
                .orElseThrow(() -> new RuntimeException("Subject not found: " + subjectId));
        Student student = studentRepository.findByEmail(studentEmail)
                .orElseThrow(() -> new RuntimeException("Student not found: " + studentEmail));

        if (markRepository.findByExamIdAndSubjectIdAndStudentId(examId, subjectId, student.getId()).isPresent())
            throw new RuntimeException("Mark already exists for this student in this exam/subject");

        markRepository.save(Mark.builder()
                .exam(exam).subject(subject).student(student)
                .score(score).maxScore(maxScore).build());
    }

    // ── Books ──
    private void createBook(Map<String, String> r) {
        String isbn = nullIfBlank(getOrDefault(r, "isbn"));
        if (isbn != null && bookRepository.findByIsbn(isbn).isPresent())
            throw new RuntimeException("Book with ISBN already exists: " + isbn);
        bookRepository.save(Book.builder()
                .title(getRequired(r, "title", "booktitle", "book_title", "book name"))
                .author(nullIfBlank(getOrDefault(r, "author")))
                .isbn(isbn)
                .publisher(nullIfBlank(getOrDefault(r, "publisher")))
                .build());
    }

    // ── Attendance ──
    private void createAttendance(Map<String, String> r) {
        long sessionId = Long.parseLong(getRequired(r, "sessionid", "session_id", "session id"));
        String studentEmail = getRequired(r, "studentemail", "student_email", "student email", "email");
        String statusStr = getRequired(r, "status", "attendancestatus", "attendance_status");

        Session session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found: " + sessionId));
        Student student = studentRepository.findByEmail(studentEmail)
                .orElseThrow(() -> new RuntimeException("Student not found: " + studentEmail));

        AttendanceStatus status;
        try {
            status = AttendanceStatus.valueOf(statusStr.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid status: " + statusStr + ". Use PRESENT, ABSENT, LATE, or EXCUSED");
        }

        attendanceRecordRepository.save(AttendanceRecord.builder()
                .session(session).student(student).status(status).build());
    }

    // ── Fee Items ──
    private void createFeeItem(Map<String, String> r) {
        String name = getRequired(r, "name", "feeitemname", "fee_item_name", "fee name", "item");
        if (feeItemRepository.findByName(name).isPresent())
            throw new RuntimeException("Fee item already exists: " + name);
        feeItemRepository.save(FeeItem.builder().name(name).build());
    }

    // ── Helpers ──
    private String getRequired(Map<String, String> row, String... keys) {
        for (String key : keys) {
            String val = row.get(key);
            if (val != null && !val.isBlank()) return val.trim();
        }
        throw new RuntimeException("Missing required field: " + keys[0]);
    }

    private String getOrDefault(Map<String, String> row, String... keys) {
        for (String key : keys) {
            String val = row.get(key);
            if (val != null && !val.isBlank()) return val.trim();
        }
        return "";
    }

    private String nullIfBlank(String s) {
        return (s == null || s.isBlank()) ? null : s.trim();
    }
}
