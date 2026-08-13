package com.stanford.schoolbackend.core.leads;

import com.stanford.schoolbackend.core.enums.ContactInquiryStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "contact_inquiries")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
public class ContactInquiry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String schoolName;

    @Column(nullable = false)
    private String contactName;

    @Column(nullable = false)
    private String email;

    private String phone;

    private Integer studentCountEstimate;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String message;

    private String ipAddress;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private ContactInquiryStatus status = ContactInquiryStatus.NEW;

    @Builder.Default
    private Instant submittedAt = Instant.now();
}