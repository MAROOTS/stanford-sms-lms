package com.stanford.schoolbackend.sms.communication.dto;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data @Builder
public class CampaignPreviewResponse {
    private int recipientCount;
    private int skippedNoPhone;
    private List<String> sample; // masked, max 5
    private String exampleMessage;
}