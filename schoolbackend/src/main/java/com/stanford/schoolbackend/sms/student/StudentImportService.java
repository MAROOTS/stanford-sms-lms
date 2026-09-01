package com.stanford.schoolbackend.sms.student;

import com.stanford.schoolbackend.core.admin.AdminUserService;
import com.stanford.schoolbackend.core.admin.dto.CreatedUserResponse;
import com.stanford.schoolbackend.core.enums.UserRole;
import com.stanford.schoolbackend.core.security.SecurePasswordGenerator;
import com.stanford.schoolbackend.core.security.SecurityUtils;
import com.stanford.schoolbackend.core.user.UserRepository;
import com.stanford.schoolbackend.core.user.UsernameGeneratorService;
import com.stanford.schoolbackend.sms.academic.ClassSection;
import com.stanford.schoolbackend.sms.academic.ClassSectionRepository;
import com.stanford.schoolbackend.sms.academic.dto.AssignSectionRequest;
import com.stanford.schoolbackend.sms.student.dto.*;
import com.stanford.schoolbackend.core.auth.dto.RegisterRequest;
import lombok.RequiredArgsConstructor;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class StudentImportService {

    private static final Pattern EMAIL_PATTERN = Pattern.compile("^[\\w.+-]+@[\\w-]+\\.[a-zA-Z]{2,}$");

    private final UserRepository userRepository;
    private final ClassSectionRepository classSectionRepository;
    private final AdminUserService adminUserService;
    private final UsernameGeneratorService usernameGeneratorService;
    private final SecurePasswordGenerator securePasswordGenerator;
    private final StudentService studentService;

    public byte[] generateTemplate() {
        String csv = """
                firstName,lastName,email,className
                John,Doe,john.doe@example.com,Grade 7 Blue
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

    public ImportCommitResponse commit(MultipartFile file) {
        List<ImportRowResult> rows = parseAndValidate(file); // re-validated server-side, never trust the client blindly
        Long schoolId = SecurityUtils.currentSchoolId();

        Map<String, ClassSection> classSectionsByName = new HashMap<>();
        for (ClassSection cs : classSectionRepository.findAll()) {
            classSectionsByName.put(cs.getName().toLowerCase(), cs);
        }

        List<ImportedCredential> created = new ArrayList<>();
        List<ImportRowResult> skipped = new ArrayList<>();

        for (ImportRowResult row : rows) {
            if (!row.isValid()) {
                skipped.add(row);
                continue;
            }

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

            if (row.getClassName() != null && !row.getClassName().isBlank()) {
                ClassSection section = classSectionsByName.get(row.getClassName().toLowerCase());
                if (section != null) {
                    AssignSectionRequest assignRequest = new AssignSectionRequest();
                    assignRequest.setClassSectionId(section.getId());
                    studentService.assignSection(createdUser.getId(), assignRequest);
                }
            }

            created.add(ImportedCredential.builder()
                    .firstName(row.getFirstName())
                    .lastName(row.getLastName())
                    .username(username)
                    .temporaryPassword(tempPassword)
                    .className(row.getClassName())
                    .build());
        }

        return ImportCommitResponse.builder().created(created).skipped(skipped).build();
    }

    private List<ImportRowResult> parseAndValidate(MultipartFile file) {
        List<ImportRowResult> results = new ArrayList<>();
        Set<String> emailsInFile = new HashSet<>();

        Map<String, ClassSection> classSectionsByName = new HashMap<>();
        for (ClassSection cs : classSectionRepository.findAll()) {
            classSectionsByName.put(cs.getName().toLowerCase(), cs);
        }

        CSVFormat format = CSVFormat.DEFAULT.builder()
                .setHeader()
                .setSkipHeaderRecord(true)
                .setTrim(true)
                .setIgnoreHeaderCase(true).get();

        try (CSVParser parser = new CSVParser(
                new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8), format)) {

            int rowNumber = 1;
            for (CSVRecord record : parser) {
                rowNumber++; // row 1 is the header

                String firstName = safeGet(record, "firstName");
                String lastName = safeGet(record, "lastName");
                String email = safeGet(record, "email");
                String className = safeGet(record, "className");

                List<String> errors = new ArrayList<>();

                if (firstName == null || firstName.isBlank()) errors.add("firstName is required");
                if (lastName == null || lastName.isBlank()) errors.add("lastName is required");
                if (email == null || email.isBlank()) {
                    errors.add("email is required");
                } else if (!EMAIL_PATTERN.matcher(email).matches()) {
                    errors.add("email is not a valid format");
                } else {
                    String normalizedEmail = email.toLowerCase();
                    if (emailsInFile.contains(normalizedEmail)) {
                        errors.add("duplicate email within this file");
                    } else if (userRepository.findByEmail(email).isPresent()) {
                        errors.add("email already exists in the system");
                    }
                    emailsInFile.add(normalizedEmail);
                }

                if (className != null && !className.isBlank()
                        && !classSectionsByName.containsKey(className.toLowerCase())) {
                    errors.add("class \"" + className + "\" was not found");
                }

                results.add(ImportRowResult.builder()
                        .rowNumber(rowNumber)
                        .firstName(firstName)
                        .lastName(lastName)
                        .email(email)
                        .className(className)
                        .valid(errors.isEmpty())
                        .errorMessage(errors.isEmpty() ? null : String.join("; ", errors))
                        .build());
            }
        } catch (IOException e) {
            throw new IllegalArgumentException("Could not read the uploaded file — please check it is a valid CSV.");
        }

        return results;
    }

    private String safeGet(CSVRecord record, String column) {
        try {
            String value = record.get(column);
            return value != null ? value.trim() : null;
        } catch (IllegalArgumentException e) {
            return null; // that column wasn't present in this file
        }
    }
}