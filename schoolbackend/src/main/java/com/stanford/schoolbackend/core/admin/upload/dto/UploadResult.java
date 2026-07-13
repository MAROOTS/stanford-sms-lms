package com.stanford.schoolbackend.core.admin.upload.dto;

import lombok.Builder;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
@Builder
public class UploadResult {
    private int totalRows;
    private int successCount;
    private int errorCount;
    @Builder.Default
    private List<RowError> errors = new ArrayList<>();

    @Data
    @Builder
    public static class RowError {
        private int row;
        private String message;
    }
}
