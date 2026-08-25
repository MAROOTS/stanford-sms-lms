package com.stanford.schoolbackend.core.user;

import com.stanford.schoolbackend.core.school.School;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "username_sequences")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
public class UsernameSequence {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "school_id", nullable = false)
    private School school;

    @Column(nullable = false)
    private String sequenceKey;

    @Builder.Default
    private int lastValue = 0;
}