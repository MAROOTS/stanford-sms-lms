package com.stanford.schoolbackend.sms.academic;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "subjects")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
public class Subject {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name; // e.g. "Mathematics"

    private String code; // optional short code, e.g. "MATH"
}