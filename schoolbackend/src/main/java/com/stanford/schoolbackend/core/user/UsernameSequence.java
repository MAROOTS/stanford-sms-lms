package com.stanford.schoolbackend.core.user;

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

    @Column(nullable = false, unique = true)
    private String sequenceKey;

    @Builder.Default
    private int lastValue = 0;
}