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
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String logoObjectKey;

    @Column(columnDefinition = "TEXT")
    private String address;

    private String contactEmail;
    private String contactPhone;


    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "school_id", nullable = false, unique = true)
    private School school;
}