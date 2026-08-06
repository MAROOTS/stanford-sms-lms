package com.stanford.schoolbackend.sms.library;

import com.stanford.schoolbackend.sms.library.dto.BookHoldResponse;
import com.stanford.schoolbackend.sms.library.dto.PlaceHoldRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/library/books/{bookId}/holds")
@RequiredArgsConstructor
public class BookHoldController {

    private final BookHoldService bookHoldService;

    @PostMapping
    @PreAuthorize("hasAnyRole('LIBRARIAN','ADMIN')")
    public ResponseEntity<BookHoldResponse> placeHold(@PathVariable Long bookId, @Valid @RequestBody PlaceHoldRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(bookHoldService.placeHold(bookId, request));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('LIBRARIAN','ADMIN')")
    public ResponseEntity<List<BookHoldResponse>> listForBook(@PathVariable Long bookId) {
        return ResponseEntity.ok(bookHoldService.listForBook(bookId));
    }

    @DeleteMapping("/{holdId}")
    @PreAuthorize("hasAnyRole('LIBRARIAN','ADMIN')")
    public ResponseEntity<Void> cancelHold(@PathVariable Long bookId, @PathVariable Long holdId) {
        bookHoldService.cancelHold(holdId);
        return ResponseEntity.noContent().build();
    }
}