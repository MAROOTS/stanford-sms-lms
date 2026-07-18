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

import java.util.List;

@Service
@RequiredArgsConstructor
public class FeePaymentService {

    private final FeePaymentRepository feePaymentRepository;
    private final FeeInvoiceRepository feeInvoiceRepository;
    private final NotificationService notificationService;
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