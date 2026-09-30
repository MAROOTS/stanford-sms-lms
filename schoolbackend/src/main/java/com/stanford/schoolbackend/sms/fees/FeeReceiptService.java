package com.stanford.schoolbackend.sms.fees;

import com.openhtmltopdf.pdfboxout.PdfRendererBuilder;
import com.stanford.schoolbackend.core.exception.ResourceNotFoundException;
//import com.stanford.schoolbackend.core.school.School;
import com.stanford.schoolbackend.core.school.SchoolProfile;
import com.stanford.schoolbackend.core.school.SchoolProfileRepository;
import com.stanford.schoolbackend.core.security.SecurityUtils;
import com.stanford.schoolbackend.core.storage.FileStorageService;
import com.stanford.schoolbackend.sms.parent.ParentAccessService;
import com.stanford.schoolbackend.sms.student.Student;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
public class FeeReceiptService {

    private final FeePaymentRepository feePaymentRepository;
    private final FeeInvoiceRepository feeInvoiceRepository;
    private final ParentAccessService parentAccessService;
    private final SchoolProfileRepository schoolProfileRepository;
    private final FileStorageService fileStorageService;

    public byte[] generate(Long invoiceId, Long paymentId) {
        FeeInvoice invoice = feeInvoiceRepository.findById(invoiceId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Invoice not found"));

        assertSchool(invoice);

        FeePayment payment = feePaymentRepository.findById(paymentId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Payment not found"));

        if (!payment.getInvoice().getId().equals(invoiceId)) {
            throw new ResourceNotFoundException("Payment not found");
        }

        assertCanView(invoice);

        BigDecimal billed = invoice.getLineItems().stream()
                .map(FeeInvoiceLineItem::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal paidToDate = feePaymentRepository
                .findByInvoiceId(invoice.getId())
                .stream()
                .map(FeePayment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal balance = billed.subtract(paidToDate);

        SchoolProfile profile = schoolProfileRepository
                .findBySchoolId(invoice.getSchool().getId())
                .orElse(null);

        String schoolName = profile != null && notBlank(profile.getName())
                ? profile.getName().trim()
                : invoice.getSchool().getName();

        String logoDataUri = profile != null
                ? fileStorageService.toDataUri(profile.getLogoObjectKey())
                : null;

        String html = buildHtml(
                schoolName,
                logoDataUri,
                profile,
                invoice,
                payment,
                billed,
                paidToDate,
                balance
        );

        try {
            ByteArrayOutputStream os = new ByteArrayOutputStream();

            PdfRendererBuilder builder = new PdfRendererBuilder();
            builder.useFastMode();
            builder.withHtmlContent(html, null);
            builder.toStream(os);
            builder.run();

            return os.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException(
                    "Failed to generate receipt PDF",
                    e
            );
        }
    }

    private void assertSchool(FeeInvoice invoice) {
        Long schoolId = SecurityUtils.currentSchoolId();

        if (schoolId == null
                || invoice.getSchool() == null
                || !schoolId.equals(invoice.getSchool().getId())) {
            throw new ResourceNotFoundException("Invoice not found");
        }
    }

    private void assertCanView(FeeInvoice invoice) {
        boolean privileged =
                SecurityUtils.currentUserHasRole("ADMIN")
                        || SecurityUtils.currentUserHasRole("ACCOUNTANT");

        Student student = invoice.getStudent();

        boolean own =
                student.getUsername() != null
                        && student.getUsername()
                        .equals(SecurityUtils.currentUsername());

        boolean parent =
                SecurityUtils.currentUserHasRole("PARENT")
                        && parentAccessService
                        .isCurrentUserParentOf(student.getId());

        if (!privileged && !own && !parent) {
            throw new AccessDeniedException(
                    "You cannot view this receipt"
            );
        }
    }

    private String buildHtml(
            String schoolName,
            String logoDataUri,
            SchoolProfile profile,
            FeeInvoice invoice,
            FeePayment payment,
            BigDecimal billed,
            BigDecimal paidToDate,
            BigDecimal balance
    ) {
        Student student = invoice.getStudent();

        String className =
                student.getClassSection() != null
                        ? student.getClassSection().getName()
                        : "—";

        String receiptNo =
                (invoice.getInvoiceNumber() != null
                        ? invoice.getInvoiceNumber()
                        : "INV")
                        + "-P"
                        + payment.getId();

        String paidOn =
                payment.getPaymentDate() != null
                        ? payment.getPaymentDate()
                        .format(DateTimeFormatter.ISO_LOCAL_DATE)
                        : "—";

        StringBuilder itemRows = new StringBuilder();

        for (FeeInvoiceLineItem li : invoice.getLineItems()) {
            itemRows.append("<tr>")
                    .append("<td>")
                    .append(esc(
                            li.getFeeItem() != null
                                    ? li.getFeeItem().getName()
                                    : "Fee"
                    ))
                    .append("</td>")
                    .append("<td class=\"right\">KES ")
                    .append(money(li.getAmount()))
                    .append("</td>")
                    .append("</tr>");
        }

        String css = """
            body {
                font-family: Helvetica, Arial, sans-serif;
                color: #1e293b;
                padding: 24px;
            }

            .card {
                border: 1px solid #e2e8f0;
                border-radius: 8px;
                padding: 32px;
            }

            .letterhead {
                text-align: center;
                margin-bottom: 18px;
                border-bottom: 2px solid #0f172a;
                padding-bottom: 12px;
            }

            .letterhead .name {
                font-size: 18px;
                font-weight: 700;
                margin: 6px 0 2px;
                letter-spacing: .02em;
            }

            .letterhead .motto {
                font-size: 11px;
                font-style: italic;
                color: #475569;
                margin: 0 0 6px;
            }

            .letterhead .meta {
                font-size: 10px;
                color: #334155;
                margin: 0;
            }

            .letterhead img {
                display: block;
                margin: 0 auto 6px;
                width: 72px;
                height: 72px;
                object-fit: contain;
            }

            .section-title {
                font-size: 16px;
                letter-spacing: 2px;
                text-transform: uppercase;
                margin: 24px 0 16px;
            }

            .subtitle {
                color: #64748b;
                margin: 4px 0 0;
                font-size: 12px;
            }

            table {
                width: 100%;
                border-collapse: collapse;
                margin: 12px 0 20px;
            }

            th {
                text-align: left;
                font-size: 10px;
                text-transform: uppercase;
                color: #94a3b8;
                padding: 8px 4px;
                border-bottom: 1px solid #e2e8f0;
            }

            td {
                padding: 8px 4px;
                border-bottom: 1px solid #f1f5f9;
                font-size: 13px;
            }

            .right {
                text-align: right;
            }

            .amount {
                font-size: 22px;
                font-weight: bold;
                margin: 0;
            }

            .footer {
                font-size: 10px;
                color: #94a3b8;
                text-align: center;
                margin-top: 24px;
            }
            """;

        StringBuilder html = new StringBuilder();

        html.append("<html><head><style>")
                .append(css)
                .append("</style></head><body>")
                .append("<div class=\"card\">");

        // LETTERHEAD
        html.append("<div class=\"letterhead\">");

        if (notBlank(logoDataUri)) {
            html.append("<img src=\"")
                    .append(escAttr(logoDataUri))
                    .append("\" alt=\"School logo\"/>");
        }

        if (notBlank(schoolName)) {
            html.append("<p class=\"name\">")
                    .append(esc(schoolName))
                    .append("</p>");
        }

        if (profile != null && notBlank(profile.getMotto())) {
            html.append("<p class=\"motto\">&quot;")
                    .append(esc(profile.getMotto()))
                    .append("&quot;</p>");
        }

        String postalAddress =
                profile != null
                        ? trimToNull(profile.getPostalAddress())
                        : null;

        String physicalAddress =
                profile != null
                        ? trimToNull(profile.getAddress())
                        : null;

        if (postalAddress != null || physicalAddress != null) {
            html.append("<p class=\"meta\">");

            if (postalAddress != null) {
                html.append(esc(postalAddress));
            }

            if (postalAddress != null && physicalAddress != null) {
                html.append(" · ");
            }

            if (physicalAddress != null) {
                html.append(esc(physicalAddress));
            }

            html.append("</p>");
        }

        String phone =
                profile != null
                        ? trimToNull(profile.getContactPhone())
                        : null;

        String email =
                profile != null
                        ? trimToNull(profile.getContactEmail())
                        : null;

        if (phone != null || email != null) {
            html.append("<p class=\"meta\">");

            if (phone != null) {
                html.append("Tel: ")
                        .append(esc(phone));
            }

            if (phone != null && email != null) {
                html.append(" · ");
            }

            if (email != null) {
                html.append(esc(email));
            }

            html.append("</p>");
        }

        html.append("</div>");

        // RECEIPT CONTENT
        html.append("<h1 class=\"section-title\">Official receipt</h1>");

        html.append("<p class=\"subtitle\">Receipt No. ")
                .append(esc(receiptNo))
                .append("</p>");

        html.append("<table><tbody>")
                .append(row(
                        "Student",
                        student.getFirstName()
                                + " "
                                + student.getLastName()
                ))
                .append(row("Class", className))
                .append(row(
                        "Invoice",
                        nullToDash(invoice.getInvoiceNumber())
                ))
                .append(row(
                        "Term",
                        invoice.getTerm() != null
                                ? invoice.getTerm().getName()
                                : "—"
                ))
                .append(row("Date paid", paidOn))
                .append(row(
                        "Method",
                        nullToDash(payment.getMethod())
                ))
                .append(row(
                        "Reference",
                        nullToDash(payment.getReference())
                ))
                .append("</tbody></table>");

        html.append(
                "<p class=\"subtitle\" style=\"margin-top:16px\">"
                        + "This payment is towards"
                        + "</p>"
        );

        html.append("<table>")
                .append("<thead>")
                .append("<tr>")
                .append("<th>Item</th>")
                .append("<th class=\"right\">Amount</th>")
                .append("</tr>")
                .append("</thead>")
                .append("<tbody>")
                .append(itemRows)
                .append("</tbody>")
                .append("</table>");

        html.append(
                "<p class=\"subtitle\">Amount received</p>"
        );

        html.append("<p class=\"amount\">KES ")
                .append(money(payment.getAmount()))
                .append("</p>");

        html.append("<table><tbody>")
                .append(row(
                        "Invoice total",
                        "KES " + money(billed)
                ))
                .append(row(
                        "Paid to date",
                        "KES " + money(paidToDate)
                ))
                .append(row(
                        "Balance",
                        "KES " + money(balance)
                ))
                .append("</tbody></table>");

        html.append(
                "<p class=\"footer\">"
                        + "This is a computer-generated receipt. "
                        + "Keep it for your records."
                        + "</p>"
        );

        html.append("</div></body></html>");

        return html.toString();
    }

    private String row(String label, String value) {
        return "<tr><th>"
                + esc(label)
                + "</th><td class=\"right\">"
                + esc(value)
                + "</td></tr>";
    }

    private String money(BigDecimal n) {
        if (n == null) {
            return "0.00";
        }

        return n.setScale(
                2,
                RoundingMode.HALF_UP
        ).toPlainString();
    }

    private String nullToDash(String s) {
        return notBlank(s) ? s : "—";
    }

    private String trimToNull(String s) {
        return notBlank(s) ? s.trim() : null;
    }

    private boolean notBlank(String s) {
        return s != null && !s.isBlank();
    }

    private String esc(String s) {
        if (s == null) {
            return "";
        }

        return s
                .replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&#39;");
    }

    private String escAttr(String s) {
        return esc(s);
    }
}