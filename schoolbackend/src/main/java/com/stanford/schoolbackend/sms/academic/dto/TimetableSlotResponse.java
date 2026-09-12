package com.stanford.schoolbackend.sms.academic.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class TimetableSlotResponse {
    private Long id;
    private int dayOfWeek;
    private Long periodId;
    private Long teachingAssignmentId;
    private String subjectName;
    private String teacherName;
    private String room;
    private String classSectionName;
}
