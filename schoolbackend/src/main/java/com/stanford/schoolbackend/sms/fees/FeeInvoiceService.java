package com.stanford.schoolbackend.sms.fees;

import com.stanford.schoolbackend.core.exception.ResourceNotFoundException;
import com.stanford.schoolbackend.core.school.School;
import com.stanford.schoolbackend.core.school.SchoolRepository;
import com.stanford.schoolbackend.core.security.SecurityUtils;
import com.stanford.schoolbackend.sms.exams.Term;
import com.stanford.schoolbackend.sms.exams.TermRepository;
import com.stanford.schoolbackend.sms.fees.dto.*;
import com.stanford.schoolbackend.sms.parent.ParentAccessService;
import com.stanford.schoolbackend.sms.student.Student;
import com.stanford.schoolbackend.sms.student.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
    private final ParentAccessService parentAccessService;
    private final SchoolRepository schoolRepository;
    private final InvoiceNumberService invoiceNumberService;
    private final FeeStructureLineRepository feeStructureLineRepository;

    public static final String WAIVER_ITEM_PREFIX = "Waiver — ";

    public FeeInvoiceResponse create(CreateInvoiceRequest request) {
        if (feeInvoiceRepository.findByStudentIdAndTermId(
                request.getStudentId(),
                request.getTermId()
        ).isPresent()) {
            throw new IllegalArgumentException(
                    "An invoice already exists for this student and term — use update instead"
            );
        }

        Student student = studentRepository.findById(request.getStudentId())
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));

        Term term = termRepository.findById(request.getTermId())
                .orElseThrow(() -> new ResourceNotFoundException("Term not found"));

        Long schoolId = SecurityUtils.currentSchoolId();

        if (student.getSchool() == null
                || !schoolId.equals(student.getSchool().getId())) {
            throw new ResourceNotFoundException("Student not found");
        }

        if (term.getSchool() == null
                || !schoolId.equals(term.getSchool().getId())) {
            throw new ResourceNotFoundException("Term not found");
        }

        Long currentSchoolId = SecurityUtils.currentSchoolId();

        if (currentSchoolId == null) {
            throw new ResourceNotFoundException("School context not found");
        }

        School school = schoolRepository.findById(SecurityUtils.currentSchoolId())
                .orElseThrow(() -> new ResourceNotFoundException("School not found"));

        FeeInvoice invoice = FeeInvoice.builder()
                .student(student)
                .term(term)
                .dueDate(request.getDueDate())
                .school(school)
                .invoiceNumber(invoiceNumberService.next(school.getId()))
                .build();

        invoice.setLineItems(
                buildLineItems(invoice, request.getLineItems())
        );

        return toResponse(feeInvoiceRepository.save(invoice));
    }

    public FeeInvoiceResponse update(
            Long invoiceId,
            CreateInvoiceRequest request
    ) {
        FeeInvoice invoice = getOrThrow(invoiceId);

        invoice.getLineItems().clear();
        invoice.getLineItems().addAll(
                buildLineItems(invoice, request.getLineItems())
        );

        invoice.setDueDate(request.getDueDate());

        return toResponse(feeInvoiceRepository.save(invoice));
    }

    public FeeInvoiceResponse getById(Long invoiceId) {
        return toResponse(getOrThrow(invoiceId));
    }

    public List<FeeInvoiceResponse> listByTerm(
            Long termId,
            Long classSectionId
    ) {
        Long schoolId = SecurityUtils.currentSchoolId();

        List<FeeInvoice> invoices = (classSectionId != null)
                ? feeInvoiceRepository.findBySchoolIdAndTermIdAndStudent_ClassSection_Id(
                schoolId,
                termId,
                classSectionId
        )
                : feeInvoiceRepository.findBySchoolIdAndTermId(
                schoolId,
                termId
        );

        return invoices.stream()
                .map(this::toResponse)
                .toList();
    }

    public List<FeeInvoiceResponse> listByStudent(Long studentId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));

        boolean isPrivileged =
                SecurityUtils.currentUserHasRole("ADMIN");

        boolean isOwnRecord =
                student.getUsername().equals(
                        SecurityUtils.currentUsername()
                );

        boolean isLinkedParent =
                SecurityUtils.currentUserHasRole("PARENT")
                        && parentAccessService.isCurrentUserParentOf(studentId);

        if (!isPrivileged && !isOwnRecord && !isLinkedParent) {
            throw new AccessDeniedException(
                    "You are not authorized to view this student's fee invoices"
            );
        }

        return feeInvoiceRepository.findByStudentId(studentId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public FeeTermSummaryResponse getTermSummary(Long termId, Long classSectionId) {
        Term term = termRepository.findById(termId)
                .orElseThrow(() -> new ResourceNotFoundException("Term not found"));

        List<FeeInvoice> invoices = (classSectionId != null)
                ? feeInvoiceRepository.findByTermIdAndStudent_ClassSection_Id(
                termId,
                classSectionId
        )
                : feeInvoiceRepository.findByTermId(termId);

        List<Long> invoiceIds = invoices.stream()
                .map(FeeInvoice::getId)
                .toList();

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
                .collect(
                        Collectors.groupingBy(
                                FeePayment::getMethod,
                                Collectors.reducing(
                                        BigDecimal.ZERO,
                                        FeePayment::getAmount,
                                        BigDecimal::add
                                )
                        )
                );

        List<FeeTermSummaryResponse.MethodBreakdown> breakdown =
                byMethod.entrySet().stream()
                        .map(e -> FeeTermSummaryResponse.MethodBreakdown.builder()
                                .method(e.getKey())
                                .amount(e.getValue())
                                .percentage(
                                        totalCollected.compareTo(BigDecimal.ZERO) > 0
                                                ? e.getValue()
                                                .divide(
                                                        totalCollected,
                                                        4,
                                                        RoundingMode.HALF_UP
                                                )
                                                .multiply(BigDecimal.valueOf(100))
                                                .doubleValue()
                                                : 0.0
                                )
                                .build()
                        )
                        .sorted(
                                (a, b) ->
                                        b.getAmount().compareTo(a.getAmount())
                        )
                        .toList();

        /*
         * A carried-forward invoice is historical only.
         * Its original billed/paid values remain visible,
         * but it contributes zero to the current collectable
         * outstanding balance.
         */
        BigDecimal outstandingBalance = invoices.stream()
                .map(invoice ->
                        invoice.isCarriedForward()
                                ? BigDecimal.ZERO
                                : outstanding(invoice)
                )
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return FeeTermSummaryResponse.builder()
                .termId(term.getId())
                .termName(term.getName())
                .totalBilled(totalBilled)
                .totalCollected(totalCollected)
                .outstandingBalance(outstandingBalance)
                .collectionByMethod(breakdown)
                .build();
    }

    public MonthToDateCollectionResponse getMonthToDateCollection() {
        LocalDate today = LocalDate.now();
        YearMonth currentMonth = YearMonth.from(today);
        LocalDate start = currentMonth.atDay(1);

        BigDecimal total = feePaymentRepository
                .findByInvoice_School_IdAndPaymentDateBetween(
                        SecurityUtils.currentSchoolId(),
                        start,
                        today
                )
                .stream()
                .map(FeePayment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return MonthToDateCollectionResponse.builder()
                .asOfDate(today)
                .totalCollected(total)
                .build();
    }

    private List<FeeInvoiceLineItem> buildLineItems(
            FeeInvoice invoice,
            List<CreateInvoiceRequest.LineItem> requestedItems
    ) {
        return requestedItems.stream()
                .map(li -> {
                    FeeItem feeItem = feeItemRepository.findById(
                                    li.getFeeItemId()
                            )
                            .orElseThrow(
                                    () -> new ResourceNotFoundException(
                                            "Fee item not found: "
                                                    + li.getFeeItemId()
                                    )
                            );

                    if (!SecurityUtils.currentSchoolId()
                            .equals(feeItem.getSchool().getId())) {
                        throw new ResourceNotFoundException(
                                "Fee item not found: "
                                        + li.getFeeItemId()
                        );
                    }

                    return FeeInvoiceLineItem.builder()
                            .invoice(invoice)
                            .feeItem(feeItem)
                            .amount(li.getAmount())
                            .build();
                })
                .collect(Collectors.toCollection(ArrayList::new));
    }

    @Transactional
    public GenerateInvoicesResponse generate(
            GenerateInvoicesRequest request
    ) {
        Long schoolId = SecurityUtils.currentSchoolId();

        Term term = termRepository.findById(request.getTermId())
                .orElseThrow(() -> new ResourceNotFoundException("Term not found"));

        if (term.getSchool() == null
                || !schoolId.equals(term.getSchool().getId())) {
            throw new ResourceNotFoundException("Term not found");
        }

        School school = schoolRepository.findById(schoolId)
                .orElseThrow(() -> new ResourceNotFoundException("School not found"));

        List<Student> students = (request.getClassSectionId() != null)
                ? studentRepository.findByClassSectionId(
                request.getClassSectionId()
        )
                : studentRepository.findBySchoolId(schoolId);

        int created = 0;
        int skippedExisting = 0;
        int skippedNoClass = 0;
        int skippedNoStructure = 0;
        int carried = 0;

        Map<Long, List<FeeStructureLine>> byGrade =
                feeStructureLineRepository.findBySchoolId(schoolId)
                        .stream()
                        .collect(
                                Collectors.groupingBy(
                                        l -> l.getGradeLevel().getId()
                                )
                        );

        for (Student student : students) {

            /*
             * Prevent duplicate invoices.
             */
            if (feeInvoiceRepository.findByStudentIdAndTermId(
                    student.getId(),
                    term.getId()
            ).isPresent()) {
                skippedExisting++;
                continue;
            }

            /*
             * A student still needs to belong to a class
             * so we can determine their grade structure.
             */
            if (student.getClassSection() == null
                    || student.getClassSection().getGradeLevel() == null) {

                skippedNoClass++;
                continue;
            }

            Long gradeId = student.getClassSection()
                    .getGradeLevel()
                    .getId();

            List<FeeStructureLine> gradeLines =
                    new ArrayList<>(
                            byGrade.getOrDefault(
                                    gradeId,
                                    List.of()
                            )
                    );

            /*
             * Restrict generation to selected fee items when supplied.
             */
            if (request.getFeeItemIds() != null
                    && !request.getFeeItemIds().isEmpty()) {

                Set<Long> wanted =
                        new HashSet<>(request.getFeeItemIds());

                gradeLines = gradeLines.stream()
                        .filter(line ->
                                line.getFeeItem() != null
                                        && wanted.contains(
                                        line.getFeeItem().getId()
                                )
                        )
                        .toList();
            }

            List<FeeInvoiceLineItem> lines = new ArrayList<>();

            FeeInvoice invoice = FeeInvoice.builder()
                    .student(student)
                    .term(term)
                    .dueDate(request.getDueDate())
                    .school(school)
                    .invoiceNumber(
                            invoiceNumberService.next(school.getId())
                    )
                    .build();

            /*
             * Add normal fee structure lines.
             */
            for (FeeStructureLine gl : gradeLines) {

                if (gl.getAmount() == null
                        || gl.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
                    continue;
                }

                if (gl.getFeeItem() == null) {
                    continue;
                }

                /*
                 * Defensive tenant check.
                 */
                if (gl.getFeeItem().getSchool() == null
                        || !schoolId.equals(
                        gl.getFeeItem().getSchool().getId()
                )) {
                    continue;
                }

                lines.add(
                        FeeInvoiceLineItem.builder()
                                .invoice(invoice)
                                .feeItem(gl.getFeeItem())
                                .amount(gl.getAmount())
                                .build()
                );
            }

            /*
             * Carry forward outstanding balance from the most recent
             * previous term.
             *
             * This is deliberately done BEFORE the empty-lines check
             * so an arrears-only invoice can still be created.
             */
            Optional<FeeInvoice> previous =
                    feeInvoiceRepository
                            .findTopByStudentIdAndSchoolIdAndTerm_StartDateBeforeOrderByTerm_StartDateDesc(
                                    student.getId(),
                                    schoolId,
                                    term.getStartDate()
                            );

            if (previous.isPresent()
                    && !previous.get().isCarriedForward()) {

                BigDecimal arrears = outstanding(previous.get());

                if (arrears.compareTo(BigDecimal.ZERO) > 0) {

                    lines.add(
                            FeeInvoiceLineItem.builder()
                                    .invoice(invoice)
                                    .feeItem(
                                            balanceBroughtForwardItem(school)
                                    )
                                    .amount(arrears)
                                    .build()
                    );

                    previous.get().setCarriedForward(true);
                    feeInvoiceRepository.save(previous.get());

                    carried++;
                }
            }

            /*
             * No structure AND no outstanding previous balance:
             * nothing to invoice.
             *
             * Notice that an arrears-only invoice is allowed because
             * the carry-forward line above makes lines non-empty.
             */
            if (lines.isEmpty()) {
                skippedNoStructure++;
                continue;
            }

            invoice.setLineItems(lines);
            feeInvoiceRepository.save(invoice);

            created++;
        }

        return GenerateInvoicesResponse.builder()
                .created(created)
                .skippedExisting(skippedExisting)
                .skippedNoClass(skippedNoClass)
                .skippedNoStructure(skippedNoStructure)
                .carriedForward(carried)
                .build();
    }

    @Transactional
    public FeeInvoiceResponse applyWaiver(
            Long invoiceId,
            ApplyWaiverRequest request
    ) {
        FeeInvoice invoice = getOrThrow(invoiceId);

        if (invoice.isCarriedForward()) {
            throw new IllegalArgumentException(
                    "This invoice has already been carried to the next term"
            );
        }

        invoice.getLineItems().size();

        BigDecimal billed = invoice.getLineItems().stream()
                .map(FeeInvoiceLineItem::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal paid = feePaymentRepository
                .findByInvoiceId(invoice.getId())
                .stream()
                .map(FeePayment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal balance = billed.subtract(paid);

        if (request.getAmount() == null
                || request.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException(
                    "Waiver amount must be positive"
            );
        }

        if (balance.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException(
                    "This invoice has no outstanding balance to waive "
                            + "(billed " + billed + ", paid " + paid + ")"
            );
        }

        if (request.getAmount().compareTo(balance) > 0) {
            throw new IllegalArgumentException(
                    "Waiver cannot exceed the outstanding balance of KES "
                            + balance
            );
        }

        Long schoolId = SecurityUtils.currentSchoolId();

        String itemName =
                "Waiver - " + request.getReason().trim();

        FeeItem waiverItem = feeItemRepository
                .findByNameIgnoreCaseAndSchoolId(
                        itemName,
                        schoolId
                )
                .orElseGet(
                        () -> feeItemRepository.save(
                                FeeItem.builder()
                                        .school(invoice.getSchool())
                                        .name(itemName)
                                        .build()
                        )
                );

        invoice.getLineItems().add(
                FeeInvoiceLineItem.builder()
                        .invoice(invoice)
                        .feeItem(waiverItem)
                        .amount(request.getAmount().negate())
                        .build()
        );

        return toResponse(
                feeInvoiceRepository.save(invoice)
        );
    }

    /**
     * Calculates the current outstanding balance of an invoice.
     *
     * This is used both for displaying balances and for determining
     * how much should be carried into the next term.
     */
    private BigDecimal outstanding(FeeInvoice invoice) {
        BigDecimal billed = invoice.getLineItems().stream()
                .map(FeeInvoiceLineItem::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal paid = feePaymentRepository
                .findByInvoiceId(invoice.getId())
                .stream()
                .map(FeePayment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return billed.subtract(paid);
    }

    /**
     * Gets or creates the special fee item used for arrears
     * carried from the previous term.
     */
    private FeeItem balanceBroughtForwardItem(School school) {
        return feeItemRepository
                .findBySchoolIdAndNameIgnoreCase(
                        school.getId(),
                        "Balance brought forward"
                )
                .orElseGet(
                        () -> feeItemRepository.save(
                                FeeItem.builder()
                                        .name("Balance brought forward")
                                        .school(school)
                                        .build()
                        )
                );
    }

    private FeeInvoice getOrThrow(Long invoiceId) {
        FeeInvoice invoice = feeInvoiceRepository.findById(invoiceId)
                .orElseThrow(
                        () -> new ResourceNotFoundException(
                                "Invoice not found"
                        )
                );

        Long schoolId = SecurityUtils.currentSchoolId();

        if (schoolId == null
                || invoice.getSchool() == null
                || !schoolId.equals(
                invoice.getSchool().getId()
        )) {

            throw new ResourceNotFoundException(
                    "Invoice not found"
            );
        }

        return invoice;
    }

    private FeeInvoiceResponse toResponse(FeeInvoice invoice) {
        BigDecimal totalBilled = invoice.getLineItems().stream()
                .map(FeeInvoiceLineItem::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalPaid = feePaymentRepository
                .findByInvoiceId(invoice.getId())
                .stream()
                .map(FeePayment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        /*
         * Keep the original billed/paid values for historical visibility,
         * but once the invoice is carried forward its collectable balance
         * becomes zero.
         */
        BigDecimal balance = totalBilled.subtract(totalPaid);

        return FeeInvoiceResponse.builder()
                .id(invoice.getId())
                .studentId(invoice.getStudent().getId())
                .studentName(
                        invoice.getStudent().getFirstName()
                                + " "
                                + invoice.getStudent().getLastName()
                )
                .termId(invoice.getTerm().getId())
                .termName(invoice.getTerm().getName())

                .lineItems(
                        invoice.getLineItems().stream()
                                .map(li ->
                                        FeeInvoiceResponse.LineItemResponse.builder()
                                                .feeItemId(
                                                        li.getFeeItem().getId()
                                                )
                                                .feeItemName(
                                                        li.getFeeItem().getName()
                                                )
                                                .amount(li.getAmount())
                                                .build()
                                )
                                .toList()
                )

                .totalBilled(totalBilled)
                .totalPaid(totalPaid)
                .balance(balance)

                .dueDate(invoice.getDueDate())
                .createdAt(invoice.getCreatedAt())
                .invoiceNumber(invoice.getInvoiceNumber())

                .carriedForward(
                        invoice.isCarriedForward()
                )

                .build();
    }
}