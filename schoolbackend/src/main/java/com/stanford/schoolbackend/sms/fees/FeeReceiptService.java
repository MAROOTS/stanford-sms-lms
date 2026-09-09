package com.stanford.schoolbackend.sms.fees;

import com.openhtmltopdf.pdfboxout.PdfRendererBuilder;
import com.stanford.schoolbackend.core.exception.ResourceNotFoundException;
import com.stanford.schoolbackend.core.school.School;
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
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found"));

        assertSchool(invoice);

        FeePayment payment = feePaymentRepository.findById(paymentId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found"));

        if (!payment.getInvoice().getId().equals(invoiceId)) {
            throw new ResourceNotFoundException("Payment not found");
        }

        assertCanView(invoice);

        BigDecimal billed = invoice.getLineItems().stream()
                .map(FeeInvoiceLineItem::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal paidToDate = feePaymentRepository.findByInvoiceId(invoice.getId())
                .stream()
                .map(FeePayment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal balance = billed.subtract(paidToDate);

        var profile = schoolProfileRepository
                .findBySchoolId(invoice.getSchool().getId())
                .orElse(null);

        String schoolName = officialName(invoice.getSchool(), profile);

        String logoDataUri = (profile != null)
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
            throw new RuntimeException("Failed to generate receipt PDF", e);
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
        boolean privileged = SecurityUtils.currentUserHasRole("ADMIN")
                || SecurityUtils.currentUserHasRole("ACCOUNTANT");

        Student student = invoice.getStudent();

        boolean own = student.getUsername().equals(SecurityUtils.currentUsername());

        boolean parent = SecurityUtils.currentUserHasRole("PARENT")
                && parentAccessService.isCurrentUserParentOf(student.getId());

        if (!privileged && !own && !parent) {
            throw new AccessDeniedException("You cannot view this receipt");
        }
    }

    private String officialName(School school, SchoolProfile profile) {
        String fromSchool = school != null && school.getName() != null
                ? school.getName().trim()
                : "";

        String fromProfile = profile != null && profile.getName() != null
                ? profile.getName().trim()
                : "";

        // pick the longer so "Alliance High School" wins over "Alliance"
        if (fromProfile.length() > fromSchool.length()) {
            return fromProfile;
        }

        if (!fromSchool.isBlank()) {
            return fromSchool;
        }

        return fromProfile.isBlank() ? "School" : fromProfile;
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

        String className = (student.getClassSection() != null)
                ? student.getClassSection().getName()
                : "—";

        String receiptNo = (invoice.getInvoiceNumber() != null
                ? invoice.getInvoiceNumber()
                : "INV") + "-P" + payment.getId();

        String paidOn = payment.getPaymentDate() != null
                ? payment.getPaymentDate()
                .format(DateTimeFormatter.ISO_LOCAL_DATE)
                : "—";

        String logoImg = (logoDataUri != null)
                ? "<img src=\"" + logoDataUri
                  + "\" style=\"width:64px;height:64px;object-fit:contain;\"/>"
                : "";

        String address = profile != null
                ? nullToDash(profile.getAddress())
                : "—";

        String phone = profile != null
                ? nullToDash(profile.getContactPhone())
                : "—";

        StringBuilder itemRows = new StringBuilder();

        for (FeeInvoiceLineItem li : invoice.getLineItems()) {
            itemRows.append("<tr><td>")
                    .append(esc(
                            li.getFeeItem() != null
                                    ? li.getFeeItem().getName()
                                    : "Fee"
                    ))
                    .append("</td><td class=\"right\">KES ")
                    .append(money(li.getAmount()))
                    .append("</td></tr>");
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

            .header {
                display: flex;
                align-items: center;
                gap: 16px;
                margin-bottom: 8px;
            }

            .name {
                font-size: 18px;
                font-weight: bold;
                margin: 0;
            }

            .subtitle {
                color: #64748b;
                margin: 4px 0 0;
                font-size: 12px;
            }

            h1 {
                font-size: 16px;
                letter-spacing: 2px;
                text-transform: uppercase;
                margin: 24px 0 16px;
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

        return "<html><head><style>" + css + "</style></head><body><div class=\"card\">"

                + "<div class=\"header\">"
                + logoImg
                + "<div>"
                + "<p class=\"name\">" + esc(schoolName) + "</p>"
                + "<p class=\"subtitle\">"
                + esc(address)
                + " · "
                + esc(phone)
                + "</p>"
                + "</div>"
                + "</div>"

                + "<h1>Official receipt</h1>"

                + "<p class=\"subtitle\">Receipt No. "
                + esc(receiptNo)
                + "</p>"

                + "<table><tbody>"
                + row(
                "Student",
                student.getFirstName() + " " + student.getLastName()
        )
                + row("Class", className)
                + row(
                "Invoice",
                nullToDash(invoice.getInvoiceNumber())
        )
                + row(
                "Term",
                invoice.getTerm() != null
                        ? invoice.getTerm().getName()
                        : "—"
        )
                + row("Date paid", paidOn)
                + row("Method", payment.getMethod())
                + row(
                "Reference",
                nullToDash(payment.getReference())
        )
                + "</tbody></table>"

                + "<p class=\"subtitle\" style=\"margin-top:16px\">"
                + "This payment is towards"
                + "</p>"

                + "<table>"
                + "<thead>"
                + "<tr>"
                + "<th>Item</th>"
                + "<th class=\"right\">Amount</th>"
                + "</tr>"
                + "</thead>"
                + "<tbody>"
                + itemRows
                + "</tbody>"
                + "</table>"

                + "<p class=\"subtitle\">Amount received</p>"

                + "<p class=\"amount\">KES "
                + money(payment.getAmount())
                + "</p>"

                + "<table><tbody>"
                + row("Invoice total", "KES " + money(billed))
                + row("Paid to date", "KES " + money(paidToDate))
                + row("Balance", "KES " + money(balance))
                + "</tbody></table>"

                + "<p class=\"footer\">"
                + "This is a computer-generated receipt. Keep it for your records."
                + "</p>"

                + "</div></body></html>";
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
        return (s == null || s.isBlank()) ? "—" : s;
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
}
