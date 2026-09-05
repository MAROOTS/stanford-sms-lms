package com.stanford.schoolbackend.sms.fees;

import org.springframework.data.jpa.repository.JpaRepository;

public interface FeeInvoiceLineItemRepository extends JpaRepository<FeeInvoiceLineItem, Long> {
    boolean existsByFeeItemId(Long feeItemId);
}