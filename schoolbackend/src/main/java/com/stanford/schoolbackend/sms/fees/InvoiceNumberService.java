package com.stanford.schoolbackend.sms.fees;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Year;

@Service
public class InvoiceNumberService {

    private final InvoiceSequenceRepository invoiceSequenceRepository;

    public InvoiceNumberService(InvoiceSequenceRepository invoiceSequenceRepository) {
        this.invoiceSequenceRepository = invoiceSequenceRepository;
    }

    @Transactional
    public String next(Long schoolId) {
        int year = Year.now().getValue();
        InvoiceSequence seq = invoiceSequenceRepository.findForUpdate(schoolId, year)
                .orElseGet(() -> invoiceSequenceRepository.save(InvoiceSequence.builder()
                        .schoolId(schoolId)
                        .year(year)
                        .lastValue(0)
                        .build()));
        seq.setLastValue(seq.getLastValue() + 1);
        invoiceSequenceRepository.save(seq);
        return String.format("INV-%d-%04d", year, seq.getLastValue());
    }
}