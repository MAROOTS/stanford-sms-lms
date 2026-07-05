package com.stanford.schoolbackend.sms.student;

import com.stanford.schoolbackend.core.exception.ResourceNotFoundException;
import com.stanford.schoolbackend.sms.academic.ClassSection;
import com.stanford.schoolbackend.sms.academic.ClassSectionRepository;
import com.stanford.schoolbackend.sms.academic.dto.AssignSectionRequest;
import com.stanford.schoolbackend.sms.student.dto.StudentResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class StudentService {

    private final StudentRepository studentRepository;
    private final ClassSectionRepository classSectionRepository;

    public void assignSection(Long studentId, AssignSectionRequest request) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));

        ClassSection section = classSectionRepository.findById(request.getClassSectionId())
                .orElseThrow(() -> new ResourceNotFoundException("Class section not found"));

        student.setClassSection(section);
        studentRepository.save(student);
    }

    public StudentResponse getById(Long studentId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));
        return toResponse(student);
    }

    private StudentResponse toResponse(Student s) {
        return StudentResponse.builder()
                .id(s.getId())
                .firstName(s.getFirstName())
                .lastName(s.getLastName())
                .email(s.getEmail())
                .classSectionId(s.getClassSection() != null ? s.getClassSection().getId() : null)
                .classSectionName(s.getClassSection() != null ? s.getClassSection().getName() : null)
                .gradeLevelName(s.getClassSection() != null ? s.getClassSection().getGradeLevel().getName() : null)
                .build();
    }
}