package com.stanford.schoolbackend.sms.student.dto;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class ImportCommitResponse {
    private List<ImportedCredential> created;
    private List<ImportRowResult> skipped;
}