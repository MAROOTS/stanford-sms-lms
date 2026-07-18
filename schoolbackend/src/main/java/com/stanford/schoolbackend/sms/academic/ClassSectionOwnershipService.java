package com.stanford.schoolbackend.sms.academic;

import com.stanford.schoolbackend.core.exception.ResourceNotFoundException;
import com.stanford.schoolbackend.core.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ClassSectionOwnershipService {

    private final ClassSectionRepository classSectionRepository;

    public ClassSection getOwnedClassSectionOrThrow(Long classSectionId) {
        ClassSection classSection = classSectionRepository.findById(classSectionId)
                .orElseThrow(() -> new ResourceNotFoundException("Class section not found"));

        boolean isAdmin = SecurityUtils.currentUserHasRole("ADMIN");
        boolean isHomeroomTeacher = classSection.getHomeroomTeacher() != null
                && classSection.getHomeroomTeacher().getEmail().equals(SecurityUtils.currentUserEmail());

        if (!isAdmin && !isHomeroomTeacher) {
            throw new AccessDeniedException("You are not the homeroom teacher for this class");
        }
        return classSection;
    }
}