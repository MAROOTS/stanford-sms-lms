package com.stanford.schoolbackend.core.school.dto;

import com.stanford.schoolbackend.core.enums.SchoolStatus;
import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
public class SchoolResponse {
    private Long id;
    private String name;
    private String slug;
    private SchoolStatus status;
    private Instant createdAt;
    private long studentCount;
    private long teacherCount;
}
