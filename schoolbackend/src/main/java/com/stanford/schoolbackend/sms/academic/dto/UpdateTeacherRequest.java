package com.stanford.schoolbackend.sms.academic.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateTeacherRequest {

    @NotNull
    private Long teacherId;
}