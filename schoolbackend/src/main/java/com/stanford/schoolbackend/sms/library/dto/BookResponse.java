package com.stanford.schoolbackend.sms.library.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class BookResponse {
    private Long id;
    private String title;
    private String author;
    private String isbn;
    private String publisher;
    private int totalCopies;
    private int availableCopies;
}