package com.stanford.schoolbackend.sms.academic;

import com.stanford.schoolbackend.core.exception.ResourceNotFoundException;
import com.stanford.schoolbackend.sms.academic.dto.ClassSectionRequest;
import com.stanford.schoolbackend.sms.academic.dto.ClassSectionResponse;
import com.stanford.schoolbackend.sms.teacher.Teacher;
import com.stanford.schoolbackend.sms.teacher.TeacherRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ClassSectionService {

    private final ClassSectionRepository classSectionRepository;
    private final GradeLevelRepository gradeLevelRepository;
    private final TeacherRepository teacherRepository;

    public ClassSectionResponse create(ClassSectionRequest request) {
        GradeLevel gradeLevel = gradeLevelRepository.findById(request.getGradeLevelId())
                .orElseThrow(() -> new ResourceNotFoundException("Grade level not found"));

        Teacher homeroomTeacher = null;
        if (request.getHomeroomTeacherId() != null) {
            homeroomTeacher = teacherRepository.findById(request.getHomeroomTeacherId())
                    .orElseThrow(() -> new ResourceNotFoundException("Teacher not found"));
        }

        ClassSection section = ClassSection.builder()
                .name(request.getName())
                .gradeLevel(gradeLevel)
                .homeroomTeacher(homeroomTeacher)
                .build();

        return toResponse(classSectionRepository.save(section));
    }

    public List<ClassSectionResponse> listByGradeLevel(Long gradeLevelId) {
        return classSectionRepository.findByGradeLevelId(gradeLevelId).stream()
                .map(this::toResponse)
                .toList();
    }

    public List<ClassSectionResponse> listAll() {
        return classSectionRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    private ClassSectionResponse toResponse(ClassSection s) {
        return ClassSectionResponse.builder()
                .id(s.getId())
                .name(s.getName())
                .gradeLevelId(s.getGradeLevel().getId())
                .gradeLevelName(s.getGradeLevel().getName())
                .homeroomTeacherId(s.getHomeroomTeacher() != null ? s.getHomeroomTeacher().getId() : null)
                .homeroomTeacherName(s.getHomeroomTeacher() != null
                        ? s.getHomeroomTeacher().getFirstName() + " " + s.getHomeroomTeacher().getLastName()
                        : null)
                .build();
    }
}