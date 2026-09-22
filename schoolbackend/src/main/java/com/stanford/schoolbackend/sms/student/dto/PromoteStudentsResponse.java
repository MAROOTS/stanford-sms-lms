package com.stanford.schoolbackend.sms.student.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PromoteStudentsResponse {
    private int moved;
    private String fromClassName;
    private String toClassName;
}