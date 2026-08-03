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
    @PreAuthorize("hasAnyRole('ADMIN','ACCOUNTANT')")

    public ResponseEntity<FeeInvoiceResponse> create(@Valid @RequestBody CreateInvoiceRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(feeInvoiceService.create(request));
    }

    @PutMapping("/{invoiceId}")
@PreAuthorize("hasAnyRole('ADMIN','ACCOUNTANT')")
    public ResponseEntity<FeeInvoiceResponse> update(@PathVariable Long invoiceId, @Valid @RequestBody CreateInvoiceRequest request) {
        return ResponseEntity.ok(feeInvoiceService.update(invoiceId, request));
    }

    @GetMapping("/{invoiceId}")
@PreAuthorize("hasAnyRole('ADMIN','ACCOUNTANT')")
    public ResponseEntity<FeeInvoiceResponse> getById(@PathVariable Long invoiceId) {
        return ResponseEntity.ok(feeInvoiceService.getById(invoiceId));
    }

    @GetMapping("/term/{termId}")
@PreAuthorize("hasAnyRole('ADMIN','ACCOUNTANT')")
    public ResponseEntity<List<FeeInvoiceResponse>> listByTerm(@PathVariable Long termId,@RequestParam(required = false) Long classSectionId) {
        return ResponseEntity.ok(feeInvoiceService.listByTerm(termId, classSectionId));
    }

    @GetMapping("/student/{studentId}")
    @PreAuthorize("hasAnyRole('STUDENT','ADMIN','ACCOUNTANT','PARENT')")
    public ResponseEntity<List<FeeInvoiceResponse>> listByStudent(@PathVariable Long studentId) {
        return ResponseEntity.ok(feeInvoiceService.listByStudent(studentId));
    }

    @GetMapping("/term/{termId}/summary")
@PreAuthorize("hasAnyRole('ADMIN','ACCOUNTANT')")
    public ResponseEntity<FeeTermSummaryResponse> getTermSummary(@PathVariable Long termId,@RequestParam(required = false) Long classSectionId) {
        return ResponseEntity.ok(feeInvoiceService.getTermSummary(termId, classSectionId));
    }

    @GetMapping("/summary/month-to-date")
@PreAuthorize("hasAnyRole('ADMIN','ACCOUNTANT')")
    public ResponseEntity<MonthToDateCollectionResponse> getMonthToDateCollection() {
        return ResponseEntity.ok(feeInvoiceService.getMonthToDateCollection());
    }
}