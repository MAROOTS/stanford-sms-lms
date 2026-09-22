package com.stanford.schoolbackend.sms.student.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class PromoteStudentsRequest {

    @NotNull
    private Long fromClassSectionId;

    /** Null = completed / left school (unassigned). */
    private Long toClassSectionId;

    @NotEmpty
    private List<Long> studentIds;
}