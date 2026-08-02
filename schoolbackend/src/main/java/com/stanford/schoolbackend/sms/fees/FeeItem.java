package com.stanford.schoolbackend.sms.fees;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "fee_items")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
public class FeeItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name; // e.g. "Tuition", "Transport", "Lunch"

    @Column(name = "default_amount", precision = 12, scale = 2)
    private BigDecimal defaultAmount;
}