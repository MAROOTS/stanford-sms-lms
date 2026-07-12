package com.stanford.schoolbackend.sms.fees;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "fee_payments")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
public class FeePayment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "invoice_id", nullable = false)
    private FeeInvoice invoice;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    @Column(nullable = false)
    private String method; // free text, e.g. "M-Pesa", "Bank Transfer"

    @Column(nullable = false)
    private LocalDate paymentDate;

    private String reference; // optional, e.g. M-Pesa transaction code
}