package com.stanford.schoolbackend.sms.library;

import com.stanford.schoolbackend.sms.library.dto.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/library/books")
@RequiredArgsConstructor
public class BookController {

    private final BookService bookService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BookResponse> create(@Valid @RequestBody BookRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(bookService.create(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BookResponse> update(@PathVariable Long id, @Valid @RequestBody BookRequest request) {
        return ResponseEntity.ok(bookService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        bookService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<BookResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(bookService.getById(id));
    }

    @GetMapping
    public ResponseEntity<List<BookResponse>> listAll() {
        return ResponseEntity.ok(bookService.listAll());
    }

    @PostMapping("/{bookId}/copies")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BookCopyResponse> addCopy(@PathVariable Long bookId, @Valid @RequestBody AddCopyRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(bookService.addCopy(bookId, request));
    }

    @GetMapping("/{bookId}/copies")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<BookCopyResponse>> listCopies(@PathVariable Long bookId) {
        return ResponseEntity.ok(bookService.listCopies(bookId));
    }
}