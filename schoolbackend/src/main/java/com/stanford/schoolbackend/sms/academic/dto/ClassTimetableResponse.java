package com.stanford.schoolbackend.sms.academic.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class ClassTimetableResponse {
    private Long classSectionId;
    private String classSectionName;
    private List<TimetablePeriodResponse> periods;
    private List<TimetableSlotResponse> slots;
}
