package com.stanford.schoolbackend.sms.communication;

import com.stanford.schoolbackend.core.enums.RecipientStatus;
import com.stanford.schoolbackend.sms.parent.Parent;
import com.stanford.schoolbackend.sms.student.Student;
import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;

@Entity
@Table(name = "communication_recipients")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CommunicationRecipient {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "campaign_id", nullable = false)
    private CommunicationCampaign campaign;

    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "parent_id")
    private Parent parent;

    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "student_id")
    private Student student;

    @Column(nullable = false) private String phone;

    @Enumerated(EnumType.STRING) @Column(nullable = false)
    private RecipientStatus status;

    private String providerId;
    private String failureReason;
    private Instant sentAt;
}