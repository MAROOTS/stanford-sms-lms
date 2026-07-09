package com.stanford.schoolbackend.sms.academic.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ClassSectionResponse {
    private Long id;
    private String name;
    private Long gradeLevelId;
    private String gradeLevelName;
    private String gradeLevelStage;
    private Long homeroomTeacherId;
    private String homeroomTeacherName;
}