package com.stanford.schoolbackend.sms.fees;

import com.stanford.schoolbackend.sms.exams.Term;
import com.stanford.schoolbackend.sms.student.Student;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "fee_invoices",
        uniqueConstraints = @UniqueConstraint(columnNames = {"student_id", "term_id"}))
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
public class FeeInvoice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "term_id", nullable = false)
    private Term term;

    @OneToMany(mappedBy = "invoice", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<FeeInvoiceLineItem> lineItems = new ArrayList<>();

    @Builder.Default
    private Instant createdAt = Instant.now();
}