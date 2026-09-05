package com.stanford.schoolbackend.sms.fees;

import com.stanford.schoolbackend.core.enums.NotificationType;
import com.stanford.schoolbackend.core.exception.ResourceNotFoundException;
import com.stanford.schoolbackend.core.notification.NotificationService;
import com.stanford.schoolbackend.core.security.SecurityUtils;
import com.stanford.schoolbackend.sms.fees.dto.FeePaymentResponse;
import com.stanford.schoolbackend.sms.fees.dto.RecordPaymentRequest;
import com.stanford.schoolbackend.sms.parent.ParentAccessService;
import com.stanford.schoolbackend.sms.parent.ParentStudentLinkRepository;
import com.stanford.schoolbackend.sms.student.Student;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class FeePaymentService {

    private final FeePaymentRepository feePaymentRepository;
    private final FeeInvoiceRepository feeInvoiceRepository;
    private final NotificationService notificationService;
    private final ParentStudentLinkRepository parentStudentLinkRepository;
    private final ParentAccessService parentAccessService;
    @Transactional
    public FeePaymentResponse recordPayment(Long invoiceId, RecordPaymentRequest request) {
        FeeInvoice invoice = feeInvoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found"));
        assertCurrentSchool(invoice.getSchool(), "Invoice not found");

        BigDecimal billed = invoice.getLineItems().stream()
                .map(FeeInvoiceLineItem::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal paid = feePaymentRepository.findByInvoiceId(invoice.getId()).stream()
                .map(FeePayment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal balance = billed.subtract(paid);

        if (balance.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("This invoice is already paid in full");
        }
        if (request.getAmount().compareTo(balance) > 0) {
            throw new IllegalArgumentException(
                    "Payment cannot exceed the outstanding balance of KES " + balance);
        }

        FeePayment saved = feePaymentRepository.save(FeePayment.builder()
                .invoice(invoice)
                .amount(request.getAmount())
                .method(request.getMethod())
                .paymentDate(request.getPaymentDate())
                .reference(request.getReference())
                .build());

        String msg = "Payment of KES " + request.getAmount() + " received via "
                + request.getMethod() + " for " + invoice.getTerm().getName() + ".";
        notificationService.notifyUser(invoice.getStudent(), NotificationType.FEE_PAYMENT, msg, "/my-fees");
        notifyParents(invoice.getStudent(), NotificationType.FEE_PAYMENT, msg,
                "/child/" + invoice.getStudent().getId() + "/fees");

        return toResponse(saved);
    }

    private void notifyParents(Student student, NotificationType type, String message, String link) {
        parentStudentLinkRepository.findByStudentId(student.getId())
                .forEach(linkRow -> notificationService.notifyUser(linkRow.getParent(), type, message, link));
    }

    public List<FeePaymentResponse> listByInvoice(Long invoiceId) {
        FeeInvoice invoice = feeInvoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found"));
        assertCurrentSchool(invoice.getSchool(), "Invoice not found");
        boolean privileged = SecurityUtils.currentUserHasRole("ADMIN")
                || SecurityUtils.currentUserHasRole("ACCOUNTANT");
        boolean ownStudent = invoice.getStudent().getUsername().equals(SecurityUtils.currentUsername());
        boolean linkedParent = SecurityUtils.currentUserHasRole("PARENT")
                && parentAccessService.isCurrentUserParentOf(invoice.getStudent().getId());
        if (!privileged && !ownStudent && !linkedParent) {
            throw new AccessDeniedException("You can only view your own payment history");
        }

        return feePaymentRepository.findByInvoiceId(invoiceId).stream().map(this::toResponse).toList();
    }
    private void assertCurrentSchool(com.stanford.schoolbackend.core.school.School school, String notFoundMessage) {
        Long schoolId = SecurityUtils.currentSchoolId();
        if (schoolId == null || school == null || !schoolId.equals(school.getId())) {
            throw new ResourceNotFoundException(notFoundMessage);
        }
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