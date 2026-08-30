package com.stanford.schoolbackend.sms.library;

import com.stanford.schoolbackend.core.enums.CopyStatus;
import com.stanford.schoolbackend.core.school.School;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "book_copies",uniqueConstraints = @UniqueConstraint(columnNames = {"school_id", "copy_code"}))
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
public class BookCopy {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "school_id", nullable = false)
    private School school;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "book_id", nullable = false)
    private Book book;

    @Column(nullable = false)
    private String copyCode; // barcode / asset tag

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private CopyStatus status = CopyStatus.AVAILABLE;
}