package com.stanford.schoolbackend.core.auth;

import com.stanford.schoolbackend.core.auth.dto.AuthRequest;
import com.stanford.schoolbackend.core.auth.dto.AuthResponse;
import com.stanford.schoolbackend.core.auth.dto.ChangePasswordRequest;
import com.stanford.schoolbackend.core.auth.dto.RegisterRequest;
import com.stanford.schoolbackend.core.enums.UserRole;
import com.stanford.schoolbackend.core.exception.EmailAlreadyExistsException;
import com.stanford.schoolbackend.core.exception.PasswordMismatchException;
import com.stanford.schoolbackend.core.exception.ResourceNotFoundException;
import com.stanford.schoolbackend.core.exception.UnsupportedRoleRegistrationException;
import com.stanford.schoolbackend.core.security.SecurityUtils;
import com.stanford.schoolbackend.core.user.User;
import com.stanford.schoolbackend.core.user.UserRepository;
import com.stanford.schoolbackend.core.utils.JwtService;
import com.stanford.schoolbackend.sms.student.Student;
import com.stanford.schoolbackend.sms.student.StudentRepository;
import com.stanford.schoolbackend.sms.teacher.Teacher;
import com.stanford.schoolbackend.sms.teacher.TeacherRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final TeacherRepository teacherRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final EmailVerificationService emailVerificationService;
    private final AuthEventLogService  authEventLogService;

    private static final int MAX_FAILED_ATTEMPTS = 5;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new PasswordMismatchException();
        }
        if (request.getRole() != UserRole.STUDENT){
            throw new UnsupportedRoleRegistrationException
                    (  "Registration for this role is not supported via this endpoint.");
        }
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new EmailAlreadyExistsException("Email already exists");
        }

        User savedUser;

        // Instantiate the correct subclass based on the role provided
        if (request.getRole() == UserRole.STUDENT) {
            Student student = new Student();
            student.setFirstName(request.getFirstName());
            student.setLastName(request.getLastName());
            student.setEmail(request.getEmail());
            student.setPassword(passwordEncoder.encode(request.getPassword()));
            student.setRole(UserRole.STUDENT);
            student.setEnabled(false);

            Student saved = studentRepository.save(student);
            emailVerificationService.sendVerification(saved);
            // Set student specific fields here if passed in DTO
            savedUser = studentRepository.save(student);
        } else if (request.getRole() == UserRole.TEACHER) {
            Teacher teacher = new Teacher();
            teacher.setFirstName(request.getFirstName());
            teacher.setLastName(request.getLastName());
            teacher.setEmail(request.getEmail());
            teacher.setPassword(passwordEncoder.encode(request.getPassword()));
            teacher.setRole(UserRole.TEACHER);
            savedUser = teacherRepository.save(teacher);
        } else {
            throw new RuntimeException("Registration for this role is not supported via this endpoint.");
        }

        String token = jwtService.generateToken(savedUser.getEmail());

        return AuthResponse.builder()
                .accessToken(token)
                .userId(savedUser.getId())
                .email(savedUser.getEmail())
                .firstName(savedUser.getFirstName())
                .role(savedUser.getRole().name())
                .build();
    }

    public AuthResponse authenticate(AuthRequest request, HttpServletRequest httpRequest) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword()));
        } catch (BadCredentialsException ex) {
            handleFailedLogin(request.getUsername(), httpRequest);
            throw ex;
        }

        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        user.setFailedLoginAttempts(0);
        userRepository.save(user);
        authEventLogService.log(AuthEventType.LOGIN_SUCCESS, request.getUsername(), user, httpRequest);

        String token = jwtService.generateToken(user.getUsername());

        return AuthResponse.builder()
                .accessToken(token)
                .userId(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .role(user.getRole().name())
                .mustChangePassword(user.isMustChangePassword())
                .build();
    }

    public void changePassword(ChangePasswordRequest request, HttpServletRequest httpRequest) {
        String username = SecurityUtils.currentUsername();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new BadCredentialsException("Current password is incorrect");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setMustChangePassword(false);
        userRepository.save(user);

        authEventLogService.log(AuthEventType.PASSWORD_CHANGED, username, user, httpRequest);
    }

    private void handleFailedLogin(String username, HttpServletRequest httpRequest) {
        userRepository.findByUsername(username).ifPresentOrElse(user -> {
            user.setFailedLoginAttempts(user.getFailedLoginAttempts() + 1);
            boolean justLocked = user.getFailedLoginAttempts() >= MAX_FAILED_ATTEMPTS && !user.isAccountLocked();
            if (justLocked) user.setAccountLocked(true);
            userRepository.save(user);

            authEventLogService.log(AuthEventType.LOGIN_FAILURE, username, user, httpRequest);
            if (justLocked) authEventLogService.log(AuthEventType.ACCOUNT_LOCKED, username, user, httpRequest);
        }, () -> authEventLogService.log(AuthEventType.LOGIN_FAILURE, username, null, httpRequest));
    }
}
