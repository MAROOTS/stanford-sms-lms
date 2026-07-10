package com.stanford.schoolbackend.sms.exams.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class StudentExamResultResponse {
    private Long studentId;
    private String studentName;
    private Long classSectionId;
    private String classSectionName;
    private List<MarkResponse> subjectResults;
    private Double totalScore;
    private Double totalMaxScore;
    private Double meanPercentage;
    private String overallGrade;
    private int position;
    private int outOf;
}