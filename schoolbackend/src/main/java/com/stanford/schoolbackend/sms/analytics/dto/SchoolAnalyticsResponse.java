package com.stanford.schoolbackend.sms.analytics.dto;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Builder
public class SchoolAnalyticsResponse {

    private String termName;
    private long students;
    private long teachers;

    private BigDecimal billed;
    private BigDecimal collected;
    private BigDecimal outstanding;

    private int smsSent;
    private int smsFailed;

    private long activeLoans;
    private long overdueLoans;

    private List<NamedCount> enrolmentByGrade;
    private List<MonthlyAmount> collectionMonthly;

    @Getter
    @Builder
    public static class NamedCount {
        private String name;
        private long count;
    }

    @Getter
    @Builder
    public static class MonthlyAmount {
        private String label;
        private BigDecimal amount;
    }
}