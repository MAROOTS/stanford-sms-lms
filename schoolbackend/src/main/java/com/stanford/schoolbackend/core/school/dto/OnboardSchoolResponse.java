package com.stanford.schoolbackend.core.school.dto;

import lombok.Builder;
import lombok.Data;
@Data
@Builder
public class OnboardSchoolResponse {

        private Long schoolId;
        private String schoolName;
        private String adminUsername;
        private String adminTemporaryPassword;
    }

