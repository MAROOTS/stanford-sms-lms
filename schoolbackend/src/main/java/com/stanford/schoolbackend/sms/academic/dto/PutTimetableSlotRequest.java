package com.stanford.schoolbackend.sms.academic.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class PutTimetableSlotRequest {
    @NotNull
    private Integer dayOfWeek;      // 1–5
    @NotNull private Long periodId;
    private Long teachingAssignmentId;       // null = clear / leave empty
    private String room;
}
