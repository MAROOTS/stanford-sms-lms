package com.stanford.schoolbackend.sms.academic.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalTime;

@Data
public class TimetablePeriodRequest {
    @NotBlank
    private String name;
    @NotNull
    private Integer sortOrder;
    @NotNull private LocalTime startTime; // "08:00"
    @NotNull private LocalTime endTime;
    private boolean breakPeriod;
}
