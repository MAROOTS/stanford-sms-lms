package com.stanford.schoolbackend.sms.exams;

import com.openhtmltopdf.pdfboxout.PdfRendererBuilder;
import com.stanford.schoolbackend.core.exception.ResourceNotFoundException;
import com.stanford.schoolbackend.core.school.School;
import com.stanford.schoolbackend.core.school.SchoolProfile;
import com.stanford.schoolbackend.core.school.SchoolProfileRepository;
import com.stanford.schoolbackend.core.security.SecurityUtils;
import com.stanford.schoolbackend.core.storage.FileStorageService;
import com.stanford.schoolbackend.sms.exams.dto.MarkResponse;
import com.stanford.schoolbackend.sms.exams.dto.StudentExamResultResponse;
import com.stanford.schoolbackend.sms.student.Student;
import com.stanford.schoolbackend.sms.student.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;

@Service
@RequiredArgsConstructor
public class ReportCardService {

    private final ExamResultService examResultService;
    private final ExamRepository examRepository;
    private final StudentRepository studentRepository;
    private final SchoolProfileRepository schoolProfileRepository;
    private final FileStorageService fileStorageService;

    public byte[] generateReportCard(Long studentId, Long examId) {
        StudentExamResultResponse result = examResultService.getStudentResult(studentId, examId);

        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new ResourceNotFoundException("Exam not found"));
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));

        assertCurrentSchool(exam.getSchool(), "Exam not found");
        assertCurrentSchool(student.getSchool(), "Student not found");

        School school = exam.getSchool();
        SchoolProfile profile = schoolProfileRepository.findBySchoolId(school.getId()).orElse(null);

        String schoolName = profile != null && notBlank(profile.getName())
                ? profile.getName().trim()
                : school.getName();

        String logoDataUri = profile != null
                ? fileStorageService.toDataUri(profile.getLogoObjectKey())
                : null;

        String html = buildHtml(result, exam, student, schoolName, logoDataUri, profile);

        try {
            ByteArrayOutputStream os = new ByteArrayOutputStream();
            PdfRendererBuilder builder = new PdfRendererBuilder();
            builder.useFastMode();
            builder.withHtmlContent(html, null);
            builder.toStream(os);
            builder.run();
            return os.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate report card PDF", e);
        }
    }

    private void assertCurrentSchool(School school, String notFoundMessage) {
        Long schoolId = SecurityUtils.currentSchoolId();
        if (schoolId == null || school == null || !schoolId.equals(school.getId())) {
            throw new ResourceNotFoundException(notFoundMessage);
        }
    }

    private String buildHtml(
            StudentExamResultResponse result,
            Exam exam,
            Student student,
            String schoolName,
            String logoDataUri,
            SchoolProfile profile
    ) {
        String admissionNumber = notBlank(student.getAdmissionNumber())
                ? student.getAdmissionNumber()
                : (student.getUsername() != null ? student.getUsername() : "—");
        String kemis = notBlank(student.getKemisNumber()) ? student.getKemisNumber() : "—";
        String className = result.getClassSectionName() != null ? result.getClassSectionName() : "—";

        StringBuilder subjectRows = new StringBuilder();
        for (MarkResponse subject : result.getSubjectResults()) {
            subjectRows.append("<tr>")
                    .append("<td class=\"subject\">").append(esc(subject.getSubjectName())).append("</td>")
                    .append("<td>").append(subject.getScore()).append("/")
                    .append(String.format("%.0f", subject.getMaxScore())).append("</td>")
                    .append("<td>").append(String.format("%.0f", subject.getPercentage())).append("%</td>")
                    .append("<td>").append(esc(subject.getGrade())).append("</td>")
                    .append("</tr>");
        }

        String css = """
            body { font-family: Helvetica, Arial, sans-serif; color: #1e293b; padding: 24px; }
            .card { border: 1px solid #e2e8f0; border-radius: 8px; padding: 32px; }
            .letterhead { text-align: center; margin-bottom: 18px; border-bottom: 2px solid #0f172a; padding-bottom: 12px; }
            .letterhead .name { font-size: 18px; font-weight: 700; margin: 6px 0 2px; letter-spacing: .02em; }
            .letterhead .motto { font-size: 11px; font-style: italic; color: #475569; margin: 0 0 6px; }
            .letterhead .meta { font-size: 10px; color: #334155; margin: 0; }
            .letterhead img { display: block; margin: 0 auto 6px; width: 72px; height: 72px; object-fit: contain; }
            .header { display: flex; justify-content: space-between; border-bottom: 1px solid #e2e8f0; padding-bottom: 16px; margin-bottom: 16px; }
            .name { font-size: 20px; font-weight: bold; margin: 0; }
            .subtitle { color: #64748b; margin: 2px 0 0; font-size: 13px; }
            .exam-info { text-align: right; font-size: 13px; color: #334155; }
            .info-grid { display: flex; justify-content: space-between; margin-bottom: 20px; }
            .info-label { font-size: 11px; text-transform: uppercase; color: #94a3b8; margin: 0; }
            .info-value { font-weight: bold; margin: 2px 0 0; font-size: 14px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th { text-align: left; font-size: 11px; text-transform: uppercase; color: #94a3b8; padding: 8px 4px; border-bottom: 1px solid #e2e8f0; }
            td { padding: 10px 4px; border-bottom: 1px solid #f1f5f9; font-size: 13px; }
            .subject { font-weight: 600; }
            .summary { display: flex; justify-content: space-between; padding-top: 12px; border-top: 1px solid #e2e8f0; margin-bottom: 20px; }
            .remarks { display: flex; justify-content: space-between; gap: 16px; margin-bottom: 16px; }
            .remarks-box { flex: 1; border: 1px dashed #cbd5e1; border-radius: 6px; height: 50px; }
            .footer-note { font-size: 10px; color: #94a3b8; text-align: center; margin-top: 8px; }
            """;

        StringBuilder html = new StringBuilder();
        html.append("<html><head><style>").append(css).append("</style></head><body>");
        html.append("<div class=\"card\">");

        html.append("<div class=\"letterhead\">");
        if (notBlank(logoDataUri)) {
            html.append("<img src=\"").append(escAttr(logoDataUri)).append("\" alt=\"School logo\"/>");
        }
        if (notBlank(schoolName)) {
            html.append("<p class=\"name\">").append(esc(schoolName)).append("</p>");
        }
        if (profile != null && notBlank(profile.getMotto())) {
            html.append("<p class=\"motto\">&quot;").append(esc(profile.getMotto())).append("&quot;</p>");
        }
        String postalAddress = profile != null ? trimToNull(profile.getPostalAddress()) : null;
        String physicalAddress = profile != null ? trimToNull(profile.getAddress()) : null;
        if (postalAddress != null || physicalAddress != null) {
            html.append("<p class=\"meta\">");
            if (postalAddress != null) html.append(esc(postalAddress));
            if (postalAddress != null && physicalAddress != null) html.append(" · ");
            if (physicalAddress != null) html.append(esc(physicalAddress));
            html.append("</p>");
        }
        String phone = profile != null ? trimToNull(profile.getContactPhone()) : null;
        String email = profile != null ? trimToNull(profile.getContactEmail()) : null;
        if (phone != null || email != null) {
            html.append("<p class=\"meta\">");
            if (phone != null) html.append("Tel: ").append(esc(phone));
            if (phone != null && email != null) html.append(" · ");
            if (email != null) html.append(esc(email));
            html.append("</p>");
        }
        html.append("</div>");

        html.append("<div class=\"header\">");
        html.append("<div><p class=\"name\">").append(esc(result.getStudentName()))
                .append("</p><p class=\"subtitle\">Student Report Card</p></div>");
        html.append("<div class=\"exam-info\"><div>").append(esc(exam.getName()))
                .append("</div><div>").append(esc(exam.getTerm().getName()))
                .append("</div></div>");
        html.append("</div>");

        html.append("<div class=\"info-grid\">");
        html.append("<div><p class=\"info-label\">Student</p><p class=\"info-value\">")
                .append(esc(result.getStudentName())).append("</p></div>");
        html.append("<div><p class=\"info-label\">Admission #</p><p class=\"info-value\">")
                .append(esc(admissionNumber)).append("</p></div>");
        html.append("<div><p class=\"info-label\">KEMIS No.</p><p class=\"info-value\">")
                .append(esc(kemis)).append("</p></div>");
        html.append("<div><p class=\"info-label\">Class</p><p class=\"info-value\">")
                .append(esc(className)).append("</p></div>");
        html.append("</div>");

        html.append("<table><thead><tr><th>Subject</th><th>Score</th><th>%</th><th>Grade</th></tr></thead><tbody>")
                .append(subjectRows)
                .append("</tbody></table>");

        html.append("<div class=\"summary\">");
        html.append("<div><p class=\"info-label\">Total score</p><p class=\"info-value\">")
                .append(result.getTotalScore()).append("</p></div>");
        html.append("<div><p class=\"info-label\">Mean %</p><p class=\"info-value\">")
                .append(String.format("%.0f", result.getMeanPercentage())).append("%</p></div>");
        html.append("<div><p class=\"info-label\">Overall grade</p><p class=\"info-value\">")
                .append(esc(result.getOverallGrade())).append("</p></div>");
        html.append("</div>");

        html.append("<div class=\"remarks\">")
                .append("<div style=\"flex:1\"><p class=\"info-label\">Class Teacher's Remarks</p>")
                .append("<div class=\"remarks-box\"></div></div>")
                .append("<div style=\"flex:1\"><p class=\"info-label\">Principal's Remarks</p>")
                .append("<div class=\"remarks-box\"></div></div>")
                .append("</div>");

        html.append("<p class=\"footer-note\">EE = Exceeding Expectation &#183; ME = Meeting Expectation")
                .append(" &#183; AE = Approaching Expectation &#183; BE = Below Expectation</p>");

        html.append("</div></body></html>");
        return html.toString();
    }

    private String trimToNull(String s) {
        return notBlank(s) ? s.trim() : null;
    }

    private boolean notBlank(String s) {
        return s != null && !s.isBlank();
    }

    private String esc(String s) {
        if (s == null) return "";
        return s.replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&#39;");
    }

    private String escAttr(String s) {
        return esc(s);
    }
}