package com.stanford.schoolbackend.sms.academic;

import com.stanford.schoolbackend.core.exception.ResourceNotFoundException;
import com.stanford.schoolbackend.core.school.School;
import com.stanford.schoolbackend.core.school.SchoolRepository;
import com.stanford.schoolbackend.core.security.SecurityUtils;
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
    private final SchoolRepository schoolRepository;
    public ClassSectionResponse create(ClassSectionRequest request) {
        GradeLevel gradeLevel = gradeLevelRepository.findById(request.getGradeLevelId())
                .orElseThrow(() -> new ResourceNotFoundException("Grade level not found"));
        if (!SecurityUtils.currentSchoolId().equals(gradeLevel.getSchool().getId())) {
            throw new ResourceNotFoundException("Grade level not found");
        }

        Teacher homeroomTeacher = null;
        if (request.getHomeroomTeacherId() != null) {
            homeroomTeacher = teacherRepository.findById(request.getHomeroomTeacherId())
                    .orElseThrow(() -> new ResourceNotFoundException("Teacher not found"));
            if (!SecurityUtils.currentSchoolId().equals(homeroomTeacher.getSchool().getId())) {
                throw new ResourceNotFoundException("Teacher not found");
            }
        }
        School school = schoolRepository.findById(SecurityUtils.currentSchoolId())
                .orElseThrow(() -> new ResourceNotFoundException("School not found"));

        ClassSection section = ClassSection.builder()
                .school(school)
                .name(request.getName())
                .gradeLevel(gradeLevel)
                .homeroomTeacher(homeroomTeacher)
                .build();

        return toResponse(classSectionRepository.save(section));
    }

    public List<ClassSectionResponse> listByGradeLevel(Long gradeLevelId) {
        GradeLevel gradeLevel = gradeLevelRepository.findById(gradeLevelId)
                .orElseThrow(() -> new ResourceNotFoundException("Grade level not found"));
        Long schoolId = SecurityUtils.currentSchoolId();
        if (schoolId == null || gradeLevel.getSchool() == null
                || !schoolId.equals(gradeLevel.getSchool().getId())) {
            throw new ResourceNotFoundException("Grade level not found");
        }
        return classSectionRepository.findByGradeLevelId(gradeLevelId).stream()
                .map(this::toResponse)
                .toList();
    }

    public List<ClassSectionResponse> listAll() {
        return classSectionRepository.findBySchoolId(SecurityUtils.currentSchoolId()).stream()
                .map(this::toResponse)
                .toList();
    }
    public ClassSectionResponse update(Long id, ClassSectionRequest request) {
        ClassSection section = getOwnedOrThrow(id);

        GradeLevel gradeLevel = gradeLevelRepository.findById(request.getGradeLevelId())
                .orElseThrow(() -> new ResourceNotFoundException("Grade level not found"));

        Teacher homeroomTeacher = null;
        if (request.getHomeroomTeacherId() != null) {
            homeroomTeacher = teacherRepository.findById(request.getHomeroomTeacherId())
                    .orElseThrow(() -> new ResourceNotFoundException("Teacher not found"));
        }

        section.setName(request.getName());
        section.setGradeLevel(gradeLevel);
        section.setHomeroomTeacher(homeroomTeacher);

        return toResponse(classSectionRepository.save(section));
    }

    public void delete(Long id) {
        ClassSection section = getOwnedOrThrow(id);
        classSectionRepository.delete(section);
    }

    private ClassSection getOwnedOrThrow(Long id) {
        ClassSection section = classSectionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Class section not found"));
        Long schoolId = SecurityUtils.currentSchoolId();
        if (schoolId == null || section.getSchool() == null
                || !schoolId.equals(section.getSchool().getId())) {
            throw new ResourceNotFoundException("Class section not found");
        }
        return section;
    }
    private ClassSectionResponse toResponse(ClassSection s) {
        return ClassSectionResponse.builder()
                .id(s.getId())
                .name(s.getName())
                .gradeLevelId(s.getGradeLevel().getId())
                .gradeLevelStage(s.getGradeLevel().getStage())
                .gradeLevelName(s.getGradeLevel().getName())
                .homeroomTeacherId(s.getHomeroomTeacher() != null ? s.getHomeroomTeacher().getId() : null)
                .homeroomTeacherName(s.getHomeroomTeacher() != null
                        ? s.getHomeroomTeacher().getFirstName() + " " + s.getHomeroomTeacher().getLastName()
                        : null)
                .build();
    }
}