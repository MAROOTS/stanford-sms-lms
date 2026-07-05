package com.stanford.schoolbackend.core.auth;

import com.stanford.schoolbackend.core.auth.dto.AuthRequest;
import com.stanford.schoolbackend.core.auth.dto.AuthResponse;
import com.stanford.schoolbackend.core.auth.dto.RegisterRequest;
import com.stanford.schoolbackend.core.enums.UserRole;
import com.stanford.schoolbackend.core.exception.EmailAlreadyExistsException;
import com.stanford.schoolbackend.core.exception.GlobalExceptionHandler;
import com.stanford.schoolbackend.core.exception.ResourceNotFoundException;
import com.stanford.schoolbackend.core.user.User;
import com.stanford.schoolbackend.core.user.UserRepository;
import com.stanford.schoolbackend.core.utils.JwtService;
import com.stanford.schoolbackend.sms.student.Student;
import com.stanford.schoolbackend.sms.student.StudentRepository;
import com.stanford.schoolbackend.sms.teacher.Teacher;
import com.stanford.schoolbackend.sms.teacher.TeacherRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
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

    @Transactional
    public AuthResponse register(RegisterRequest request) {
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
                .role(savedUser.getRole().name())
                .build();
    }

    public AuthResponse authenticate(AuthRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(()-> new ResourceNotFoundException("User not found"));
        String token = jwtService.generateToken(user.getEmail());

        return AuthResponse.builder()
                .accessToken(token)
                .userId(user.getId())
                .email(user.getEmail())
                .role(user.getRole().name())
                .build();
    }
}
//TODO  CREATE Admin-only endpoint to create other admins (more production-realistic)