package com.stanford.schoolbackend.core.school;

import com.stanford.schoolbackend.core.school.dto.SchoolProfileResponse;
import com.stanford.schoolbackend.core.school.dto.UpdateSchoolProfileRequest;
import com.stanford.schoolbackend.core.storage.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class SchoolProfileService {

    private static final Long SINGLETON_ID = 1L;

    private final SchoolProfileRepository schoolProfileRepository;
    private final FileStorageService fileStorageService;

    public SchoolProfileResponse getProfile() {
        return toResponse(getOrCreateDefault());
    }

    public SchoolProfileResponse update(UpdateSchoolProfileRequest request) {
        SchoolProfile profile = getOrCreateDefault();
        profile.setName(request.getName());
        profile.setAddress(request.getAddress());
        profile.setContactEmail(request.getContactEmail());
        profile.setContactPhone(request.getContactPhone());
        return toResponse(schoolProfileRepository.save(profile));
    }

    public SchoolProfileResponse updateLogo(MultipartFile file) {
        SchoolProfile profile = getOrCreateDefault();
        profile.setLogoObjectKey(fileStorageService.store(file, "branding"));
        return toResponse(schoolProfileRepository.save(profile));
    }

    private SchoolProfile getOrCreateDefault() {
        return schoolProfileRepository.findById(SINGLETON_ID)
                .orElseGet(() -> schoolProfileRepository.save(
                        SchoolProfile.builder().id(SINGLETON_ID).name("My School").build()));
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