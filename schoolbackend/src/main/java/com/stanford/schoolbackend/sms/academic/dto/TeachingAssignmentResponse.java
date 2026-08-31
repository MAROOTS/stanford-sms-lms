package com.stanford.schoolbackend.sms.academic.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class TeachingAssignmentResponse {
    private Long id;
    private Long teacherId;
    private String teacherName;
    private Long subjectId;
    private String subjectName;
    private Long classSectionId;
    private String classSectionName;
}