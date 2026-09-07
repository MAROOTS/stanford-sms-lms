package com.stanford.schoolbackend.sms.fees;

import com.stanford.schoolbackend.sms.fees.dto.FeePaymentResponse;
import com.stanford.schoolbackend.sms.fees.dto.RecordPaymentRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;

import java.util.List;

@RestController
@RequestMapping("/api/fee-invoices/{invoiceId}/payments")
@RequiredArgsConstructor
public class FeePaymentController {

    private final FeePaymentService feePaymentService;
    private final FeeReceiptService feeReceiptService;

    @PostMapping
@PreAuthorize("hasAnyRole('ADMIN','ACCOUNTANT')")
    public ResponseEntity<FeePaymentResponse> recordPayment(
            @PathVariable Long invoiceId, @Valid @RequestBody RecordPaymentRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(feePaymentService.recordPayment(invoiceId, request));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('STUDENT','ADMIN','ACCOUNTANT','PARENT')")
    public ResponseEntity<List<FeePaymentResponse>> listByInvoice(@PathVariable Long invoiceId) {
        return ResponseEntity.ok(feePaymentService.listByInvoice(invoiceId));
    }

    @GetMapping("/{paymentId}/receipt")
    @PreAuthorize("hasAnyRole('ADMIN','ACCOUNTANT','STUDENT','PARENT')")
    public ResponseEntity<byte[]> receipt(
            @PathVariable Long invoiceId,
            @PathVariable Long paymentId) {
        byte[] pdf = feeReceiptService.generate(invoiceId, paymentId);
        String filename = "receipt-" + paymentId + ".pdf";
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDisposition(ContentDisposition.inline().filename(filename).build());
        return ResponseEntity.ok().headers(headers).body(pdf);
    }
}