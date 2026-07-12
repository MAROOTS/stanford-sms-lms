package com.stanford.schoolbackend.sms.fees;

import com.stanford.schoolbackend.core.exception.ResourceNotFoundException;
import com.stanford.schoolbackend.core.security.SecurityUtils;
import com.stanford.schoolbackend.sms.exams.Term;
import com.stanford.schoolbackend.sms.exams.TermRepository;
import com.stanford.schoolbackend.sms.fees.dto.CreateInvoiceRequest;
import com.stanford.schoolbackend.sms.fees.dto.FeeInvoiceResponse;
import com.stanford.schoolbackend.sms.fees.dto.FeeTermSummaryResponse;
import com.stanford.schoolbackend.sms.fees.dto.MonthToDateCollectionResponse;
import com.stanford.schoolbackend.sms.student.Student;
import com.stanford.schoolbackend.sms.student.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FeeInvoiceService {

    private final FeeInvoiceRepository feeInvoiceRepository;
    private final FeeItemRepository feeItemRepository;
    private final FeePaymentRepository feePaymentRepository;
    private final StudentRepository studentRepository;
    private final TermRepository termRepository;

    public FeeInvoiceResponse create(CreateInvoiceRequest request) {
        if (feeInvoiceRepository.findByStudentIdAndTermId(request.getStudentId(), request.getTermId()).isPresent()) {
            throw new IllegalArgumentException("An invoice already exists for this student and term — use update instead");
        }

        Student student = studentRepository.findById(request.getStudentId())
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));
        Term term = termRepository.findById(request.getTermId())
                .orElseThrow(() -> new ResourceNotFoundException("Term not found"));

        FeeInvoice invoice = FeeInvoice.builder().student(student).term(term).build();
        invoice.setLineItems(buildLineItems(invoice, request.getLineItems()));

        return toResponse(feeInvoiceRepository.save(invoice));
    }

    public FeeInvoiceResponse update(Long invoiceId, CreateInvoiceRequest request) {
        FeeInvoice invoice = getOrThrow(invoiceId);

        invoice.getLineItems().clear();
        invoice.getLineItems().addAll(buildLineItems(invoice, request.getLineItems()));

        return toResponse(feeInvoiceRepository.save(invoice));
    }

    public FeeInvoiceResponse getById(Long invoiceId) {
        return toResponse(getOrThrow(invoiceId));
    }

    public List<FeeInvoiceResponse> listByTerm(Long termId) {
        return feeInvoiceRepository.findByTermId(termId).stream().map(this::toResponse).toList();
    }

    public List<FeeInvoiceResponse> listByStudent(Long studentId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));

        boolean isPrivileged = SecurityUtils.currentUserHasRole("ADMIN");
        if (!isPrivileged && !student.getEmail().equals(SecurityUtils.currentUserEmail())) {
            throw new AccessDeniedException("You can only view your own fee invoices");
        }

        return feeInvoiceRepository.findByStudentId(studentId).stream().map(this::toResponse).toList();
    }

    public FeeTermSummaryResponse getTermSummary(Long termId) {
        Term term = termRepository.findById(termId)
                .orElseThrow(() -> new ResourceNotFoundException("Term not found"));

        List<FeeInvoice> invoices = feeInvoiceRepository.findByTermId(termId);
        List<Long> invoiceIds = invoices.stream().map(FeeInvoice::getId).toList();

        BigDecimal totalBilled = invoices.stream()
                .flatMap(i -> i.getLineItems().stream())
                .map(FeeInvoiceLineItem::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        List<FeePayment> payments = invoiceIds.isEmpty()
                ? List.of()
                : feePaymentRepository.findByInvoiceIdIn(invoiceIds);

        BigDecimal totalCollected = payments.stream()
                .map(FeePayment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<String, BigDecimal> byMethod = payments.stream()
                .collect(Collectors.groupingBy(FeePayment::getMethod,
                        Collectors.reducing(BigDecimal.ZERO, FeePayment::getAmount, BigDecimal::add)));

        List<FeeTermSummaryResponse.MethodBreakdown> breakdown = byMethod.entrySet().stream()
                .map(e -> FeeTermSummaryResponse.MethodBreakdown.builder()
                        .method(e.getKey())
                        .amount(e.getValue())
                        .percentage(totalCollected.compareTo(BigDecimal.ZERO) > 0
                                ? e.getValue().divide(totalCollected, 4, RoundingMode.HALF_UP)
                                  .multiply(BigDecimal.valueOf(100)).doubleValue()
                                : 0.0)
                        .build())
                .sorted((a, b) -> b.getAmount().compareTo(a.getAmount()))
                .toList();

        return FeeTermSummaryResponse.builder()
                .termId(term.getId())
                .termName(term.getName())
                .totalBilled(totalBilled)
                .totalCollected(totalCollected)
                .outstandingBalance(totalBilled.subtract(totalCollected))
                .collectionByMethod(breakdown)
                .build();
    }

    public MonthToDateCollectionResponse getMonthToDateCollection() {
        LocalDate today = LocalDate.now();
        YearMonth currentMonth = YearMonth.from(today);
        LocalDate start = currentMonth.atDay(1);

        BigDecimal total = feePaymentRepository.findByPaymentDateBetween(start, today).stream()
                .map(FeePayment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return MonthToDateCollectionResponse.builder().asOfDate(today).totalCollected(total).build();
    }

    private List<FeeInvoiceLineItem> buildLineItems(FeeInvoice invoice, List<CreateInvoiceRequest.LineItem> requestedItems) {
        return requestedItems.stream()
                .map(li -> {
                    FeeItem feeItem = feeItemRepository.findById(li.getFeeItemId())
                            .orElseThrow(() -> new ResourceNotFoundException("Fee item not found: " + li.getFeeItemId()));
                    return FeeInvoiceLineItem.builder()
                            .invoice(invoice)
                            .feeItem(feeItem)
                            .amount(li.getAmount())
                            .build();
                })
                .collect(Collectors.toCollection(ArrayList::new));
    }

    private FeeInvoice getOrThrow(Long invoiceId) {
        return feeInvoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found"));
    }

    private FeeInvoiceResponse toResponse(FeeInvoice invoice) {
        BigDecimal totalBilled = invoice.getLineItems().stream()
                .map(FeeInvoiceLineItem::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalPaid = feePaymentRepository.findByInvoiceId(invoice.getId()).stream()
                .map(FeePayment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return FeeInvoiceResponse.builder()
                .id(invoice.getId())
                .studentId(invoice.getStudent().getId())
                .studentName(invoice.getStudent().getFirstName() + " " + invoice.getStudent().getLastName())
                .termId(invoice.getTerm().getId())
                .termName(invoice.getTerm().getName())
                .lineItems(invoice.getLineItems().stream()
                        .map(li -> FeeInvoiceResponse.LineItemResponse.builder()
                                .feeItemId(li.getFeeItem().getId())
                                .feeItemName(li.getFeeItem().getName())
                                .amount(li.getAmount())
                                .build())
                        .toList())
                .totalBilled(totalBilled)
                .totalPaid(totalPaid)
                .balance(totalBilled.subtract(totalPaid))
                .createdAt(invoice.getCreatedAt())
                .build();
    }
}