package com.stanford.schoolbackend.sms.admissions;

import com.stanford.schoolbackend.core.admin.AdminUserService;
import com.stanford.schoolbackend.core.admin.dto.CreatedUserResponse;
import com.stanford.schoolbackend.core.auth.dto.RegisterRequest;
import com.stanford.schoolbackend.core.enums.NotificationType;
import com.stanford.schoolbackend.core.enums.UserRole;
import com.stanford.schoolbackend.core.exception.PasswordMismatchException;
import com.stanford.schoolbackend.core.exception.ResourceNotFoundException;
import com.stanford.schoolbackend.core.notification.NotificationService;
import com.stanford.schoolbackend.core.school.School;
import com.stanford.schoolbackend.core.school.SchoolRepository;
import com.stanford.schoolbackend.core.security.SecurityUtils;
import com.stanford.schoolbackend.sms.academic.GradeLevel;
import com.stanford.schoolbackend.sms.academic.GradeLevelRepository;
import com.stanford.schoolbackend.sms.admissions.dto.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AdmissionService {

    private final StudentApplicationRepository studentApplicationRepository;
    private final GradeLevelRepository gradeLevelRepository;
    private final AdminUserService adminUserService;
    private final NotificationService notificationService;
    private final SchoolRepository schoolRepository;
    public StudentApplicationResponse create(CreateApplicationRequest request) {
        GradeLevel gradeLevel = resolveGradeLevel(request.getDesiredGradeLevelId());
        School school = schoolRepository.findById(SecurityUtils.currentSchoolId())
                .orElseThrow(() -> new ResourceNotFoundException("School not found"));
        StudentApplication application = StudentApplication.builder()
                .school(school)
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .dateOfBirth(request.getDateOfBirth())
                .desiredGradeLevel(gradeLevel)
                .guardianName(request.getGuardianName())
                .guardianEmail(request.getGuardianEmail())
                .guardianPhone(request.getGuardianPhone())
                .studentEmail(request.getStudentEmail())
                .previousSchool(request.getPreviousSchool())
                .notes(request.getNotes())
                .build();

        StudentApplication saved = studentApplicationRepository.save(application);

        notificationService.notifyRole(UserRole.ADMIN, NotificationType.APPLICATION_SUBMITTED,
                "New admission application: " + saved.getFirstName() + " " + saved.getLastName(),
                "/admissions");

        return toResponse(saved);
    }

    public StudentApplicationResponse update(Long id, CreateApplicationRequest request) {
        StudentApplication application = getOrThrow(id);
        if (application.getStatus() == ApplicationStatus.ENROLLED) {
            throw new IllegalArgumentException("Cannot edit an already-enrolled application");
        }

        application.setFirstName(request.getFirstName());
        application.setLastName(request.getLastName());
        application.setDateOfBirth(request.getDateOfBirth());
        application.setDesiredGradeLevel(resolveGradeLevel(request.getDesiredGradeLevelId()));
        application.setGuardianName(request.getGuardianName());
        application.setGuardianEmail(request.getGuardianEmail());
        application.setGuardianPhone(request.getGuardianPhone());
        application.setStudentEmail(request.getStudentEmail());
        application.setPreviousSchool(request.getPreviousSchool());
        application.setNotes(request.getNotes());

        return toResponse(studentApplicationRepository.save(application));
    }

    public List<StudentApplicationResponse> listAll(ApplicationStatus statusFilter) {
        Long schoolId = SecurityUtils.currentSchoolId();
        List<StudentApplication> applications = statusFilter != null
                ? studentApplicationRepository.findByStatusAndSchoolId(statusFilter, schoolId)
                : studentApplicationRepository.findBySchoolId(schoolId);
        return applications.stream().map(this::toResponse).toList();
    }

    public StudentApplicationResponse getById(Long id) {
        return toResponse(getOrThrow(id));
    }

    public StudentApplicationResponse decide(Long id, DecisionRequest request) {
        StudentApplication application = getOrThrow(id);

        if (application.getStatus() == ApplicationStatus.ENROLLED) {
            throw new IllegalArgumentException("This application has already been enrolled");
        }
        if (request.getStatus() == ApplicationStatus.ENROLLED || request.getStatus() == ApplicationStatus.SUBMITTED) {
            throw new IllegalArgumentException("Invalid decision status: " + request.getStatus());
        }

        application.setStatus(request.getStatus());
        application.setNotes(request.getNotes());
        application.setDecidedAt(Instant.now());

        return toResponse(studentApplicationRepository.save(application));
    }

    public EnrollApplicationResponse enroll(Long id, EnrollApplicationRequest request) {
        StudentApplication application = getOrThrow(id);

        if (application.getStatus() != ApplicationStatus.ACCEPTED) {
            throw new IllegalArgumentException("Only accepted applications can be enrolled");
        }
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new PasswordMismatchException();
        }

        String accountEmail = (application.getStudentEmail() != null && !application.getStudentEmail().isBlank())
                ? application.getStudentEmail()
                : application.getGuardianEmail();

        RegisterRequest registerRequest = new RegisterRequest();
        registerRequest.setFirstName(application.getFirstName());
        registerRequest.setLastName(application.getLastName());
        registerRequest.setUsername(request.getUsername());
        registerRequest.setEmail(accountEmail);
        registerRequest.setPassword(request.getPassword());
        registerRequest.setConfirmPassword(request.getConfirmPassword());
        registerRequest.setRole(UserRole.STUDENT);

        CreatedUserResponse created = adminUserService.createUser(registerRequest);

        application.setStatus(ApplicationStatus.ENROLLED);
        application.setEnrolledStudentId(created.getId());
        application.setDecidedAt(Instant.now());
        studentApplicationRepository.save(application);

        return EnrollApplicationResponse.builder()
                .studentId(created.getId())
                .username(request.getUsername())
                .temporaryPassword(request.getPassword())
                .build();
    }

    public void delete(Long id) {
        StudentApplication application = getOrThrow(id);
        if (application.getStatus() == ApplicationStatus.ENROLLED) {
            throw new IllegalArgumentException("Cannot delete an enrolled application");
        }
        studentApplicationRepository.delete(application);
    }

    private GradeLevel resolveGradeLevel(Long gradeLevelId) {
        if (gradeLevelId == null) return null;
        return gradeLevelRepository.findById(gradeLevelId)
                .orElseThrow(() -> new ResourceNotFoundException("Grade level not found"));
    }

    private StudentApplication getOrThrow(Long id) {
        StudentApplication application = studentApplicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found"));
        Long schoolId = SecurityUtils.currentSchoolId();
        if (schoolId == null || application.getSchool() == null
                || !schoolId.equals(application.getSchool().getId())) {
            throw new ResourceNotFoundException("Application not found");
        }
        return application;
    }

    private StudentApplicationResponse toResponse(StudentApplication a) {
        return StudentApplicationResponse.builder()
                .id(a.getId())
                .firstName(a.getFirstName())
                .lastName(a.getLastName())
                .dateOfBirth(a.getDateOfBirth())
                .desiredGradeLevelId(a.getDesiredGradeLevel() != null ? a.getDesiredGradeLevel().getId() : null)
                .desiredGradeLevelName(a.getDesiredGradeLevel() != null ? a.getDesiredGradeLevel().getName() : null)
                .guardianName(a.getGuardianName())
                .guardianEmail(a.getGuardianEmail())
                .guardianPhone(a.getGuardianPhone())
                .studentEmail(a.getStudentEmail())
                .previousSchool(a.getPreviousSchool())
                .notes(a.getNotes())
                .status(a.getStatus())
                .submittedAt(a.getSubmittedAt())
                .decidedAt(a.getDecidedAt())
                .enrolledStudentId(a.getEnrolledStudentId())
                .build();
    }
}