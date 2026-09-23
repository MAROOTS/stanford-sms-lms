package com.stanford.schoolbackend.sms.communication;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CommunicationCampaignRepository extends JpaRepository<CommunicationCampaign,Long> {
    List<CommunicationCampaign> findBySchoolIdOrderByCreatedAtDesc(Long schoolId);
}
