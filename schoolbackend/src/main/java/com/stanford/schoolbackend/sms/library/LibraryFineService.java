package com.stanford.schoolbackend.sms.library;

import com.stanford.schoolbackend.core.user.User;
import com.stanford.schoolbackend.sms.exams.Term;
import com.stanford.schoolbackend.sms.exams.TermRepository;
import com.stanford.schoolbackend.sms.fees.*;
import com.stanford.schoolbackend.sms.student.Student;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class LibraryFineService {

    private static final String FINE_ITEM_NAME = "Library Fine";

    private final FeeItemRepository feeItemRepository;
    private final FeeInvoiceRepository feeInvoiceRepository;
    private final TermRepository termRepository;

    void applyFine(User borrower, Book book, BigDecimal amount, long daysLate) {
        if (!(borrower instanceof Student student)) return; // fines only apply where a fee invoice can exist

        Term currentTerm = termRepository.findByIsCurrentTrue()
                .orElseThrow(() -> new IllegalStateException("No current term set — cannot assess library fine"));

        FeeItem fineItem = feeItemRepository.findByNameIgnoreCase(FINE_ITEM_NAME)
                .orElseGet(() -> feeItemRepository.save(FeeItem.builder().name(FINE_ITEM_NAME).build()));

        FeeInvoice invoice = feeInvoiceRepository.findByStudentIdAndTermId(student.getId(), currentTerm.getId())
                .orElseGet(() -> feeInvoiceRepository.save(
                        FeeInvoice.builder().student(student).term(currentTerm).build()));

        FeeInvoiceLineItem lineItem = FeeInvoiceLineItem.builder()
                .invoice(invoice)
                .feeItem(fineItem)
                .amount(amount)
                .build();
        invoice.getLineItems().add(lineItem);
        feeInvoiceRepository.save(invoice);
    }
}