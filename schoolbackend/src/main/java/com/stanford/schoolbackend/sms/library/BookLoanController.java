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
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BookLoanResponse> issueLoan(@Valid @RequestBody IssueLoanRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(bookLoanService.issueLoan(request));
    }

    @PostMapping("/{loanId}/return")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BookLoanResponse> returnLoan(@PathVariable Long loanId) {
        return ResponseEntity.ok(bookLoanService.returnLoan(loanId));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<BookLoanResponse>> listAll() {
        return ResponseEntity.ok(bookLoanService.listAll());
    }

    @GetMapping("/active")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<BookLoanResponse>> listActive() {
        return ResponseEntity.ok(bookLoanService.listActive());
    }

    @GetMapping("/borrower/{borrowerId}")
    @PreAuthorize("hasAnyRole('STUDENT','TEACHER','ADMIN')")
    public ResponseEntity<List<BookLoanResponse>> listByBorrower(@PathVariable Long borrowerId) {
        return ResponseEntity.ok(bookLoanService.listByBorrower(borrowerId));
    }
}