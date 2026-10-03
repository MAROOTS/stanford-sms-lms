package com.stanford.schoolbackend.core.platform;

import com.stanford.schoolbackend.core.enums.SchoolStatus;
import com.stanford.schoolbackend.core.enums.UserRole;
import com.stanford.schoolbackend.core.leads.ContactInquiryRepository;
import com.stanford.schoolbackend.core.platform.dto.PlatformInsightsResponse;
import com.stanford.schoolbackend.core.school.SchoolRepository;
import com.stanford.schoolbackend.core.user.UserRepository;
import com.stanford.schoolbackend.sms.communication.CommunicationCampaign;
import com.stanford.schoolbackend.sms.communication.CommunicationCampaignRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.YearMonth;
import java.time.ZoneId;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PlatformInsightsService {

    private static final ZoneId ZONE = ZoneId.of("Africa/Nairobi");

    private final SchoolRepository schoolRepository;
    private final UserRepository userRepository;
    private final CommunicationCampaignRepository campaignRepository;
    private final ContactInquiryRepository contactInquiryRepository;

    @Transactional(readOnly = true)
    public PlatformInsightsResponse overview() {
        Instant monthStart = YearMonth.now(ZONE).atDay(1).atStartOfDay(ZONE).toInstant();

        long active = schoolRepository.countByStatus(SchoolStatus.ACTIVE);
        long suspended = schoolRepository.countByStatus(SchoolStatus.SUSPENDED);
        long createdThisMonth = schoolRepository.countByCreatedAtAfter(monthStart);

        int smsSent = 0;
        int smsFailed = 0;
        for (CommunicationCampaign c : campaignRepository.findByCreatedAtAfter(monthStart)) {
            smsSent += c.getSentCount();
            smsFailed += c.getFailedCount();
        }

        long leadsThisMonth = contactInquiryRepository.countBySubmittedAtAfter(monthStart);
        return PlatformInsightsResponse.builder()
                .schoolsTotal(active + suspended)
                .schoolsActive(active)
                .schoolsSuspended(suspended)
                .schoolsCreatedThisMonth(createdThisMonth)
                .studentsTotal(userRepository.countByRole(UserRole.STUDENT))
                .teachersTotal(userRepository.countByRole(UserRole.TEACHER))
                .leadsThisMonth(leadsThisMonth)
                .smsSentThisMonth(smsSent)
                .smsFailedThisMonth(smsFailed)
                .schoolsByStatus(List.of(
                        PlatformInsightsResponse.NamedCount.builder().name("Active").count(active).build(),
                        PlatformInsightsResponse.NamedCount.builder().name("Suspended").count(suspended).build()
                ))
                .build();
    }
}