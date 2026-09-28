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

        /*
         * Only process recipients that have not been attempted yet.
         * This makes dispatch safe to retry without sending SMS messages
         * that were already marked SENT or FAILED.
         */
        List<CommunicationRecipient> rows =
                recipientRepository.findByCampaignId(campaignId)
                        .stream()
                        .filter(r -> r.getStatus() == RecipientStatus.PENDING)
                        .toList();

        /*
         * Nothing is pending. Recalculate the campaign state from the
         * database and finish.
         */
        if (rows.isEmpty()) {
            recount(campaign);
            return;
        }

        campaign.setStatus(CampaignStatus.SENDING);
        campaignRepository.save(campaign);

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
                    campaign.getSchool().getName()
            );

            var result = smsProvider.send(
                    row.getPhone(),
                    message
            );

            if (result.ok()) {
                row.setStatus(RecipientStatus.SENT);
                row.setProviderId(result.providerId());
                row.setSentAt(Instant.now());

                log.info(
                        "SMS sent successfully to {} for campaign {}",
                        row.getPhone(),
                        campaignId
                );

            } else {
                row.setStatus(RecipientStatus.FAILED);
                row.setFailureReason(result.error());

                log.warn(
                        "SMS to {} failed for campaign {}: {}",
                        row.getPhone(),
                        campaignId,
                        result.error()
                );
            }

            recipientRepository.save(row);
        }

        /*
         * Recalculate campaign totals from recipient rows rather than
         * relying on counters maintained during this particular dispatch.
         */
        recount(campaign);
    }

    private void recount(CommunicationCampaign campaign) {
        List<CommunicationRecipient> all =
                recipientRepository.findByCampaignId(campaign.getId());

        int sent = 0;
        int failed = 0;

        for (CommunicationRecipient recipient : all) {
            if (recipient.getStatus() == RecipientStatus.SENT) {
                sent++;
            }

            if (recipient.getStatus() == RecipientStatus.FAILED) {
                failed++;
            }
        }

        campaign.setSentCount(sent);
        campaign.setFailedCount(failed);
        campaign.setRecipientCount(all.size());

        campaign.setStatus(
                failed > 0 && sent == 0
                        ? CampaignStatus.FAILED
                        : CampaignStatus.SENT
        );

        campaign.setSentAt(Instant.now());

        campaignRepository.save(campaign);

        log.info(
                "Campaign {} recount complete: {}/{} sent, {} failed",
                campaign.getId(),
                sent,
                all.size(),
                failed
        );
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