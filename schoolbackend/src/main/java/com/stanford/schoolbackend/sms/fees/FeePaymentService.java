package com.stanford.schoolbackend.sms.fees;

import com.stanford.schoolbackend.core.exception.ResourceNotFoundException;
import com.stanford.schoolbackend.sms.fees.dto.FeePaymentResponse;
import com.stanford.schoolbackend.sms.fees.dto.RecordPaymentRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FeePaymentService {

    private final FeePaymentRepository feePaymentRepository;
    private final FeeInvoiceRepository feeInvoiceRepository;

    public FeePaymentResponse recordPayment(Long invoiceId, RecordPaymentRequest request) {
        FeeInvoice invoice = feeInvoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found"));

        FeePayment payment = FeePayment.builder()
                .invoice(invoice)
                .amount(request.getAmount())
                .method(request.getMethod())
                .paymentDate(request.getPaymentDate())
                .reference(request.getReference())
                .build();

        return toResponse(feePaymentRepository.save(payment));
    }

    public List<FeePaymentResponse> listByInvoice(Long invoiceId) {
        return feePaymentRepository.findByInvoiceId(invoiceId).stream().map(this::toResponse).toList();
    }

    private FeePaymentResponse toResponse(FeePayment p) {
        return FeePaymentResponse.builder()
                .id(p.getId())
                .invoiceId(p.getInvoice().getId())
                .amount(p.getAmount())
                .method(p.getMethod())
                .paymentDate(p.getPaymentDate())
                .reference(p.getReference())
                .build();
    }
}