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
        boolean isTeacher = SecurityUtils.currentUserHasRole("TEACHER");
        boolean isStudent = SecurityUtils.currentUserHasRole("STUDENT");

        if (isTeacher && !isAdmin) {
            Teacher teacher = teacherRepository.findByEmail(SecurityUtils.currentUserEmail())
                    .orElseThrow(() -> new ResourceNotFoundException("Teacher profile not found"));
            boolean isHomeroomTeacher = student.getClassSection() != null
                    && student.getClassSection().getHomeroomTeacher() != null
                    && student.getClassSection().getHomeroomTeacher().getId().equals(teacher.getId());
            if (!isHomeroomTeacher) {
                throw new AccessDeniedException("You can only view students in your homeroom class");
            }
        } else if (isStudent && !isAdmin) {
            if (!student.getEmail().equals(SecurityUtils.currentUserEmail())) {
                throw new AccessDeniedException("You can only view your own profile");
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
        student.setMiddleName(request.getMiddleName());
        student.setLastName(request.getLastName());
        student.setEmail(request.getEmail());
        student.setRollNumber(request.getRollNumber());
        student.setAdmissionNumber(request.getAdmissionNumber());
        student.setDateOfBirth(request.getDateOfBirth());
        student.setGender(request.getGender());
        student.setNationality(request.getNationality());
        student.setReligion(request.getReligion());
        student.setAddress(request.getAddress());
        student.setCity(request.getCity());
        student.setStateProvince(request.getStateProvince());
        student.setPostalCode(request.getPostalCode());
        student.setCountry(request.getCountry());
        student.setPhoneNumber(request.getPhoneNumber());
        student.setGuardianName(request.getGuardianName());
        student.setGuardianRelationship(request.getGuardianRelationship());
        student.setGuardianEmail(request.getGuardianEmail());
        student.setGuardianPhone(request.getGuardianPhone());
        student.setEmergencyContactName(request.getEmergencyContactName());
        student.setEmergencyContactPhone(request.getEmergencyContactPhone());
        student.setBloodGroup(request.getBloodGroup());
        student.setMedicalNotes(request.getMedicalNotes());
        student.setEnrollmentDate(request.getEnrollmentDate());
        student.setPreviousSchool(request.getPreviousSchool());
        student.setPhotoUrl(request.getPhotoUrl());

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
                .middleName(s.getMiddleName())
                .lastName(s.getLastName())
                .email(s.getEmail())
                .rollNumber(s.getRollNumber())
                .admissionNumber(s.getAdmissionNumber())
                .classSectionId(s.getClassSection() != null ? s.getClassSection().getId() : null)
                .classSectionName(s.getClassSection() != null ? s.getClassSection().getName() : null)
                .gradeLevelName(s.getClassSection() != null ? s.getClassSection().getGradeLevel().getName() : null)
                .dateOfBirth(s.getDateOfBirth())
                .gender(s.getGender())
                .nationality(s.getNationality())
                .religion(s.getReligion())
                .address(s.getAddress())
                .city(s.getCity())
                .stateProvince(s.getStateProvince())
                .postalCode(s.getPostalCode())
                .country(s.getCountry())
                .phoneNumber(s.getPhoneNumber())
                .guardianName(s.getGuardianName())
                .guardianRelationship(s.getGuardianRelationship())
                .guardianEmail(s.getGuardianEmail())
                .guardianPhone(s.getGuardianPhone())
                .emergencyContactName(s.getEmergencyContactName())
                .emergencyContactPhone(s.getEmergencyContactPhone())
                .bloodGroup(s.getBloodGroup())
                .medicalNotes(s.getMedicalNotes())
                .enrollmentDate(s.getEnrollmentDate())
                .enrollmentStatus(s.getEnrollmentStatus() != null ? s.getEnrollmentStatus().name() : null)
                .previousSchool(s.getPreviousSchool())
                .photoUrl(s.getPhotoUrl())
                .build();
    }
}