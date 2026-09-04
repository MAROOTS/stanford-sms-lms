package com.stanford.schoolbackend.sms.parent;

import com.stanford.schoolbackend.core.enums.UserRole;
import com.stanford.schoolbackend.core.exception.EmailAlreadyExistsException;
import com.stanford.schoolbackend.core.exception.ResourceNotFoundException;
import com.stanford.schoolbackend.core.school.School;
import com.stanford.schoolbackend.core.school.SchoolRepository;
import com.stanford.schoolbackend.core.security.SecurePasswordGenerator;
import com.stanford.schoolbackend.core.security.SecurityUtils;
import com.stanford.schoolbackend.core.user.UserRepository;
import com.stanford.schoolbackend.core.user.UsernameGeneratorService;
import com.stanford.schoolbackend.sms.parent.dto.GuardianLinkResult;
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
    private final ParentStudentLinkRepository parentStudentLinkRepository;
    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final PasswordEncoder passwordEncoder;
    private final UsernameGeneratorService usernameGeneratorService;
    private final SecurePasswordGenerator securePasswordGenerator;
    private final SchoolRepository schoolRepository;

    @Transactional(readOnly = true)
    public List<ParentResponse> getAllParents() {
        return parentRepository.findBySchoolId(SecurityUtils.currentSchoolId()).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());    }

    @Transactional(readOnly = true)
    public ParentResponse getParentById(Long id) {
        Parent parent =getOwnedOrThrow(id);

        return toResponse(parent);
    }

    @Transactional
    public ParentResponse createParent(ParentRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new EmailAlreadyExistsException("Email already exists");
        }
        Long currentSchoolId = SecurityUtils.currentSchoolId();
        School school = currentSchoolId != null
                ? schoolRepository.findById(currentSchoolId).orElseThrow(() -> new ResourceNotFoundException("School not found"))
                : null;

        String username = usernameGeneratorService.generateUsername(UserRole.PARENT, school.getId());
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
                .school(school)
                .build();

        parent = parentRepository.save(parent);

        if (request.getStudentIds() != null && !request.getStudentIds().isEmpty()) {

            String relationship = request.getRelationship() != null ? request.getRelationship() : "GUARDIAN";
            boolean isPrimary = Boolean.TRUE.equals(request.getIsPrimary());
            for (Long studentId : request.getStudentIds()) {
                Student student = studentRepository.findById(studentId)
                        .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + studentId));

                if (!SecurityUtils.currentSchoolId().equals(student.getSchool().getId())) {
                    throw new ResourceNotFoundException("Student not found with id: " + studentId);
                }

                parentStudentLinkRepository.save(ParentStudentLink.builder()
                        .parent(parent).student(student)
                        .relationship(relationship).primary(isPrimary)
                        .build());
            }
        }

        ParentResponse response = toResponse(parent);
        response.setTemporaryPassword(tempPassword);
        return response;
    }

    @Transactional
    public ParentResponse updateParent(Long id, ParentRequest request) {
        Parent parent = getOwnedOrThrow(id);

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
        Parent parent = getOwnedOrThrow(id);
        parentStudentLinkRepository.deleteAll(parentStudentLinkRepository.findByParentId(id));
        parentRepository.delete(parent);
    }

    @Transactional
    public ParentResponse linkChild(Long parentId, Long studentId, String relationship, boolean isPrimary) {
        Parent parent = getOwnedOrThrow(parentId);
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + studentId));

        if (!SecurityUtils.currentSchoolId().equals(student.getSchool().getId())) {
            throw new ResourceNotFoundException("Student not found with id: " + studentId);
        }
        if (parentStudentLinkRepository.existsByParentIdAndStudentId(parentId, studentId)) {
            throw new IllegalArgumentException("This student is already linked to this parent");
        }

        parentStudentLinkRepository.save(ParentStudentLink.builder()
                .parent(parent).student(student)
                .relationship(relationship).primary(isPrimary)
                .build());

        return toResponse(parent);
    }

    @Transactional
    public ParentResponse unlinkChild(Long parentId, Long studentId) {
        Parent parent = getOwnedOrThrow(parentId);
        parentStudentLinkRepository.findByParentIdAndStudentId(parentId, studentId)
                .ifPresent(parentStudentLinkRepository::delete);
        return toResponse(parent);
    }

    @Transactional(readOnly = true)
    public List<ParentResponse.ChildSummary> getMyChildren(Long parentId) {
        getOwnedOrThrow(parentId);
        return parentStudentLinkRepository.findByParentId(parentId).stream()
                .map(link -> toChildSummary(link.getStudent(), link))
                .collect(Collectors.toList());
    }


    private Parent getOwnedOrThrow(Long id) {
        Parent parent = parentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Parent not found with id: " + id));
        Long schoolId = SecurityUtils.currentSchoolId();
        if (schoolId == null || parent.getSchool() == null
                || !schoolId.equals(parent.getSchool().getId())) {
            throw new ResourceNotFoundException("Parent not found with id: " + id);
        }
        return parent;
    }
    /**
     * Find or create a parent for this guardian email and link the student.
     * Skips if email is blank, or already used as the student's own login.
     */
    @Transactional
    public java.util.Optional<GuardianLinkResult> ensureGuardianLinked(
            Student student,
            String guardianEmail,
            String guardianName,
            String relationship,
            String phone) {

        if (guardianEmail == null || guardianEmail.isBlank()) {
            return java.util.Optional.empty();
        }
        String email = guardianEmail.trim();
        if (student.getEmail() != null && email.equalsIgnoreCase(student.getEmail())) {
            return java.util.Optional.empty();
        }

        Long schoolId = SecurityUtils.currentSchoolId();
        School school = schoolRepository.findById(schoolId)
                .orElseThrow(() -> new ResourceNotFoundException("School not found"));

        String rel = (relationship != null && !relationship.isBlank())
                ? relationship.trim()
                : "GUARDIAN";

        java.util.Optional<com.stanford.schoolbackend.core.user.User> existing = userRepository.findByEmail(email);
        Parent parent;
        String tempPassword = null;
        boolean created = false;

        if (existing.isPresent()) {
            com.stanford.schoolbackend.core.user.User user = existing.get();
            if (user.getRole() != UserRole.PARENT) {
                return java.util.Optional.empty();
            }
            parent = parentRepository.findById(user.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Parent not found"));
            if (parent.getSchool() == null || !schoolId.equals(parent.getSchool().getId())) {
                return java.util.Optional.empty();
            }
        } else {
            String[] names = splitName(guardianName, student);
            tempPassword = securePasswordGenerator.generate();
            parent = Parent.builder()
                    .firstName(names[0])
                    .lastName(names[1])
                    .email(email)
                    .username(usernameGeneratorService.generateUsername(UserRole.PARENT, schoolId))
                    .password(passwordEncoder.encode(tempPassword))
                    .role(UserRole.PARENT)
                    .mustChangePassword(true)
                    .alternatePhone(phone)
                    .school(school)
                    .build();
            parent = parentRepository.save(parent);
            created = true;
        }

        if (!parentStudentLinkRepository.existsByParentIdAndStudentId(parent.getId(), student.getId())) {
            parentStudentLinkRepository.save(ParentStudentLink.builder()
                    .parent(parent)
                    .student(student)
                    .relationship(rel)
                    .primary(true)
                    .build());
        }

        return java.util.Optional.of(GuardianLinkResult.builder()
                .parentId(parent.getId())
                .username(parent.getUsername())
                .temporaryPassword(tempPassword)
                .created(created)
                .build());
    }

    private String[] splitName(String guardianName, Student student) {
        if (guardianName == null || guardianName.isBlank()) {
            return new String[] { student.getFirstName() + "'s", "Parent" };
        }
        String trimmed = guardianName.trim();
        int space = trimmed.indexOf(' ');
        if (space < 0) return new String[] { trimmed, "Parent" };
        return new String[] { trimmed.substring(0, space), trimmed.substring(space + 1).trim() };
    }
    private ParentResponse toResponse(Parent parent) {
        List<ParentStudentLink> links = parentStudentLinkRepository.findByParentId(parent.getId());
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
                .children(links.stream().map(l -> toChildSummary(l.getStudent(), l)).collect(Collectors.toList()))
                .build();
    }

    private ParentResponse.ChildSummary toChildSummary(Student child, ParentStudentLink link) {
        return ParentResponse.ChildSummary.builder()
                .id(child.getId())
                .firstName(child.getFirstName())
                .lastName(child.getLastName())
                .rollNumber(child.getRollNumber())
                .admissionNumber(child.getAdmissionNumber())
                .classSectionName(child.getClassSection() != null ? child.getClassSection().getName() : null)
                .gradeLevelName(child.getClassSection() != null && child.getClassSection().getGradeLevel() != null
                        ? child.getClassSection().getGradeLevel().getName() : null)
                .relationship(link.getRelationship())
                .isPrimary(link.isPrimary())
                .build();
    }
}