package com.stanford.schoolbackend.sms.student;

import com.stanford.schoolbackend.core.admin.AdminUserService;
import com.stanford.schoolbackend.core.admin.dto.CreatedUserResponse;
import com.stanford.schoolbackend.core.auth.dto.RegisterRequest;
import com.stanford.schoolbackend.core.enums.UserRole;
import com.stanford.schoolbackend.core.security.SecurePasswordGenerator;
import com.stanford.schoolbackend.core.security.SecurityUtils;
import com.stanford.schoolbackend.core.user.UserRepository;
import com.stanford.schoolbackend.core.user.UsernameGeneratorService;
import com.stanford.schoolbackend.sms.academic.ClassSection;
import com.stanford.schoolbackend.sms.academic.ClassSectionRepository;
import com.stanford.schoolbackend.sms.academic.dto.AssignSectionRequest;
import com.stanford.schoolbackend.sms.student.dto.*;
import lombok.RequiredArgsConstructor;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;
import org.apache.poi.ss.usermodel.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.*;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class StudentImportService {

    private static final Pattern EMAIL_PATTERN =
            Pattern.compile("^[\\w.+-]+@[\\w-]+\\.[a-zA-Z]{2,}$");
    private static final List<DateTimeFormatter> DATES = List.of(
            DateTimeFormatter.ISO_LOCAL_DATE,
            DateTimeFormatter.ofPattern("d/M/uuuu"),
            DateTimeFormatter.ofPattern("d-M-uuuu")
    );

    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final ClassSectionRepository classSectionRepository;
    private final AdminUserService adminUserService;
    private final UsernameGeneratorService usernameGeneratorService;
    private final SecurePasswordGenerator securePasswordGenerator;
    private final StudentService studentService;

    public byte[] generateTemplate() {
        String csv = """
                firstName,lastName,email,className,admissionNumber,dateOfBirth,gender,nationality,guardianName,guardianPhone,guardianEmail,guardianRelationship,address,bloodGroup,allergies,medicalConditions,emergencyContactName,emergencyContactPhone,previousSchool
                John,Doe,john.doe@example.com,10B,,2012-03-15,MALE,Kenyan,Jane Doe,0712345678,jane@example.com,Mother,Nairobi,O+,Peanuts,,Jane Doe,0712345678,
                """;
        return csv.getBytes(StandardCharsets.UTF_8);
    }

    public ImportValidationResponse validate(MultipartFile file) {
        List<ImportRowResult> rows = parseAndValidate(file);
        long validCount = rows.stream().filter(ImportRowResult::isValid).count();
        return ImportValidationResponse.builder()
                .rows(rows)
                .validCount((int) validCount)
                .invalidCount(rows.size() - (int) validCount)
                .build();
    }

    @Transactional
    public ImportCommitResponse commit(MultipartFile file) {
        List<ImportRowResult> rows = parseAndValidate(file);
        Long schoolId = SecurityUtils.currentSchoolId();
        Map<String, ClassSection> classes = classIndex();

        List<ImportedCredential> created = new ArrayList<>();
        List<ImportRowResult> skipped = new ArrayList<>();

        for (ImportRowResult row : rows) {
            if (!row.isValid()) {
                skipped.add(row);
                continue;
            }
            try {
                String username = usernameGeneratorService.generateUsername(UserRole.STUDENT, schoolId);
                String tempPassword = securePasswordGenerator.generate();

                RegisterRequest request = new RegisterRequest();
                request.setFirstName(row.getFirstName());
                request.setLastName(row.getLastName());
                request.setUsername(username);
                request.setEmail(row.getEmail());
                request.setPassword(tempPassword);
                request.setConfirmPassword(tempPassword);
                request.setRole(UserRole.STUDENT);

                CreatedUserResponse createdUser = adminUserService.createUser(request);
                Student student = studentRepository.findById(createdUser.getId())
                        .orElseThrow();
                applyProfile(student, row);
                studentRepository.save(student);

                if (row.getClassName() != null && !row.getClassName().isBlank()) {
                    ClassSection section = classes.get(normalize(row.getClassName()));
                    if (section != null) {
                        AssignSectionRequest assign = new AssignSectionRequest();
                        assign.setClassSectionId(section.getId());
                        studentService.assignSection(createdUser.getId(), assign);
                    }
                }

                created.add(ImportedCredential.builder()
                        .firstName(row.getFirstName())
                        .lastName(row.getLastName())
                        .username(username)
                        .temporaryPassword(tempPassword)
                        .className(row.getClassName())
                        .build());
            } catch (Exception ex) {
                row.setValid(false);
                row.setErrorMessage(ex.getMessage());
                skipped.add(row);
            }
        }
        return ImportCommitResponse.builder().created(created).skipped(skipped).build();
    }

    private void applyProfile(Student student, ImportRowResult row) {
        if (notBlank(row.getAdmissionNumber())) student.setAdmissionNumber(row.getAdmissionNumber());
        student.setDateOfBirth(parseDate(row.getDateOfBirth()));
        if (notBlank(row.getGender())) student.setGender(row.getGender().trim().toUpperCase());
        if (notBlank(row.getNationality())) student.setNationality(row.getNationality());
        if (notBlank(row.getGuardianName())) student.setGuardianName(row.getGuardianName());
        if (notBlank(row.getGuardianPhone())) {
            student.setGuardianPhone(row.getGuardianPhone());
            student.setParentContactNumber(row.getGuardianPhone());
        }
        if (notBlank(row.getGuardianEmail())) student.setGuardianEmail(row.getGuardianEmail());
        if (notBlank(row.getGuardianRelationship())) student.setGuardianRelationship(row.getGuardianRelationship());
        if (notBlank(row.getAddress())) student.setAddress(row.getAddress());
        if (notBlank(row.getBloodGroup())) student.setBloodGroup(row.getBloodGroup());
        if (notBlank(row.getAllergies())) student.setAllergies(row.getAllergies());
        if (notBlank(row.getMedicalConditions())) student.setMedicalConditions(row.getMedicalConditions());
        if (notBlank(row.getEmergencyContactName())) student.setEmergencyContactName(row.getEmergencyContactName());
        if (notBlank(row.getEmergencyContactPhone())) student.setEmergencyContactPhone(row.getEmergencyContactPhone());
        if (notBlank(row.getPreviousSchool())) student.setPreviousSchool(row.getPreviousSchool());
    }

    private List<ImportRowResult> parseAndValidate(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Please choose a CSV or Excel file.");
        }
        String name = Optional.ofNullable(file.getOriginalFilename()).orElse("").toLowerCase();
        List<Map<String, String>> rawRows;
        try {
            if (name.endsWith(".xlsx")) {
                rawRows = parseXlsx(stripBom(file.getBytes()));
            } else if (name.endsWith(".xls")) {
                throw new IllegalArgumentException("Old .xls files are not supported — save as .xlsx or .csv.");
            } else {
                rawRows = parseCsv(stripBom(file.getBytes()));
            }
        } catch (IllegalArgumentException e) {
            throw e;
        } catch (Exception e) {
            throw new IllegalArgumentException("Could not read the file — use CSV or Excel (.xlsx).");
        }

        Map<String, ClassSection> classes = classIndex();
        Set<String> emailsInFile = new HashSet<>();
        List<ImportRowResult> results = new ArrayList<>();
        int rowNumber = 1;

        for (Map<String, String> raw : rawRows) {
            rowNumber++;
            String firstName = raw.get("firstname");
            String lastName = raw.get("lastname");
            String email = raw.get("email");
            String className = raw.get("classname");
            List<String> errors = new ArrayList<>();

            if (!notBlank(firstName)) errors.add("firstName is required");
            if (!notBlank(lastName)) errors.add("lastName is required");
            if (!notBlank(email)) {
                errors.add("email is required");
            } else if (!EMAIL_PATTERN.matcher(email).matches()) {
                errors.add("email is not a valid format");
            } else {
                String normalized = email.toLowerCase();
                if (!emailsInFile.add(normalized)) errors.add("duplicate email within this file");
                else if (userRepository.findByEmail(email).isPresent()) errors.add("email already exists in the system");
            }
            if (notBlank(className) && !classes.containsKey(normalize(className))) {
                errors.add("class \"" + className + "\" was not found — use the name from the Classes page, e.g. 10B");
            }
            if (notBlank(raw.get("dateofbirth")) && parseDate(raw.get("dateofbirth")) == null) {
                errors.add("dateOfBirth must be YYYY-MM-DD or DD/MM/YYYY");
            }

            results.add(ImportRowResult.builder()
                    .rowNumber(rowNumber)
                    .firstName(firstName)
                    .lastName(lastName)
                    .email(email)
                    .className(className)
                    .admissionNumber(raw.get("admissionnumber"))
                    .dateOfBirth(raw.get("dateofbirth"))
                    .gender(raw.get("gender"))
                    .nationality(raw.get("nationality"))
                    .guardianName(raw.get("guardianname"))
                    .guardianPhone(raw.get("guardianphone"))
                    .guardianEmail(raw.get("guardianemail"))
                    .guardianRelationship(raw.get("guardianrelationship"))
                    .address(raw.get("address"))
                    .bloodGroup(raw.get("bloodgroup"))
                    .allergies(raw.get("allergies"))
                    .medicalConditions(raw.get("medicalconditions"))
                    .emergencyContactName(raw.get("emergencycontactname"))
                    .emergencyContactPhone(raw.get("emergencycontactphone"))
                    .previousSchool(raw.get("previousschool"))
                    .valid(errors.isEmpty())
                    .errorMessage(errors.isEmpty() ? null : String.join("; ", errors))
                    .build());
        }
        return results;
    }

    private List<Map<String, String>> parseCsv(byte[] bytes) throws Exception {
        CSVFormat format = CSVFormat.DEFAULT.builder()
                .setHeader()
                .setSkipHeaderRecord(true)
                .setTrim(true)
                .setIgnoreHeaderCase(true)
                .get();
        List<Map<String, String>> rows = new ArrayList<>();
        try (CSVParser parser = new CSVParser(
                new InputStreamReader(new ByteArrayInputStream(bytes), StandardCharsets.UTF_8), format)) {
            for (CSVRecord record : parser) {
                Map<String, String> row = new HashMap<>();
                record.toMap().forEach((k, v) -> row.put(normalizeHeader(k), blankToNull(v)));
                rows.add(row);
            }
        }
        return rows;
    }

    private List<Map<String, String>> parseXlsx(byte[] bytes) throws Exception {
        List<Map<String, String>> rows = new ArrayList<>();
        try (Workbook wb = WorkbookFactory.create(new ByteArrayInputStream(bytes))) {
            Sheet sheet = wb.getSheetAt(0);
            Row headerRow = sheet.getRow(0);
            if (headerRow == null) return rows;
            DataFormatter fmt = new DataFormatter();
            List<String> headers = new ArrayList<>();
            for (Cell cell : headerRow) headers.add(normalizeHeader(fmt.formatCellValue(cell)));

            for (int r = 1; r <= sheet.getLastRowNum(); r++) {
                Row excelRow = sheet.getRow(r);
                if (excelRow == null) continue;
                Map<String, String> row = new HashMap<>();
                boolean empty = true;
                for (int c = 0; c < headers.size(); c++) {
                    Cell cell = excelRow.getCell(c);
                    String value = cell == null ? null : fmt.formatCellValue(cell).trim();
                    if (value != null && !value.isBlank()) empty = false;
                    row.put(headers.get(c), blankToNull(value));
                }
                if (!empty) rows.add(row);
            }
        }
        return rows;
    }

    private Map<String, ClassSection> classIndex() {
        Map<String, ClassSection> map = new HashMap<>();
        for (ClassSection cs : classSectionRepository.findBySchoolId(SecurityUtils.currentSchoolId())) {
            map.put(normalize(cs.getName()), cs);
            String grade = cs.getGradeLevel() != null ? cs.getGradeLevel().getName() : null;
            if (grade != null) {
                map.put(normalize(grade + " " + cs.getName()), cs);
                map.put(normalize(cs.getName() + " (" + grade + ")"), cs);
            }
        }
        return map;
    }

    private static byte[] stripBom(byte[] bytes) {
        if (bytes.length >= 3 && bytes[0] == (byte) 0xEF && bytes[1] == (byte) 0xBB && bytes[2] == (byte) 0xBF) {
            return Arrays.copyOfRange(bytes, 3, bytes.length);
        }
        return bytes;
    }

    private static LocalDate parseDate(String raw) {
        if (!notBlank(raw)) return null;
        String value = raw.trim();
        for (DateTimeFormatter f : DATES) {
            try { return LocalDate.parse(value, f); } catch (DateTimeParseException ignored) {}
        }
        return null;
    }

    private static String normalizeHeader(String h) {
        return h == null ? "" : h.trim().toLowerCase().replace("_", "").replace(" ", "");
    }

    private static String normalize(String s) {
        return s == null ? "" : s.trim().toLowerCase().replaceAll("\\s+", " ");
    }

    private static boolean notBlank(String s) { return s != null && !s.isBlank(); }
    private static String blankToNull(String s) { return notBlank(s) ? s.trim() : null; }
}