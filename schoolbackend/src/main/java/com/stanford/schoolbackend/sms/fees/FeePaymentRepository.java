package com.stanford.schoolbackend.sms.fees;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface FeePaymentRepository extends JpaRepository<FeePayment, Long> {
    List<FeePayment> findByInvoiceId(Long invoiceId);
    List<FeePayment> findByInvoiceIdIn(List<Long> invoiceIds);
    List<FeePayment> findByPaymentDateBetween(LocalDate start, LocalDate end);
}