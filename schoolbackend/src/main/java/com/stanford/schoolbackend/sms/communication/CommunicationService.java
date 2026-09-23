package com.stanford.schoolbackend.sms.communication;

import com.stanford.schoolbackend.core.enums.CampaignAudience;
import com.stanford.schoolbackend.core.enums.CampaignStatus;
import com.stanford.schoolbackend.core.enums.RecipientStatus;
import com.stanford.schoolbackend.core.exception.ResourceNotFoundException;
import com.stanford.schoolbackend.core.school.School;
import com.stanford.schoolbackend.core.school.SchoolRepository;
import com.stanford.schoolbackend.core.security.SecurityUtils;
import com.stanford.schoolbackend.core.user.UserRepository;
import com.stanford.schoolbackend.sms.academic.ClassSection;
import com.stanford.schoolbackend.sms.academic.ClassSectionRepository;
import com.stanford.schoolbackend.sms.academic.GradeLevel;
import com.stanford.schoolbackend.sms.academic.GradeLevelRepository;
import com.stanford.schoolbackend.sms.communication.dto.*;
import com.stanford.schoolbackend.sms.parent.Parent;
import com.stanford.schoolbackend.sms.parent.ParentStudentLink;
import com.stanford.schoolbackend.sms.parent.ParentStudentLinkRepository;
import com.stanford.schoolbackend.sms.student.Student;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import java.util.*;

@Service
@RequiredArgsConstructor
public class CommunicationService {

    private final CommunicationCampaignRepository campaignRepository;
    private final CommunicationRecipientRepository recipientRepository;
    private final ParentStudentLinkRepository linkRepository;
    private final ClassSectionRepository classSectionRepository;
    private final GradeLevelRepository gradeLevelRepository;
    private final SchoolRepository schoolRepository;
    private final UserRepository userRepository;

    private final CampaignDispatcher campaignDispatcher;

    public CampaignPreviewResponse preview(CampaignRequest request) {
        Long schoolId = SecurityUtils.currentSchoolId();

        List<Resolved> targets = resolve(schoolId, request);

        List<Resolved> withPhone = targets.stream()
                .filter(t -> t.phone != null)
                .toList();

        School school = schoolRepository.findById(schoolId)
                .orElseThrow();

        String example = withPhone.isEmpty()
                ? personalize(
                request.getBody(),
                "Jane Parent",
                "John Doe",
                school.getName()
        )
                : personalize(
                request.getBody(),
                withPhone.get(0).parentName,
                withPhone.get(0).studentName,
                school.getName()
        );

        return CampaignPreviewResponse.builder()
                .recipientCount(withPhone.size())
                .skippedNoPhone(targets.size() - withPhone.size())
                .sample(
                        withPhone.stream()
                                .limit(5)
                                .map(t -> mask(t.phone))
                                .toList()
                )
                .exampleMessage(example)
                .build();
    }

    @Transactional
    public CampaignResponse createAndSend(CampaignRequest request) {
        Long schoolId = SecurityUtils.currentSchoolId();

        School school = schoolRepository.findById(schoolId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("School not found"));

        ClassSection section = null;
        GradeLevel grade = null;

        if (request.getAudience() == CampaignAudience.CLASS) {
            if (request.getClassSectionId() == null) {
                throw new IllegalArgumentException("Choose a class");
            }

            section = classSectionRepository
                    .findById(request.getClassSectionId())
                    .orElseThrow(() ->
                            new ResourceNotFoundException("Class not found"));

            if (!schoolId.equals(section.getSchool().getId())) {
                throw new ResourceNotFoundException("Class not found");
            }
        }

        if (request.getAudience() == CampaignAudience.GRADE) {
            if (request.getGradeLevelId() == null) {
                throw new IllegalArgumentException("Choose a grade");
            }

            grade = gradeLevelRepository
                    .findById(request.getGradeLevelId())
                    .orElseThrow(() ->
                            new ResourceNotFoundException("Grade not found"));

            if (!schoolId.equals(grade.getSchool().getId())) {
                throw new ResourceNotFoundException("Grade not found");
            }
        }

        List<Resolved> targets = resolve(schoolId, request);

        List<Resolved> withPhone = targets.stream()
                .filter(t -> t.phone != null)
                .toList();

        if (withPhone.isEmpty()) {
            throw new IllegalArgumentException(
                    "No parents with a phone number in this audience"
            );
        }

        CommunicationCampaign campaign =
                campaignRepository.save(
                        CommunicationCampaign.builder()
                                .school(school)
                                .createdBy(
                                        userRepository
                                                .findByUsername(
                                                        SecurityUtils.currentUsername()
                                                )
                                                .orElse(null)
                                )
                                .title(request.getTitle().trim())
                                .body(request.getBody())
                                .audience(request.getAudience())
                                .classSection(section)
                                .gradeLevel(grade)
                                .recipientCount(withPhone.size())
                                .skippedCount(
                                        targets.size() - withPhone.size()
                                )
                                .status(CampaignStatus.QUEUED)
                                .build()
                );

        for (Resolved t : withPhone) {
            recipientRepository.save(
                    CommunicationRecipient.builder()
                            .campaign(campaign)
                            .parent(t.parent)
                            .student(t.student)
                            .phone(t.phone)
                            .status(RecipientStatus.PENDING)
                            .build()
            );
        }

        /*
         * The campaign and recipient rows are inside this transaction.
         *
         * Start the async dispatcher only AFTER the transaction commits,
         * otherwise the async transaction could start before these rows
         * become visible in the database.
         */
        Long campaignId = campaign.getId();

        TransactionSynchronizationManager.registerSynchronization(
                new TransactionSynchronization() {
                    @Override
                    public void afterCommit() {
                        campaignDispatcher.dispatch(campaignId);
                    }
                }
        );

        return toResponse(campaign);
    }

    @Transactional(readOnly = true)
    public List<CampaignResponse> list() {
        return campaignRepository
                .findBySchoolIdOrderByCreatedAtDesc(
                        SecurityUtils.currentSchoolId()
                )
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public CampaignResponse get(Long id) {
        return toResponse(owned(id));
    }

    private CommunicationCampaign owned(Long id) {
        CommunicationCampaign campaign =
                campaignRepository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Campaign not found"
                                ));

        if (!SecurityUtils.currentSchoolId()
                .equals(campaign.getSchool().getId())) {
            throw new ResourceNotFoundException(
                    "Campaign not found"
            );
        }

        return campaign;
    }

    private List<Resolved> resolve(
            Long schoolId,
            CampaignRequest request
    ) {
        List<ParentStudentLink> links =
                linkRepository.findBySchoolId(schoolId);

        return switch (request.getAudience()) {

            case ALL_PARENTS ->
                    uniqueParents(links);

            case CLASS ->
                    uniqueParents(
                            links.stream()
                                    .filter(
                                            l ->
                                                    l.getStudent()
                                                            .getClassSection() != null
                                                            && request
                                                            .getClassSectionId()
                                                            .equals(
                                                                    l.getStudent()
                                                                            .getClassSection()
                                                                            .getId()
                                                            )
                                    )
                                    .toList()
                    );

            case GRADE ->
                    uniqueParents(
                            links.stream()
                                    .filter(
                                            l ->
                                                    l.getStudent()
                                                            .getClassSection() != null
                                                            && l.getStudent()
                                                            .getClassSection()
                                                            .getGradeLevel() != null
                                                            && request
                                                            .getGradeLevelId()
                                                            .equals(
                                                                    l.getStudent()
                                                                            .getClassSection()
                                                                            .getGradeLevel()
                                                                            .getId()
                                                            )
                                    )
                                    .toList()
                    );
        };
    }

    /**
     * One SMS per parent.
     *
     * The first linked child is used for {{studentName}}.
     */
    private List<Resolved> uniqueParents(
            List<ParentStudentLink> links
    ) {
        Map<Long, Resolved> byParent = new LinkedHashMap<>();

        for (ParentStudentLink link : links) {
            Parent parent = link.getParent();

            if (parent == null
                    || byParent.containsKey(parent.getId())) {
                continue;
            }

            Student student = link.getStudent();

            String phone = firstPhone(parent, student);

            byParent.put(
                    parent.getId(),
                    new Resolved(
                            parent,
                            student,
                            phone,
                            (
                                    parent.getFirstName()
                                            + " "
                                            + parent.getLastName()
                            ).trim(),
                            student == null
                                    ? "your child"
                                    : (
                                    student.getFirstName()
                                            + " "
                                            + student.getLastName()
                            ).trim()
                    )
            );
        }

        return new ArrayList<>(byParent.values());
    }

    private static String firstPhone(
            Parent parent,
            Student student
    ) {
        String raw = parent.getAlternatePhone();

        if (isBlank(raw) && student != null) {
            raw = student.getGuardianPhone();
        }

        if (isBlank(raw) && student != null) {
            raw = student.getParentContactNumber();
        }

        return normalizeKe(raw);
    }

    static String normalizeKe(String raw) {
        if (isBlank(raw)) {
            return null;
        }

        String d = raw.replaceAll("[^0-9+]", "");

        if (d.startsWith("+")) {
            d = "+"
                    + d.substring(1).replace("+", "");
        }

        if (d.startsWith("0") && d.length() == 10) {
            d = "+254" + d.substring(1);
        } else if (d.startsWith("254") && d.length() == 12) {
            d = "+" + d;
        } else if (!d.startsWith("+") && d.length() == 9) {
            d = "+254" + d;
        }

        if (!d.matches("\\+2547\\d{8}")
                && !d.matches("\\+2541\\d{8}")) {
            return null;
        }

        return d;
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

    private static String mask(String phone) {
        if (phone == null || phone.length() < 6) {
            return "****";
        }

        return phone.substring(0, 7)
                + "****"
                + phone.substring(phone.length() - 3);
    }

    private static boolean isBlank(String s) {
        return s == null || s.isBlank();
    }

    private CampaignResponse toResponse(
            CommunicationCampaign campaign
    ) {
        return CampaignResponse.builder()
                .id(campaign.getId())
                .title(campaign.getTitle())
                .body(campaign.getBody())
                .audience(campaign.getAudience().name())
                .status(campaign.getStatus().name())
                .recipientCount(campaign.getRecipientCount())
                .sentCount(campaign.getSentCount())
                .failedCount(campaign.getFailedCount())
                .skippedCount(campaign.getSkippedCount())
                .createdAt(campaign.getCreatedAt())
                .sentAt(campaign.getSentAt())
                .build();
    }

    private record Resolved(
            Parent parent,
            Student student,
            String phone,
            String parentName,
            String studentName
    ) {
    }
}