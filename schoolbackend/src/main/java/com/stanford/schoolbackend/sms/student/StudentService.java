package com.stanford.schoolbackend.sms.student;

import com.stanford.schoolbackend.core.exception.EmailAlreadyExistsException;
import com.stanford.schoolbackend.core.exception.ResourceNotFoundException;
import com.stanford.schoolbackend.core.security.SecurityUtils;
import com.stanford.schoolbackend.core.storage.FileStorageService;
import com.stanford.schoolbackend.core.user.UserRepository;
import com.stanford.schoolbackend.sms.academic.ClassSection;
import com.stanford.schoolbackend.sms.academic.ClassSectionRepository;
import com.stanford.schoolbackend.sms.academic.dto.AssignSectionRequest;
import com.stanford.schoolbackend.sms.parent.ParentAccessService;
import com.stanford.schoolbackend.sms.student.dto.StudentResponse;
import com.stanford.schoolbackend.sms.student.dto.StudentUpdateRequest;
import com.stanford.schoolbackend.sms.teacher.Teacher;
import com.stanford.schoolbackend.sms.teacher.TeacherRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class StudentService {

    private final StudentRepository studentRepository;
    private final ClassSectionRepository classSectionRepository;
    private final UserRepository userRepository;
    private final TeacherRepository teacherRepository;
    private final ParentAccessService parentAccessService;
    private final FileStorageService fileStorageService;

    private static final Set<String> PHOTO_TYPES = Set.of(
            "image/jpeg", "image/png", "image/webp"
    );
    private static final long MAX_PHOTO_BYTES = 2 * 1024 * 1024;
    public void assignSection(Long studentId, AssignSectionRequest request) {
        Student student = getOwnedOrThrow(studentId);

        ClassSection section = classSectionRepository.findById(request.getClassSectionId())
                .orElseThrow(() -> new ResourceNotFoundException("Class section not found"));

        student.setClassSection(section);
        studentRepository.save(student);
    }

    public List<StudentResponse> listAll(Long classSectionId) {
        Long schoolId = SecurityUtils.currentSchoolId();
        boolean isAdmin = SecurityUtils.currentUserHasRole("ADMIN");
        boolean isLibrarianOrAccountant = SecurityUtils.currentUserHasRole("LIBRARIAN")
                || SecurityUtils.currentUserHasRole("ACCOUNTANT");

        List<Student> baseList;

        if (isAdmin || isLibrarianOrAccountant) {
            baseList = (classSectionId != null)
                    ? studentRepository.findByClassSectionId(classSectionId)
                    : studentRepository.findBySchoolId(schoolId);
        } else if (SecurityUtils.currentUserHasRole("TEACHER")) {
            Teacher teacher = teacherRepository.findByUsername(SecurityUtils.currentUsername())
                    .orElseThrow(() -> new ResourceNotFoundException("Teacher profile not found"));

            List<Long> homeroomSectionIds = classSectionRepository.findByHomeroomTeacherId(teacher.getId())
                    .stream().map(ClassSection::getId).toList();

            if (homeroomSectionIds.isEmpty()) return List.of();

            if (classSectionId != null) {
                // a teacher can only ever narrow within their own homeroom(s), never widen beyond it
                if (!homeroomSectionIds.contains(classSectionId)) return List.of();
                baseList = studentRepository.findByClassSectionId(classSectionId);
            } else {
                baseList = studentRepository.findByClassSectionIdIn(homeroomSectionIds);
            }

        } else {
            baseList = List.of();
        }

        return baseList.stream().map(this::toResponse).toList();
    }

    public StudentResponse getById(Long studentId) {
        Student student = getOwnedOrThrow(studentId);

        boolean isAdmin = SecurityUtils.currentUserHasRole("ADMIN");
        boolean isTeacher = SecurityUtils.currentUserHasRole("TEACHER");
        boolean isStudent = SecurityUtils.currentUserHasRole("STUDENT");

        if (isTeacher && !isAdmin) {
            Teacher teacher = teacherRepository.findByUsername(SecurityUtils.currentUsername())
                    .orElseThrow(() -> new ResourceNotFoundException("Teacher profile not found"));
            boolean isHomeroomTeacher = student.getClassSection() != null
                    && student.getClassSection().getHomeroomTeacher() != null
                    && student.getClassSection().getHomeroomTeacher().getId().equals(teacher.getId());
            if (!isHomeroomTeacher) {
                throw new AccessDeniedException("You can only view students in your homeroom class");
            }
        } else if (isStudent && !isAdmin) {
            if (!student.getUsername().equals(SecurityUtils.currentUsername())) {
                throw new AccessDeniedException("You can only view your own profile");
            }
        }  else if (!isAdmin && SecurityUtils.currentUserHasRole("PARENT")) {
        if (!parentAccessService.isCurrentUserParentOf(studentId)) {
            throw new AccessDeniedException("You can only view your own children");
        }
    }

        return toResponse(student);
    }

    public StudentResponse update(Long studentId, StudentUpdateRequest request) {
        Student student = getOwnedOrThrow(studentId);
        if (request.getAdmissionNumber() != null
                && !request.getAdmissionNumber().equals(student.getAdmissionNumber())
                && studentRepository.existsByAdmissionNumberAndSchoolIdAndIdNot(
                request.getAdmissionNumber(),
                SecurityUtils.currentSchoolId(),
                student.getId())) {
            throw new IllegalArgumentException("Admission number already exists at this school");
        }
        if (!student.getEmail().equalsIgnoreCase(request.getEmail())
                && userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new EmailAlreadyExistsException("Email already exists");
        }

        student.setFirstName(request.getFirstName());
        student.setLastName(request.getLastName());
        student.setEmail(request.getEmail());
        student.setAdmissionNumber(request.getAdmissionNumber());
        student.setRollNumber(request.getRollNumber());
        student.setParentContactNumber(request.getParentContactNumber());
        student.setDateOfBirth(request.getDateOfBirth());
        student.setGender(request.getGender());
        student.setNationality(request.getNationality());
        student.setReligion(request.getReligion());
        student.setAdmissionDate(request.getAdmissionDate());
        student.setBirthCertificateNo(request.getBirthCertificateNo());
        student.setAddress(request.getAddress());
        student.setGuardianName(request.getGuardianName());
        student.setGuardianPhone(request.getGuardianPhone());
        student.setGuardianEmail(request.getGuardianEmail());
        student.setGuardianRelationship(request.getGuardianRelationship());
        student.setBloodGroup(request.getBloodGroup());
        student.setAllergies(request.getAllergies());
        student.setMedicalConditions(request.getMedicalConditions());
        student.setEmergencyContactName(request.getEmergencyContactName());
        student.setEmergencyContactPhone(request.getEmergencyContactPhone());
        student.setPreviousSchool(request.getPreviousSchool());

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
        Student student = getOwnedOrThrow(studentId);

        studentRepository.delete(student);
    }

    public StudentResponse updatePhoto(Long studentId, MultipartFile file) {
        Student student = getOwnedOrThrow(studentId);
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Please choose a photo");
        }
        if (file.getSize() > MAX_PHOTO_BYTES) {
            throw new IllegalArgumentException("Photo must be 2MB or smaller");
        }
        String type = file.getContentType();
        if (type == null || !PHOTO_TYPES.contains(type)) {
            throw new IllegalArgumentException("Use a JPEG, PNG, or WebP image");
        }

        Long schoolId = SecurityUtils.currentSchoolId();
        String oldKey = student.getPhotoObjectKey();
        String newKey = fileStorageService.store(file, "photos/students/" + schoolId);
        student.setPhotoObjectKey(newKey);
        Student saved = studentRepository.save(student);
        fileStorageService.delete(oldKey);
        return toResponse(saved);
    }

    public StudentResponse deletePhoto(Long studentId) {
        Student student = getOwnedOrThrow(studentId);
        fileStorageService.delete(student.getPhotoObjectKey());
        student.setPhotoObjectKey(null);
        return toResponse(studentRepository.save(student));
    }
    private Student getOwnedOrThrow(Long studentId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));
        Long schoolId = SecurityUtils.currentSchoolId();
        if (schoolId == null || student.getSchool() == null
                || !schoolId.equals(student.getSchool().getId())) {
            throw new ResourceNotFoundException("Student not found");
        }
        return student;
    }
    private StudentResponse toResponse(Student s) {
        return StudentResponse.builder()
                .id(s.getId())
                .photoUrl(s.getPhotoObjectKey() != null
                        ? fileStorageService.getPresignedUrl(s.getPhotoObjectKey(), 24)
                        : null)
                .firstName(s.getFirstName())
                .lastName(s.getLastName())
                .email(s.getEmail())
                .admissionNumber(s.getAdmissionNumber())
                .rollNumber(s.getRollNumber())
                .parentContactNumber(s.getParentContactNumber())
                .classSectionId(s.getClassSection() != null ? s.getClassSection().getId() : null)
                .classSectionName(s.getClassSection() != null ? s.getClassSection().getName() : null)
                .gradeLevelName(s.getClassSection() != null && s.getClassSection().getGradeLevel() != null
                        ? s.getClassSection().getGradeLevel().getName() : null)
                .dateOfBirth(s.getDateOfBirth())
                .gender(s.getGender())
                .nationality(s.getNationality())
                .religion(s.getReligion())
                .admissionDate(s.getAdmissionDate())
                .birthCertificateNo(s.getBirthCertificateNo())
                .address(s.getAddress())
                .guardianName(s.getGuardianName())
                .guardianPhone(s.getGuardianPhone())
                .guardianEmail(s.getGuardianEmail())
                .guardianRelationship(s.getGuardianRelationship())
                .bloodGroup(s.getBloodGroup())
                .allergies(s.getAllergies())
                .medicalConditions(s.getMedicalConditions())
                .emergencyContactName(s.getEmergencyContactName())
                .emergencyContactPhone(s.getEmergencyContactPhone())
                .previousSchool(s.getPreviousSchool())
                .build();
    }
}