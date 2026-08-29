package com.stanford.schoolbackend.sms.academic;

import com.stanford.schoolbackend.core.school.School;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "subjects",uniqueConstraints = @UniqueConstraint(columnNames = {"school_id", "name"}))
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
public class Subject {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "school_id", nullable = false)
    private School school;

    @Column(nullable = false)
    private String name; // e.g. "Mathematics"

    private String code; // optional short code, e.g. "MATH"
}