package com.stanford.schoolbackend.core.admin;

import com.stanford.schoolbackend.core.admin.dto.CreatedUserResponse;
import com.stanford.schoolbackend.core.auth.dto.RegisterRequest;
import com.stanford.schoolbackend.core.enums.UserRole;
import com.stanford.schoolbackend.core.exception.EmailAlreadyExistsException;
import com.stanford.schoolbackend.core.user.User;
import com.stanford.schoolbackend.core.user.UserRepository;
import com.stanford.schoolbackend.sms.student.Student;
import com.stanford.schoolbackend.sms.student.StudentRepository;
import com.stanford.schoolbackend.sms.teacher.Teacher;
import com.stanford.schoolbackend.sms.teacher.TeacherRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AdminUserService {

    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final TeacherRepository teacherRepository;
    private final PasswordEncoder passwordEncoder;

    public CreatedUserResponse createUser(RegisterRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new EmailAlreadyExistsException("Email already exists");
        }

        String encodedPassword = passwordEncoder.encode(request.getPassword());
        User saved;

        switch (request.getRole()) {
            case STUDENT -> {
                Student student = Student.builder()
                        .firstName(request.getFirstName())
                        .lastName(request.getLastName())
                        .email(request.getEmail())
                        .password(encodedPassword)
                        .role(UserRole.STUDENT)
                        .build();
                saved = studentRepository.save(student);
            }
            case TEACHER -> {
                Teacher teacher = Teacher.builder()
                        .firstName(request.getFirstName())
                        .lastName(request.getLastName())
                        .email(request.getEmail())
                        .password(encodedPassword)
                        .role(UserRole.TEACHER)
                        .build();
                saved = teacherRepository.save(teacher);
            }
            case ADMIN -> {
                User admin = User.builder()
                        .firstName(request.getFirstName())
                        .lastName(request.getLastName())
                        .email(request.getEmail())
                        .password(encodedPassword)
                        .role(UserRole.ADMIN)
                        .build();
                saved = userRepository.save(admin);
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
}