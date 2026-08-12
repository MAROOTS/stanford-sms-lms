package com.stanford.schoolbackend.sms.parent;

import com.stanford.schoolbackend.core.enums.UserRole;
import com.stanford.schoolbackend.core.exception.EmailAlreadyExistsException;
import com.stanford.schoolbackend.core.exception.ResourceNotFoundException;
import com.stanford.schoolbackend.core.security.SecurePasswordGenerator;
import com.stanford.schoolbackend.core.user.UserRepository;
import com.stanford.schoolbackend.core.user.UsernameGeneratorService;
import com.stanford.schoolbackend.sms.parent.dto.ParentRequest;
import com.stanford.schoolbackend.sms.parent.dto.ParentResponse;
import com.stanford.schoolbackend.sms.student.Student;
import com.stanford.schoolbackend.sms.student.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ParentService {

    private final ParentRepository parentRepository;
    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final PasswordEncoder passwordEncoder;
    private final UsernameGeneratorService usernameGeneratorService;
    private final SecurePasswordGenerator securePasswordGenerator;

    @Transactional(readOnly = true)
    public List<ParentResponse> getAllParents() {
        return parentRepository.findAllWithChildren().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ParentResponse getParentById(Long id) {
        Parent parent = parentRepository.findByIdWithChildren(id)
                .orElseThrow(() -> new ResourceNotFoundException("Parent not found with id: " + id));
        return toResponse(parent);
    }

    @Transactional
    public ParentResponse createParent(ParentRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new EmailAlreadyExistsException("Email already exists");
        }

        String username = usernameGeneratorService.generateUsername(UserRole.PARENT);
        String tempPassword = securePasswordGenerator.generate();

        Parent parent = Parent.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .username(username)
                .password(passwordEncoder.encode(tempPassword))
                .role(UserRole.PARENT)
                .mustChangePassword(true)
                .occupation(request.getOccupation())
                .alternatePhone(request.getAlternatePhone())
                .address(request.getAddress())
                .build();

        parent = parentRepository.save(parent);

        // Link children if provided
        if (request.getStudentIds() != null && !request.getStudentIds().isEmpty()) {
            linkChildren(parent, request.getStudentIds());
        }

        ParentResponse response = toResponse(parent);
        response.setUsername(username);
        response.setTemporaryPassword(tempPassword);
        return response;
    }

    @Transactional
    public ParentResponse updateParent(Long id, ParentRequest request) {
        Parent parent = parentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Parent not found with id: " + id));

        parent.setFirstName(request.getFirstName());
        parent.setLastName(request.getLastName());
        if (request.getEmail() != null && !request.getEmail().equals(parent.getEmail())) {
            if (userRepository.findByEmail(request.getEmail()).isPresent()) {
                throw new EmailAlreadyExistsException("Email already exists");
            }
            parent.setEmail(request.getEmail());
        }
        parent.setOccupation(request.getOccupation());
        parent.setAlternatePhone(request.getAlternatePhone());
        parent.setAddress(request.getAddress());

        parent = parentRepository.save(parent);
        return toResponse(parent);
    }

    @Transactional
    public void deleteParent(Long id) {
        Parent parent = parentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Parent not found with id: " + id));
        parentRepository.delete(parent);
    }

    @Transactional
    public ParentResponse linkChild(Long parentId, Long studentId, String relationship, boolean isPrimary) {
        Parent parent = parentRepository.findByIdWithChildren(parentId)
                .orElseThrow(() -> new ResourceNotFoundException("Parent not found with id: " + parentId));

        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + studentId));

        parent.getChildren().add(student);
        parent = parentRepository.save(parent);

        return toResponse(parent);
    }

    @Transactional
    public ParentResponse unlinkChild(Long parentId, Long studentId) {
        Parent parent = parentRepository.findByIdWithChildren(parentId)
                .orElseThrow(() -> new ResourceNotFoundException("Parent not found with id: " + parentId));

        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + studentId));

        parent.getChildren().remove(student);
        parent = parentRepository.save(parent);

        return toResponse(parent);
    }

    @Transactional
    public void linkChildren(Parent parent, List<Long> studentIds) {
        List<Student> students = studentRepository.findAllById(studentIds);
        parent.getChildren().addAll(students);
        parentRepository.save(parent);
    }

    @Transactional(readOnly = true)
    public List<ParentResponse.ChildSummary> getMyChildren(Long parentId) {
        Parent parent = parentRepository.findByIdWithChildren(parentId)
                .orElseThrow(() -> new ResourceNotFoundException("Parent not found with id: " + parentId));

        return parent.getChildren().stream()
                .map(child -> ParentResponse.ChildSummary.builder()
                        .id(child.getId())
                        .firstName(child.getFirstName())
                        .lastName(child.getLastName())
                        .rollNumber(child.getRollNumber())
                        .admissionNumber(child.getAdmissionNumber())
                        .classSectionName(child.getClassSection() != null ? child.getClassSection().getName() : null)
                        .gradeLevelName(child.getClassSection() != null && child.getClassSection().getGradeLevel() != null
                                ? child.getClassSection().getGradeLevel().getName() : null)
                        .build())
                .collect(Collectors.toList());
    }

    private ParentResponse toResponse(Parent parent) {
        return ParentResponse.builder()
                .id(parent.getId())
                .email(parent.getEmail())
                .username(parent.getUsername())
                .firstName(parent.getFirstName())
                .lastName(parent.getLastName())
                .role(parent.getRole().name())
                .occupation(parent.getOccupation())
                .alternatePhone(parent.getAlternatePhone())
                .address(parent.getAddress())
                .children(parent.getChildren().stream()
                        .map(child -> ParentResponse.ChildSummary.builder()
                                .id(child.getId())
                                .firstName(child.getFirstName())
                                .lastName(child.getLastName())
                                .rollNumber(child.getRollNumber())
                                .admissionNumber(child.getAdmissionNumber())
                                .classSectionName(child.getClassSection() != null ? child.getClassSection().getName() : null)
                                .gradeLevelName(child.getClassSection() != null && child.getClassSection().getGradeLevel() != null
                                        ? child.getClassSection().getGradeLevel().getName() : null)
                                .build())
                        .collect(Collectors.toList()))
                .build();
    }
}