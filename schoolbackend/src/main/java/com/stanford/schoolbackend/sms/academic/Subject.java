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

    @Column(columnDefinition = "TEXT")
    private String description;

    private String category; // e.g. "Sciences", "Humanities", "Languages"

    private Integer credits; // credit hours/units
}