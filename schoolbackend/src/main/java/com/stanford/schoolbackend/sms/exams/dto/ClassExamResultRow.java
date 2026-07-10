package com.stanford.schoolbackend.sms.exams.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ClassExamResultRow {
    private Long studentId;
    private String studentName;
    private Double totalScore;
    private Double totalMaxScore;
    private Double meanPercentage;
    private String overallGrade;
    private int position;
    private int outOf;
}