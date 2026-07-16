package com.stanford.schoolbackend.sms.student;

import com.stanford.schoolbackend.core.exception.EmailAlreadyExistsException;
import com.stanford.schoolbackend.core.exception.ResourceNotFoundException;
import com.stanford.schoolbackend.core.security.SecurityUtils;
import com.stanford.schoolbackend.core.user.UserRepository;
import com.stanford.schoolbackend.sms.academic.ClassSection;
import com.stanford.schoolbackend.sms.academic.ClassSectionRepository;
import com.stanford.schoolbackend.sms.academic.dto.AssignSectionRequest;
import com.stanford.schoolbackend.sms.student.dto.StudentResponse;
import com.stanford.schoolbackend.sms.student.dto.StudentUpdateRequest;
import com.stanford.schoolbackend.sms.teacher.Teacher;
import com.stanford.schoolbackend.sms.teacher.TeacherRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class StudentService {

    private final StudentRepository studentRepository;
    private final ClassSectionRepository classSectionRepository;
    private final UserRepository userRepository;
    private final TeacherRepository teacherRepository;


    public void assignSection(Long studentId, AssignSectionRequest request) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));

        ClassSection section = classSectionRepository.findById(request.getClassSectionId())
                .orElseThrow(() -> new ResourceNotFoundException("Class section not found"));

        student.setClassSection(section);
        studentRepository.save(student);
    }

    public List<StudentResponse> listAll() {
        boolean isAdmin = SecurityUtils.currentUserHasRole("ADMIN");

        if (!isAdmin && SecurityUtils.currentUserHasRole("TEACHER")) {
            Teacher teacher = teacherRepository.findByEmail(SecurityUtils.currentUserEmail())
                    .orElseThrow(() -> new ResourceNotFoundException("Teacher profile not found"));

            List<Long> homeroomSectionIds = classSectionRepository.findByHomeroomTeacherId(teacher.getId())
                    .stream().map(ClassSection::getId).toList();

            if (homeroomSectionIds.isEmpty()) return List.of();

            return studentRepository.findByClassSectionIdIn(homeroomSectionIds).stream()
                    .map(this::toResponse)
                    .toList();
        }

        return studentRepository.findAll().stream().map(this::toResponse).toList();
    }

    public StudentResponse getById(Long studentId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));

        boolean isAdmin = SecurityUtils.currentUserHasRole("ADMIN");

        if (!isAdmin && SecurityUtils.currentUserHasRole("TEACHER")) {
            Teacher teacher = teacherRepository.findByEmail(SecurityUtils.currentUserEmail())
                    .orElseThrow(() -> new ResourceNotFoundException("Teacher profile not found"));

            boolean isHomeroomTeacher = student.getClassSection() != null
                    && student.getClassSection().getHomeroomTeacher() != null
                    && student.getClassSection().getHomeroomTeacher().getId().equals(teacher.getId());

            if (!isHomeroomTeacher) {
                throw new AccessDeniedException("You can only view students in your homeroom class");
            }
        }

        return toResponse(student);
    }

    public StudentResponse update(Long studentId, StudentUpdateRequest request) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));

        if (!student.getEmail().equalsIgnoreCase(request.getEmail())
                && userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new EmailAlreadyExistsException("Email already exists");
        }

        student.setFirstName(request.getFirstName());
        student.setLastName(request.getLastName());
        student.setEmail(request.getEmail());
        student.setAdmissionNumber(request.getAdmissionNumber());

        if (request.getClassSectionId() != null) {
            ClassSection section = classSectionRepository.findById(request.getClassSectionId())
                    .orElseThrow(() -> new ResourceNotFoundException("Class section not found"));
            student.setClassSection(section);
        } else {
            student.setClassSection(null);
        }

        return toResponse(studentRepository.save(student));
    }

    public void delete(Long studentId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));
        studentRepository.delete(student);
    }

    private StudentResponse toResponse(Student s) {
        return StudentResponse.builder()
                .id(s.getId())
                .firstName(s.getFirstName())
                .lastName(s.getLastName())
                .email(s.getEmail())
                .admissionNumber(s.getAdmissionNumber())
                .classSectionId(s.getClassSection() != null ? s.getClassSection().getId() : null)
                .classSectionName(s.getClassSection() != null ? s.getClassSection().getName() : null)
                .gradeLevelName(s.getClassSection() != null ? s.getClassSection().getGradeLevel().getName() : null)
                .build();
    }
}