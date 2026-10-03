package com.stanford.schoolbackend.sms.analytics;

import com.stanford.schoolbackend.core.exception.ResourceNotFoundException;
import com.stanford.schoolbackend.core.security.SecurityUtils;
import com.stanford.schoolbackend.sms.analytics.dto.SchoolAnalyticsResponse;
import com.stanford.schoolbackend.sms.communication.CommunicationCampaign;
import com.stanford.schoolbackend.sms.communication.CommunicationCampaignRepository;
import com.stanford.schoolbackend.sms.exams.Term;
import com.stanford.schoolbackend.sms.exams.TermRepository;
import com.stanford.schoolbackend.sms.fees.FeeInvoiceService;
import com.stanford.schoolbackend.sms.fees.FeePayment;
import com.stanford.schoolbackend.sms.fees.FeePaymentRepository;
import com.stanford.schoolbackend.sms.fees.dto.FeeTermSummaryResponse;
import com.stanford.schoolbackend.sms.library.BookLoanRepository;
import com.stanford.schoolbackend.sms.student.StudentRepository;
import com.stanford.schoolbackend.sms.teacher.TeacherRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.ZoneId;
import java.time.format.TextStyle;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private static final ZoneId ZONE = ZoneId.of("Africa/Nairobi");

    private final StudentRepository studentRepository;
    private final TeacherRepository teacherRepository;
    private final TermRepository termRepository;
    private final FeeInvoiceService feeInvoiceService;
    private final FeePaymentRepository feePaymentRepository;
    private final CommunicationCampaignRepository campaignRepository;
    private final BookLoanRepository bookLoanRepository;

    @Transactional(readOnly = true)
    public SchoolAnalyticsResponse overview() {
        Long schoolId = SecurityUtils.currentSchoolId();
        if (schoolId == null) {
            throw new ResourceNotFoundException("School not found");
        }

        Term current = termRepository.findByIsCurrentTrueAndSchoolId(schoolId).orElse(null);

        BigDecimal billed = BigDecimal.ZERO;
        BigDecimal collected = BigDecimal.ZERO;
        BigDecimal outstanding = BigDecimal.ZERO;
        String termName = null;

        if (current != null) {
            termName = current.getName();
            FeeTermSummaryResponse fees = feeInvoiceService.getTermSummary(current.getId(), null);
            billed = nz(fees.getTotalBilled());
            collected = nz(fees.getTotalCollected());
            outstanding = nz(fees.getOutstandingBalance());
        }

        Instant monthStart = YearMonth.now(ZONE).atDay(1).atStartOfDay(ZONE).toInstant();
        int smsSent = 0;
        int smsFailed = 0;
        for (CommunicationCampaign c : campaignRepository.findBySchoolIdOrderByCreatedAtDesc(schoolId)) {
            if (c.getCreatedAt() == null || c.getCreatedAt().isBefore(monthStart)) continue;
            smsSent += c.getSentCount();
            smsFailed += c.getFailedCount();
        }

        LocalDate today = LocalDate.now(ZONE);

        return SchoolAnalyticsResponse.builder()
                .termName(termName)
                .students(studentRepository.countBySchoolId(schoolId))
                .teachers(teacherRepository.countBySchoolId(schoolId))
                .billed(billed)
                .collected(collected)
                .outstanding(outstanding)
                .smsSent(smsSent)
                .smsFailed(smsFailed)
                .activeLoans(bookLoanRepository.countByBookCopy_Book_School_IdAndReturnedDateIsNull(schoolId))
                .overdueLoans(bookLoanRepository
                        .countByBookCopy_Book_School_IdAndReturnedDateIsNullAndDueDateBefore(schoolId, today))
                .enrolmentByGrade(enrolment(schoolId))
                .collectionMonthly(monthlyCollection(schoolId))
                .build();
    }

    private List<SchoolAnalyticsResponse.NamedCount> enrolment(Long schoolId) {
        return studentRepository.countEnrolmentByGrade(schoolId).stream()
                .map(row -> SchoolAnalyticsResponse.NamedCount.builder()
                        .name((String) row[0])
                        .count((Long) row[1])
                        .build())
                .toList();
    }

    private List<SchoolAnalyticsResponse.MonthlyAmount> monthlyCollection(Long schoolId) {
        YearMonth end = YearMonth.now(ZONE);
        YearMonth startYm = end.minusMonths(5);
        LocalDate from = startYm.atDay(1);
        LocalDate to = end.atEndOfMonth();

        Map<YearMonth, BigDecimal> totals = feePaymentRepository
                .findByInvoice_School_IdAndPaymentDateBetween(schoolId, from, to)
                .stream()
                .collect(Collectors.groupingBy(
                        p -> YearMonth.from(p.getPaymentDate()),
                        Collectors.reducing(BigDecimal.ZERO, FeePayment::getAmount, BigDecimal::add)
                ));

        List<SchoolAnalyticsResponse.MonthlyAmount> points = new ArrayList<>();
        for (YearMonth ym = startYm; !ym.isAfter(end); ym = ym.plusMonths(1)) {
            points.add(SchoolAnalyticsResponse.MonthlyAmount.builder()
                    .label(ym.getMonth().getDisplayName(TextStyle.SHORT, Locale.ENGLISH) + " " + ym.getYear())
                    .amount(totals.getOrDefault(ym, BigDecimal.ZERO))
                    .build());
        }
        return points;
    }

    private static BigDecimal nz(BigDecimal v) {
        return v == null ? BigDecimal.ZERO : v;
    }
}