package com.stanford.schoolbackend.sms.library;

import com.stanford.schoolbackend.sms.library.dto.BookCopyResponse;
import com.stanford.schoolbackend.sms.library.dto.UpdateCopyStatusRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/library/copies")
@RequiredArgsConstructor
public class BookCopyController {

    private final BookService bookService;

    @PatchMapping("/{copyId}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BookCopyResponse> updateStatus(@PathVariable Long copyId, @Valid @RequestBody UpdateCopyStatusRequest request) {
        return ResponseEntity.ok(bookService.updateCopyStatus(copyId, request));
    }

    @DeleteMapping("/{copyId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long copyId) {
        bookService.deleteCopy(copyId);
        return ResponseEntity.noContent().build();
    }
}