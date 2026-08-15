package com.stanford.schoolbackend.core.school;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "school_profile")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
public class SchoolProfile {

    @Id
    private Long id; // always 1L — deliberate singleton, no auto-generation

    @Column(nullable = false)
    private String name;

    private String logoObjectKey;

    @Column(columnDefinition = "TEXT")
    private String address;

    private String contactEmail;
    private String contactPhone;
}