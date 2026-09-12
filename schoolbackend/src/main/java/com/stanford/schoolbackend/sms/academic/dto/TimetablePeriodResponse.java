package com.stanford.schoolbackend.sms.academic.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.Data;

import java.time.LocalTime;

@Data
@Builder
public class TimetablePeriodResponse {
    private Long id;
    @NotBlank
    private String name;
    @NotNull
    private Integer sortOrder;
    @NotNull private LocalTime startTime; // "08:00"
    @NotNull private LocalTime endTime;
    private boolean breakPeriod;
}
