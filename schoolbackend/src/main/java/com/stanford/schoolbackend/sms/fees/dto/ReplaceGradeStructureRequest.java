package com.stanford.schoolbackend.sms.fees.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
public class ReplaceGradeStructureRequest {
    @NotNull
    @Valid
    private List<FeeStructureLineRequest> lines = new ArrayList<>();
}