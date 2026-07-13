package com.stanford.schoolbackend.sms.library;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "books")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
public class Book {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    private String author;

    @Column(unique = true)
    private String isbn; // optional — Postgres allows multiple NULLs under a unique constraint

    private String publisher;
}