package com.stanford.schoolbackend.sms.exams;

import com.openhtmltopdf.pdfboxout.PdfRendererBuilder;
import com.stanford.schoolbackend.core.exception.ResourceNotFoundException;
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

    public byte[] generateReportCard(Long studentId, Long examId) {
        // reuses Phase 4's security check (student can only view their own) automatically
        StudentExamResultResponse result = examResultService.getStudentResult(studentId, examId);

        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new ResourceNotFoundException("Exam not found"));
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));

        String html = buildHtml(result, exam, student);

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

    private String buildHtml(StudentExamResultResponse result, Exam exam, Student student) {
        String admissionNumber = student.getAdmissionNumber() != null ? student.getAdmissionNumber() : "—";

        StringBuilder subjectRows = new StringBuilder();
        for (MarkResponse subject : result.getSubjectResults()) {
            subjectRows.append("<tr>")
                    .append("<td class=\"subject\">").append(subject.getSubjectName()).append("</td>")
                    .append("<td>").append(subject.getScore()).append("/")
                    .append(String.format("%.0f", subject.getMaxScore())).append("</td>")
                    .append("<td>").append(String.format("%.0f", subject.getPercentage())).append("%</td>")
                    .append("<td>").append(subject.getGrade()).append("</td>")
                    .append("</tr>");
        }

        String css = """
            body { font-family: Helvetica, Arial, sans-serif; color: #1e293b; padding: 24px; }
            .card { border: 1px solid #e2e8f0; border-radius: 8px; padding: 32px; }
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

        return "<html><head><style>" + css + "</style></head><body>"
                + "<div class=\"card\">"
                + "<div class=\"header\">"
                + "<div><p class=\"name\">" + result.getStudentName() + "</p>"
                + "<p class=\"subtitle\">Student Report Card</p></div>"
                + "<div class=\"exam-info\"><div>" + exam.getName() + "</div><div>" + exam.getTerm().getName() + "</div></div>"
                + "</div>"

                + "<div class=\"info-grid\">"
                + "<div><p class=\"info-label\">Student</p><p class=\"info-value\">" + result.getStudentName() + "</p></div>"
                + "<div><p class=\"info-label\">Admission #</p><p class=\"info-value\">" + admissionNumber + "</p></div>"
                + "<div><p class=\"info-label\">Class</p><p class=\"info-value\">" + result.getClassSectionName() + "</p></div>"
                + "<div><p class=\"info-label\">Position</p><p class=\"info-value\">" + result.getPosition() + " out of " + result.getOutOf() + "</p></div>"
                + "</div>"

                + "<table><thead><tr><th>Subject</th><th>Score</th><th>%</th><th>Grade</th></tr></thead>"
                + "<tbody>" + subjectRows + "</tbody></table>"

                + "<div class=\"summary\">"
                + "<div><p class=\"info-label\">Total score</p><p class=\"info-value\">" + result.getTotalScore() + "</p></div>"
                + "<div><p class=\"info-label\">Mean %</p><p class=\"info-value\">" + String.format("%.0f", result.getMeanPercentage()) + "%</p></div>"
                + "<div><p class=\"info-label\">Overall grade</p><p class=\"info-value\">" + result.getOverallGrade() + "</p></div>"
                + "<div><p class=\"info-label\">Class position</p><p class=\"info-value\">" + result.getPosition() + "/" + result.getOutOf() + "</p></div>"
                + "</div>"

                + "<div class=\"remarks\">"
                + "<div style=\"flex:1\"><p class=\"info-label\">Class Teacher's Remarks</p><div class=\"remarks-box\"></div></div>"
                + "<div style=\"flex:1\"><p class=\"info-label\">Principal's Remarks</p><div class=\"remarks-box\"></div></div>"
                + "</div>"

                + "<p class=\"footer-note\">EE = Exceeding Expectation &#183; ME = Meeting Expectation &#183; AE = Approaching Expectation &#183; BE = Below Expectation</p>"
                + "</div></body></html>";
    }
}

// TODO when a teacher logs in, he or she can see only his or her students, only see things that affect his or her student