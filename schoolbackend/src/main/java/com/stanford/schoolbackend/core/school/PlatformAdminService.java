package com.stanford.schoolbackend.core.school;

import com.stanford.schoolbackend.core.enums.UserRole;
import com.stanford.schoolbackend.core.exception.EmailAlreadyExistsException;
import com.stanford.schoolbackend.core.exception.ResourceNotFoundException;
import com.stanford.schoolbackend.core.security.SecurePasswordGenerator;
import com.stanford.schoolbackend.core.school.dto.*;
import com.stanford.schoolbackend.core.user.User;
import com.stanford.schoolbackend.core.user.UserRepository;
import com.stanford.schoolbackend.core.user.UsernameGeneratorService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PlatformAdminService {

    private final SchoolRepository schoolRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final UsernameGeneratorService usernameGeneratorService;
    private final SecurePasswordGenerator securePasswordGenerator;
    private final SlugGenerator slugGenerator;

    @Transactional
    public OnboardSchoolResponse onboardSchool(OnboardSchoolRequest request) {
        if (schoolRepository.findAll().stream().anyMatch(s -> s.getName().equalsIgnoreCase(request.getSchoolName()))) {
            throw new IllegalArgumentException("A school with this name already exists");
        }
        if (userRepository.findByEmail(request.getAdminEmail()).isPresent()) {
            throw new EmailAlreadyExistsException("Email already exists");
        }
        String slug = (request.getSlug() != null && !request.getSlug().isBlank())
                ? slugGenerator.generate(request.getSlug())
                : slugGenerator.generate(request.getSchoolName());

        if (schoolRepository.existsBySlug(slug)) {
            throw new IllegalArgumentException("This subdomain is already taken — please choose another");
        }

        School school = schoolRepository.save(School.builder().name(request.getSchoolName()).slug(slug).build());

        String username = usernameGeneratorService.generateUsername(UserRole.ADMIN, school.getId());
        String tempPassword = securePasswordGenerator.generate();

        User admin = User.builder()
                .firstName(request.getAdminFirstName())
                .lastName(request.getAdminLastName())
                .email(request.getAdminEmail())
                .username(username)
                .password(passwordEncoder.encode(tempPassword))
                .role(UserRole.ADMIN)
                .mustChangePassword(true)
                .school(school)
                .build();
        userRepository.save(admin);

        return OnboardSchoolResponse.builder()
                .schoolId(school.getId()).schoolName(school.getName())
                .adminUsername(username).adminTemporaryPassword(tempPassword)
                .build();
    }

    public List<SchoolResponse> listSchools() {
        return schoolRepository.findAll().stream().map(this::toResponse).toList();
    }

    public SchoolResponse updateStatus(Long schoolId, UpdateSchoolStatusRequest request) {
        School school = schoolRepository.findById(schoolId)
                .orElseThrow(() -> new ResourceNotFoundException("School not found"));
        school.setStatus(request.getStatus());
        return toResponse(schoolRepository.save(school));
    }

    private SchoolResponse toResponse(School school) {
        return SchoolResponse.builder()
                .id(school.getId()).name(school.getName()).status(school.getStatus()).createdAt(school.getCreatedAt())
                .studentCount(userRepository.countBySchoolIdAndRole(school.getId(), UserRole.STUDENT))
                .teacherCount(userRepository.countBySchoolIdAndRole(school.getId(), UserRole.TEACHER))
                .slug(school.getSlug())
                .build();
    }
}