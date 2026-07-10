package com.stanford.schoolbackend.sms.academic.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class SubjectResponse {
    private Long id;
    private String name;
    private String code;
}