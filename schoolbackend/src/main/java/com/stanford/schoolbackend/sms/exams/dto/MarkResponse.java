package com.stanford.schoolbackend.sms.exams.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class MarkResponse {
    private Long id;
    private Long studentId;
    private String studentName;
    private Long subjectId;
    private String subjectName;
    private Double score;
    private Double maxScore;
    private Double percentage;
    private String grade;
}