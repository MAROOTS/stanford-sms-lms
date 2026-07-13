package com.stanford.schoolbackend.sms.library;

import com.stanford.schoolbackend.core.user.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "book_loans")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
public class BookLoan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "book_copy_id", nullable = false)
    private BookCopy bookCopy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "borrower_id", nullable = false)
    private User borrower;

    @Column(nullable = false)
    private LocalDate borrowedDate;

    @Column(nullable = false)
    private LocalDate dueDate;

    private LocalDate returnedDate; // null while still out
}