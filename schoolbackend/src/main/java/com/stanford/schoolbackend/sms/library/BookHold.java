package com.stanford.schoolbackend.sms.library;

import com.stanford.schoolbackend.core.user.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "book_holds")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
public class BookHold {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "book_id", nullable = false)
    private Book book;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "borrower_id", nullable = false)
    private User borrower;

    @Builder.Default
    private Instant requestedAt = Instant.now();

    @Builder.Default
    private boolean notified = false;

    @Builder.Default
    private boolean fulfilled = false;
}