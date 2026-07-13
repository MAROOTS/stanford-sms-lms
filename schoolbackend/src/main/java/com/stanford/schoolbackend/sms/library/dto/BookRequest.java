package com.stanford.schoolbackend.sms.library.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class BookRequest {
    @NotBlank(message = "title is required")
    private String title;

    private String author;
    private String isbn;
    private String publisher;
}