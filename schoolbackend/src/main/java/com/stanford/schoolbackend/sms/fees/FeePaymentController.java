package com.stanford.schoolbackend.sms.fees;

import com.stanford.schoolbackend.sms.fees.dto.FeePaymentResponse;
import com.stanford.schoolbackend.sms.fees.dto.RecordPaymentRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/fee-invoices/{invoiceId}/payments")
@RequiredArgsConstructor
public class FeePaymentController {

    private final FeePaymentService feePaymentService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<FeePaymentResponse> recordPayment(
            @PathVariable Long invoiceId, @Valid @RequestBody RecordPaymentRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(feePaymentService.recordPayment(invoiceId, request));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<FeePaymentResponse>> listByInvoice(@PathVariable Long invoiceId) {
        return ResponseEntity.ok(feePaymentService.listByInvoice(invoiceId));
    }
}