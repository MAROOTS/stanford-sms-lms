package com.stanford.schoolbackend.sms.exams.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class MarkSheetRow {
    private Long studentId;
    private String studentName;
    private Long markId;     // null if not yet entered
    private Double score;    // null if not yet entered
    private Double maxScore;
    private String grade;    // null if not yet entered
}