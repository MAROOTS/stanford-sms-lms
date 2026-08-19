package com.stanford.schoolbackend.core.school.dto;

import com.stanford.schoolbackend.core.enums.SchoolStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateSchoolStatusRequest {
    @NotNull
    private SchoolStatus status;


}
