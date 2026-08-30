package com.stanford.schoolbackend.core.admin;

import com.stanford.schoolbackend.core.admin.dto.CreatedUserResponse;
import com.stanford.schoolbackend.core.auth.AuthEventLogService;
import com.stanford.schoolbackend.core.auth.AuthEventType;
import com.stanford.schoolbackend.core.auth.RefreshTokenService;
import com.stanford.schoolbackend.core.auth.dto.AdminResetPasswordResponse;
import com.stanford.schoolbackend.core.auth.dto.GenerateUsernameResponse;
import com.stanford.schoolbackend.core.auth.dto.RegisterRequest;
import com.stanford.schoolbackend.core.enums.NotificationType;
import com.stanford.schoolbackend.core.enums.UserRole;
import com.stanford.schoolbackend.core.exception.EmailAlreadyExistsException;
import com.stanford.schoolbackend.core.exception.PasswordMismatchException;
import com.stanford.schoolbackend.core.exception.ResourceNotFoundException;
import com.stanford.schoolbackend.core.notification.NotificationService;
import com.stanford.schoolbackend.core.school.School;
import com.stanford.schoolbackend.core.school.SchoolRepository;
import com.stanford.schoolbackend.core.security.SecurePasswordGenerator;
import com.stanford.schoolbackend.core.security.SecurityUtils;
import com.stanford.schoolbackend.core.user.User;
import com.stanford.schoolbackend.core.user.UserRepository;
import com.stanford.schoolbackend.core.user.UsernameGeneratorService;
import com.stanford.schoolbackend.sms.student.Student;
import com.stanford.schoolbackend.sms.student.StudentRepository;
import com.stanford.schoolbackend.sms.teacher.Teacher;
import com.stanford.schoolbackend.sms.teacher.TeacherRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminUserService {
    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final TeacherRepository teacherRepository;
    private final PasswordEncoder passwordEncoder;
    private final NotificationService  notificationService;
    private final UsernameGeneratorService usernameGeneratorService;
    private final AuthEventLogService authEventLogService;
    private final SecurePasswordGenerator securePasswordGenerator;
    private final RefreshTokenService refreshTokenService;
    private final SchoolRepository schoolRepository;

    public GenerateUsernameResponse generateUsername(UserRole role) {
        return GenerateUsernameResponse.builder().username(usernameGeneratorService.generateUsername(role, SecurityUtils.currentSchoolId())).build();
    }
    public CreatedUserResponse createUser(RegisterRequest request) {

        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new PasswordMismatchException();
        }
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new EmailAlreadyExistsException("Email already exists");
        }
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new EmailAlreadyExistsException("Username already in use");
        }

        String encodedPassword = passwordEncoder.encode(request.getPassword());
        User saved;
        Long currentSchoolId = SecurityUtils.currentSchoolId();
        School school = currentSchoolId != null
                ? schoolRepository.findById(currentSchoolId).orElseThrow(() -> new ResourceNotFoundException("School not found"))
                : null;

        switch (request.getRole()) {
            case STUDENT -> {
                Student student = Student.builder()
                        .firstName(request.getFirstName())
                        .lastName(request.getLastName())
                        .username(request.getUsername()).mustChangePassword(true)
                        .admissionNumber(usernameGeneratorService.admissionNumberFromUsername(request.getUsername()))
                        .email(request.getEmail())
                        .password(encodedPassword)
                        .role(UserRole.STUDENT)
                        .school(school)
                        .build();
                saved = studentRepository.save(student);
                notificationService.notifyRole(UserRole.ADMIN, NotificationType.STUDENT_REGISTERED,
                        student.getFirstName() + " " + student.getLastName() + " has been registered as a new student.",
                        "/students");
            }
            case TEACHER -> {
                Teacher teacher = Teacher.builder()
                        .firstName(request.getFirstName())
                        .lastName(request.getLastName())
                        .username(request.getUsername()).mustChangePassword(true)
                        .email(request.getEmail())
                        .password(encodedPassword)
                        .role(UserRole.TEACHER)
                        .school(school)
                        .build();
                saved = teacherRepository.save(teacher);
            }
            case ADMIN -> {
                User admin = User.builder()
                        .firstName(request.getFirstName())
                        .lastName(request.getLastName())
                        .username(request.getUsername()).mustChangePassword(true)
                        .email(request.getEmail())
                        .password(encodedPassword)
                        .role(UserRole.ADMIN)
                        .school(school)
                        .build();
                saved = userRepository.save(admin);
            }
            case LIBRARIAN -> {
                User librarian = User.builder()
                        .firstName(request.getFirstName())
                        .lastName(request.getLastName())
                        .username(request.getUsername())
                        .mustChangePassword(true)
                        .email(request.getEmail())
                        .password(encodedPassword)
                        .role(UserRole.LIBRARIAN)
                        .school(school)
                        .build();
                saved = userRepository.save(librarian);
            }
            case ACCOUNTANT -> {
                User accountant = User.builder()
                        .firstName(request.getFirstName())
                        .lastName(request.getLastName())
                        .username(request.getUsername())
                        .mustChangePassword(true)
                        .email(request.getEmail())
                        .password(encodedPassword)
                        .role(UserRole.ACCOUNTANT)
                        .school(school)
                        .build();
                saved = userRepository.save(accountant);
            }
            case PARENT -> {
                User parent = User.builder()
                        .firstName(request.getFirstName())
                        .lastName(request.getLastName())
                        .username(request.getUsername())
                        .mustChangePassword(true)
                        .email(request.getEmail())
                        .password(encodedPassword)
                        .role(UserRole.PARENT)
                        .school(school)
                        .build();
                saved = userRepository.save(parent);
            }
            default -> throw new IllegalArgumentException("Unsupported role: " + request.getRole());
        }

        return CreatedUserResponse.builder()
                .id(saved.getId())
                .firstName(saved.getFirstName())
                .lastName(saved.getLastName())
                .email(saved.getEmail())
                .role(saved.getRole())
                .build();
    }

    public AdminResetPasswordResponse resetPassword(Long userId) {
        User user = getOwnedOrThrow(userId);

        String tempPassword = securePasswordGenerator.generate(); // reuse the same generator pattern as AdminSeeder
        user.setPassword(passwordEncoder.encode(tempPassword));
        user.setMustChangePassword(true);
        user.setFailedLoginAttempts(0);
        user.setAccountLocked(false);
        userRepository.save(user);
        refreshTokenService.revokeAllForUser(user);

        authEventLogService.log(AuthEventType.ADMIN_PASSWORD_RESET, user.getUsername(), user, null);

        return AdminResetPasswordResponse.builder().username(user.getUsername()).temporaryPassword(tempPassword).build();
    }

    public void unlockAccount(Long userId) {
        User user = getOwnedOrThrow(userId);
        user.setAccountLocked(false);
        user.setFailedLoginAttempts(0);
        userRepository.save(user);
        authEventLogService.log(AuthEventType.ACCOUNT_UNLOCKED, user.getUsername(), user, null);
    }

    public List<CreatedUserResponse> listByRoles(List<UserRole> roles) {
        return userRepository.findByRoleInAndSchoolId(roles, SecurityUtils.currentSchoolId()).stream()
                .map(u -> CreatedUserResponse.builder()
                        .id(u.getId())
                        .firstName(u.getFirstName())
                        .lastName(u.getLastName())
                        .email(u.getEmail())
                        .role(u.getRole())
                        .build())
                .toList();
    }


    private User getOwnedOrThrow(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Long schoolId = SecurityUtils.currentSchoolId();
        if (schoolId == null || user.getSchool() == null
                || !schoolId.equals(user.getSchool().getId())) {
            throw new ResourceNotFoundException("User not found");
        }
        return user;
    }
}