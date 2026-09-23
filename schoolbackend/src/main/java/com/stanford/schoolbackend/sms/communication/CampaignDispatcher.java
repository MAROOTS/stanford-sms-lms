package com.stanford.schoolbackend.sms.communication;

import com.stanford.schoolbackend.core.enums.CampaignStatus;
import com.stanford.schoolbackend.core.enums.RecipientStatus;
import com.stanford.schoolbackend.sms.communication.provider.AfricaTalkingSmsProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class CampaignDispatcher {

    private final CommunicationCampaignRepository campaignRepository;
    private final CommunicationRecipientRepository recipientRepository;
    private final AfricaTalkingSmsProvider smsProvider;

    @Async
    @Transactional
    public void dispatch(Long campaignId) {
        CommunicationCampaign campaign =
                campaignRepository.findById(campaignId).orElse(null);

        if (campaign == null) {
            log.warn("Campaign {} not found; skipping dispatch", campaignId);
            return;
        }

        campaign.setStatus(CampaignStatus.SENDING);
        campaignRepository.save(campaign);

        var school = campaign.getSchool();

        List<CommunicationRecipient> rows =
                recipientRepository.findByCampaignId(campaignId);

        int sent = 0;
        int failed = 0;
        String firstFailureReason = null;

        for (CommunicationRecipient row : rows) {

            String parentName = row.getParent() == null
                    ? "Parent"
                    : (
                    row.getParent().getFirstName()
                            + " "
                            + row.getParent().getLastName()
            ).trim();

            String studentName = row.getStudent() == null
                    ? "your child"
                    : (
                    row.getStudent().getFirstName()
                            + " "
                            + row.getStudent().getLastName()
            ).trim();

            String message = personalize(
                    campaign.getBody(),
                    parentName,
                    studentName,
                    school.getName()
            );

            var result = smsProvider.send(
                    row.getPhone(),
                    message
            );

            if (result.ok()) {
                row.setStatus(RecipientStatus.SENT);
                row.setProviderId(result.providerId());
                row.setSentAt(Instant.now());
                sent++;

            } else {
                row.setStatus(RecipientStatus.FAILED);
                row.setFailureReason(result.error());

                if (firstFailureReason == null) {
                    firstFailureReason = result.error();
                }

                log.warn(
                        "SMS to {} failed: {}",
                        row.getPhone(),
                        result.error()
                );

                failed++;
            }

            recipientRepository.save(row);
        }

        if (sent == 0) {
            log.error(
                    "Campaign {} sent 0/{} — {}",
                    campaignId,
                    rows.size(),
                    rows.isEmpty()
                            ? "no recipients"
                            : firstFailureReason
            );
        }

        campaign.setSentCount(sent);
        campaign.setFailedCount(failed);

        campaign.setStatus(
                failed > 0 && sent == 0
                        ? CampaignStatus.FAILED
                        : CampaignStatus.SENT
        );

        campaign.setSentAt(Instant.now());
        campaignRepository.save(campaign);
    }

    private static String personalize(
            String body,
            String parentName,
            String studentName,
            String schoolName
    ) {
        return body
                .replace(
                        "{{parentName}}",
                        parentName == null ? "" : parentName
                )
                .replace(
                        "{{studentName}}",
                        studentName == null ? "" : studentName
                )
                .replace(
                        "{{schoolName}}",
                        schoolName == null ? "" : schoolName
                );
    }
}