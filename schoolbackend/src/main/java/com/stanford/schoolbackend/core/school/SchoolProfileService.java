package com.stanford.schoolbackend.core.school;

import com.stanford.schoolbackend.core.exception.ResourceNotFoundException;
import com.stanford.schoolbackend.core.school.dto.SchoolProfileResponse;
import com.stanford.schoolbackend.core.school.dto.UpdateSchoolProfileRequest;
import com.stanford.schoolbackend.core.security.SecurityUtils;
import com.stanford.schoolbackend.core.storage.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class SchoolProfileService {

    private final SchoolProfileRepository schoolProfileRepository;
    private final FileStorageService fileStorageService;
    private final SchoolRepository schoolRepository;

    public SchoolProfileResponse getProfile() {
        Long schoolId = SecurityUtils.currentSchoolId();
        return toResponse(getOrCreateForSchool(schoolId));
    }

    public SchoolProfileResponse update(UpdateSchoolProfileRequest request) {
        SchoolProfile profile = getOrCreateForSchool(SecurityUtils.currentSchoolId());
        profile.setName(request.getName());
        profile.setAddress(request.getAddress());
        profile.setContactEmail(request.getContactEmail());
        profile.setContactPhone(request.getContactPhone());
       // profile.setBrandColor(request.getBrandColor());
        return toResponse(schoolProfileRepository.save(profile));
    }



    public SchoolProfileResponse updateLogo(MultipartFile file) {
        SchoolProfile profile = getOrCreateForSchool(SecurityUtils.currentSchoolId());
        profile.setLogoObjectKey(fileStorageService.store(file, "branding"));
        return toResponse(schoolProfileRepository.save(profile));
    }

    private SchoolProfile getOrCreateForSchool(Long schoolId) {
        return schoolProfileRepository.findBySchoolId(schoolId)
                .orElseGet(() -> {
                    School school = schoolRepository.findById(schoolId)
                            .orElseThrow(() -> new ResourceNotFoundException("School not found"));
                    return schoolProfileRepository.save(
                            SchoolProfile.builder().school(school).name(school.getName()).build());
                });
    }
    public SchoolProfileResponse getProfileBySlug(String slug) {
        School school = schoolRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("School not found"));
        return toResponse(getOrCreateForSchool(school.getId()));
    }

    private SchoolProfileResponse toResponse(SchoolProfile p) {
        return SchoolProfileResponse.builder()
                .name(p.getName())
                .logoUrl(p.getLogoObjectKey() != null ? fileStorageService.getPresignedUrl(p.getLogoObjectKey(), 24) : null)
                .address(p.getAddress())
                .contactEmail(p.getContactEmail())
                .contactPhone(p.getContactPhone())
                .build();
    }
}