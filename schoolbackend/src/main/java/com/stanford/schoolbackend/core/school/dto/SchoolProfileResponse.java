package com.stanford.schoolbackend.core.school.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class SchoolProfileResponse {
    private String name;
    private String logoUrl;
    private String address;
    private String contactEmail;
    private String contactPhone;
    private String brandColor;
}