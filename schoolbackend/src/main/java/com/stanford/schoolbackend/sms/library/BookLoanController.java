package com.stanford.schoolbackend.sms.library;

import com.stanford.schoolbackend.sms.library.dto.BookLoanResponse;
import com.stanford.schoolbackend.sms.library.dto.IssueLoanRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/library/loans")
@RequiredArgsConstructor
public class BookLoanController {

    private final BookLoanService bookLoanService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','LIBRARIAN')")
    public ResponseEntity<BookLoanResponse> issueLoan(@Valid @RequestBody IssueLoanRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(bookLoanService.issueLoan(request));
    }

    @PostMapping("/{loanId}/return")
    @PreAuthorize("hasAnyRole('ADMIN','LIBRARIAN')")
    public ResponseEntity<BookLoanResponse> returnLoan(@PathVariable Long loanId) {
        return ResponseEntity.ok(bookLoanService.returnLoan(loanId));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','LIBRARIAN')")
    public ResponseEntity<List<BookLoanResponse>> listAll(@RequestParam(required = false) Long classSectionId) {
        return ResponseEntity.ok(bookLoanService.listAll(classSectionId));
    }

    @GetMapping("/active")
    @PreAuthorize("hasAnyRole('ADMIN','LIBRARIAN')")
    public ResponseEntity<List<BookLoanResponse>> listActive(@RequestParam(required = false) Long classSectionId) {
        return ResponseEntity.ok(bookLoanService.listActive(classSectionId));
    }

    @GetMapping("/borrower/{borrowerId}")
    @PreAuthorize("hasAnyRole('STUDENT','TEACHER','ADMIN','LIBRARIAN')")
    public ResponseEntity<List<BookLoanResponse>> listByBorrower(@PathVariable Long borrowerId) {
        return ResponseEntity.ok(bookLoanService.listByBorrower(borrowerId));
    }
}