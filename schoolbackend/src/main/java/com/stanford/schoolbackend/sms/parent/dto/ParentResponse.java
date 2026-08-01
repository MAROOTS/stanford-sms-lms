package com.stanford.schoolbackend.sms.parent.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class ParentResponse {
    private Long id;
    private String email;
    private String username;
    private String firstName;
    private String lastName;
    private String role;
    private String occupation;
    private String alternatePhone;
    private String address;
    private List<ChildSummary> children;

    @Data
    @Builder
    public static class ChildSummary {
        private Long id;
        private String firstName;
        private String lastName;
        private String rollNumber;
        private String admissionNumber;
        private String classSectionName;
        private String gradeLevelName;
        private String relationship;
        private boolean isPrimary;
    }
}