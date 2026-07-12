package com.stanford.schoolbackend.sms.fees;

import jakarta.persistence.*;
import lombok.*;

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
}