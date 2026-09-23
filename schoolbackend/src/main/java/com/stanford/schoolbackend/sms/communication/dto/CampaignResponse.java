package com.stanford.schoolbackend.sms.communication.dto;

import lombok.Builder;
import lombok.Data;
import java.time.Instant;

@Data @Builder
public class CampaignResponse {
    private Long id;
    private String title;
    private String body;
    private String audience;
    private String status;
    private int recipientCount;
    private int sentCount;
    private int failedCount;
    private int skippedCount;
    private Instant createdAt;
    private Instant sentAt;
}