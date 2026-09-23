package com.stanford.schoolbackend.sms.communication.dto;

import com.stanford.schoolbackend.core.enums.CampaignAudience;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CampaignRequest {
    @NotBlank private String title;
    @NotBlank private String body;
    @NotNull private CampaignAudience audience;
    private Long classSectionId;
    private Long gradeLevelId;
}