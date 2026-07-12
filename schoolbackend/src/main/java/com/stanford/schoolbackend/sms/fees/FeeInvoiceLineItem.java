package com.stanford.schoolbackend.sms.fees;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "fee_invoice_line_items")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
public class FeeInvoiceLineItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "invoice_id", nullable = false)
    private FeeInvoice invoice;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "fee_item_id", nullable = false)
    private FeeItem feeItem;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;
}