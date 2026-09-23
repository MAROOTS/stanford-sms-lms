package com.stanford.schoolbackend.sms.communication;

import com.stanford.schoolbackend.core.enums.RecipientStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CommunicationRecipientRepository extends JpaRepository<CommunicationRecipient, Long> {
    List<CommunicationRecipient> findByCampaignId(Long campaignId);
    long countByCampaignIdAndStatus(Long campaignId, RecipientStatus status);
}
