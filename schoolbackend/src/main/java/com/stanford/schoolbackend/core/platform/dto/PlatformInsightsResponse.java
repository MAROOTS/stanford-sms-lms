package com.stanford.schoolbackend.core.platform.dto;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class PlatformInsightsResponse {

    private long schoolsTotal;
    private long schoolsActive;
    private long schoolsSuspended;
    private long schoolsCreatedThisMonth;

    private long studentsTotal;
    private long teachersTotal;

    private long leadsThisMonth;

    private int smsSentThisMonth;
    private int smsFailedThisMonth;

    private List<NamedCount> schoolsByStatus;

    @Getter
    @Builder
    public static class NamedCount {
        private String name;
        private long count;
    }
}