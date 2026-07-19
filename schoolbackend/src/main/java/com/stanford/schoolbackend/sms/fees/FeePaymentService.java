package com.stanford.schoolbackend.sms.fees;

import com.stanford.schoolbackend.core.enums.NotificationType;
import com.stanford.schoolbackend.core.exception.ResourceNotFoundException;
import com.stanford.schoolbackend.core.notification.NotificationService;
import com.stanford.schoolbackend.core.security.SecurityUtils;
import com.stanford.schoolbackend.sms.fees.dto.FeePaymentResponse;
import com.stanford.schoolbackend.sms.fees.dto.RecordPaymentRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class FeePaymentService {

    private final FeePaymentRepository feePaymentRepository;
    private final FeeInvoiceRepository feeInvoiceRepository;
    private final NotificationService notificationService;
    public FeePaymentResponse recordPayment(Long invoiceId, RecordPaymentRequest request) {
        if (request.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Payment amount must be greater than zero");
        }

        FeeInvoice invoice = feeInvoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found"));

        // Validate payment doesn't exceed outstanding balance
        BigDecimal totalBilled = invoice.getLineItems().stream()
                .map(FeeInvoiceLineItem::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalPaid = feePaymentRepository.findByInvoiceId(invoiceId).stream()
                .map(FeePayment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal outstanding = totalBilled.subtract(totalPaid);

        if (request.getAmount().compareTo(outstanding) > 0) {
            throw new IllegalArgumentException(
                    String.format("Payment (KES %.2f) exceeds outstanding balance (KES %.2f)",
                            request.getAmount(), outstanding));
        }

        FeePayment payment = FeePayment.builder()
                .invoice(invoice)
                .amount(request.getAmount())
                .method(request.getMethod())
                .paymentDate(request.getPaymentDate())
                .reference(request.getReference())
                .build();
        FeePayment saved = feePaymentRepository.save(payment);
        notificationService.notifyUser(invoice.getStudent(), NotificationType.FEE_PAYMENT,
                "Payment of KES " + request.getAmount() + " received via " + request.getMethod() + ".",
                "/fees");
        return toResponse(saved);
    }

    public List<FeePaymentResponse> listByInvoice(Long invoiceId) {
        FeeInvoice invoice = feeInvoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found"));

        boolean isAdmin = SecurityUtils.currentUserHasRole("ADMIN");
        if (!isAdmin && !invoice.getStudent().getEmail().equals(SecurityUtils.currentUserEmail())) {
            throw new AccessDeniedException("You can only view your own payment history");
        }

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