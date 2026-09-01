package com.stanford.schoolbackend.sms.student.dto;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class ImportValidationResponse {
    private List<ImportRowResult> rows;
    private int validCount;
    private int invalidCount;
}