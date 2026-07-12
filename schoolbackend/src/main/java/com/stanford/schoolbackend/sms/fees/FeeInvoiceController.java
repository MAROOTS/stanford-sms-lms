package com.stanford.schoolbackend.sms.fees;

import com.stanford.schoolbackend.sms.fees.dto.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/fee-invoices")
@RequiredArgsConstructor
public class FeeInvoiceController {

    private final FeeInvoiceService feeInvoiceService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<FeeInvoiceResponse> create(@Valid @RequestBody CreateInvoiceRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(feeInvoiceService.create(request));
    }

    @PutMapping("/{invoiceId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<FeeInvoiceResponse> update(@PathVariable Long invoiceId, @Valid @RequestBody CreateInvoiceRequest request) {
        return ResponseEntity.ok(feeInvoiceService.update(invoiceId, request));
    }

    @GetMapping("/{invoiceId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<FeeInvoiceResponse> getById(@PathVariable Long invoiceId) {
        return ResponseEntity.ok(feeInvoiceService.getById(invoiceId));
    }

    @GetMapping("/term/{termId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<FeeInvoiceResponse>> listByTerm(@PathVariable Long termId) {
        return ResponseEntity.ok(feeInvoiceService.listByTerm(termId));
    }

    @GetMapping("/student/{studentId}")
    @PreAuthorize("hasAnyRole('STUDENT','ADMIN')")
    public ResponseEntity<List<FeeInvoiceResponse>> listByStudent(@PathVariable Long studentId) {
        return ResponseEntity.ok(feeInvoiceService.listByStudent(studentId));
    }

    @GetMapping("/term/{termId}/summary")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<FeeTermSummaryResponse> getTermSummary(@PathVariable Long termId) {
        return ResponseEntity.ok(feeInvoiceService.getTermSummary(termId));
    }

    @GetMapping("/summary/month-to-date")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MonthToDateCollectionResponse> getMonthToDateCollection() {
        return ResponseEntity.ok(feeInvoiceService.getMonthToDateCollection());
    }
}