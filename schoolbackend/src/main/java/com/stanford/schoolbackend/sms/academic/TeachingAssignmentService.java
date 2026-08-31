package com.stanford.schoolbackend.sms.academic;

import com.stanford.schoolbackend.core.exception.ResourceNotFoundException;
import com.stanford.schoolbackend.core.school.School;
import com.stanford.schoolbackend.core.school.SchoolRepository;
import com.stanford.schoolbackend.core.security.SecurityUtils;
import com.stanford.schoolbackend.sms.academic.dto.TeachingAssignmentRequest;
import com.stanford.schoolbackend.sms.academic.dto.TeachingAssignmentResponse;
import com.stanford.schoolbackend.sms.teacher.Teacher;
import com.stanford.schoolbackend.sms.teacher.TeacherRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TeachingAssignmentService {

    private final TeachingAssignmentRepository teachingAssignmentRepository;
    private final TeacherRepository teacherRepository;
    private final SubjectRepository subjectRepository;
    private final ClassSectionRepository classSectionRepository;
    private final SchoolRepository schoolRepository;

    public TeachingAssignmentResponse create(TeachingAssignmentRequest request) {
        Long schoolId = SecurityUtils.currentSchoolId();
        School school = schoolRepository.findById(schoolId)
                .orElseThrow(() -> new ResourceNotFoundException("School not found"));

        Teacher teacher = ownedTeacher(request.getTeacherId(), schoolId);
        Subject subject = ownedSubject(request.getSubjectId(), schoolId);
        ClassSection section = ownedSection(request.getClassSectionId(), schoolId);

        TeachingAssignment saved = teachingAssignmentRepository.save(TeachingAssignment.builder()
                .school(school)
                .teacher(teacher)
                .subject(subject)
                .classSection(section)
                .build());
        return toResponse(saved);
    }

    public void delete(Long id) {
        TeachingAssignment assignment = teachingAssignmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Teaching assignment not found"));
        Long schoolId = SecurityUtils.currentSchoolId();
        if (assignment.getSchool() == null || !schoolId.equals(assignment.getSchool().getId())) {
            throw new ResourceNotFoundException("Teaching assignment not found");
        }
        teachingAssignmentRepository.delete(assignment);
    }

    public List<TeachingAssignmentResponse> listAll() {
        return teachingAssignmentRepository.findBySchoolId(SecurityUtils.currentSchoolId())
                .stream().map(this::toResponse).toList();
    }

    public List<TeachingAssignmentResponse> listMine() {
        Teacher teacher = teacherRepository.findByUsername(SecurityUtils.currentUsername())
                .orElseThrow(() -> new ResourceNotFoundException("Teacher profile not found"));
        return teachingAssignmentRepository.findByTeacherId(teacher.getId())
                .stream().map(this::toResponse).toList();
    }

    /** Admin: any subject/class at this school. Teacher: only if assigned to that pair. */
    public ClassSection assertCanEnterMarks(Long classSectionId, Long subjectId) {
        Long schoolId = SecurityUtils.currentSchoolId();
        ClassSection section = ownedSection(classSectionId, schoolId);
        ownedSubject(subjectId, schoolId);

        if (SecurityUtils.currentUserHasRole("ADMIN")) {
            return section;
        }

        Teacher teacher = teacherRepository.findByUsername(SecurityUtils.currentUsername())
                .orElseThrow(() -> new ResourceNotFoundException("Teacher profile not found"));

        boolean assigned = teachingAssignmentRepository
                .existsByClassSectionIdAndSubjectIdAndTeacherId(classSectionId, subjectId, teacher.getId());
        if (!assigned) {
            throw new AccessDeniedException(
                    "You are not assigned to teach this subject in this class");
        }
        return section;
    }

    private Teacher ownedTeacher(Long id, Long schoolId) {
        Teacher teacher = teacherRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Teacher not found"));
        if (teacher.getSchool() == null || !schoolId.equals(teacher.getSchool().getId())) {
            throw new ResourceNotFoundException("Teacher not found");
        }
        return teacher;
    }

    private Subject ownedSubject(Long id, Long schoolId) {
        Subject subject = subjectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Subject not found"));
        if (subject.getSchool() == null || !schoolId.equals(subject.getSchool().getId())) {
            throw new ResourceNotFoundException("Subject not found");
        }
        return subject;
    }

    private ClassSection ownedSection(Long id, Long schoolId) {
        ClassSection section = classSectionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Class section not found"));
        if (section.getSchool() == null || !schoolId.equals(section.getSchool().getId())) {
            throw new ResourceNotFoundException("Class section not found");
        }
        return section;
    }

    private TeachingAssignmentResponse toResponse(TeachingAssignment a) {
        return TeachingAssignmentResponse.builder()
                .id(a.getId())
                .teacherId(a.getTeacher().getId())
                .teacherName(a.getTeacher().getFirstName() + " " + a.getTeacher().getLastName())
                .subjectId(a.getSubject().getId())
                .subjectName(a.getSubject().getName())
                .classSectionId(a.getClassSection().getId())
                .classSectionName(a.getClassSection().getName())
                .build();
    }
}