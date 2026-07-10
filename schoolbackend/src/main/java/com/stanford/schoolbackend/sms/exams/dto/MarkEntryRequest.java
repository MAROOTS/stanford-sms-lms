package com.stanford.schoolbackend.sms.exams.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class MarkEntryRequest {
    @NotNull(message = "examId is required")
    private Long examId;

    @NotNull(message = "subjectId is required")
    private Long subjectId;

    @NotEmpty(message = "entries cannot be empty")
    @Valid
    private List<Entry> entries;

    @Data
    public static class Entry {
        @NotNull(message = "studentId is required")
        private Long studentId;

        @NotNull(message = "score is required")
        private Double score;

        private Double maxScore; // optional, defaults to 100
    }
}