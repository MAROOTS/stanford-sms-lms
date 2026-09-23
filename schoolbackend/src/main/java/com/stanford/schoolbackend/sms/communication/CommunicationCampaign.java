package com.stanford.schoolbackend.sms.communication;

import com.stanford.schoolbackend.core.enums.CampaignAudience;
import com.stanford.schoolbackend.core.enums.CampaignStatus;
import com.stanford.schoolbackend.core.school.School;
import com.stanford.schoolbackend.core.user.User;
import com.stanford.schoolbackend.sms.academic.ClassSection;
import com.stanford.schoolbackend.sms.academic.GradeLevel;
import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;

@Entity
@Table(name = "communication_campaigns")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CommunicationCampaign {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "school_id", nullable = false)
    private School school;

    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "created_by_id")
    private User createdBy;

    @Column(nullable = false) private String title;
    @Column(nullable = false, columnDefinition = "TEXT") private String body;

    @Enumerated(EnumType.STRING) @Column(nullable = false)
    private CampaignAudience audience;

    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "class_section_id")
    private ClassSection classSection;

    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "grade_level_id")
    private GradeLevel gradeLevel;

    @Builder.Default private int recipientCount = 0;
    @Builder.Default private int sentCount = 0;
    @Builder.Default private int failedCount = 0;
    @Builder.Default private int skippedCount = 0;

    @Enumerated(EnumType.STRING) @Column(nullable = false)
    private CampaignStatus status;

    @Builder.Default private Instant createdAt = Instant.now();
    private Instant sentAt;
}