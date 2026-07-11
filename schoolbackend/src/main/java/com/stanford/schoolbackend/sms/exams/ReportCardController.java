package com.stanford.schoolbackend.sms.exams;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/report-cards")
@RequiredArgsConstructor
public class ReportCardController {

    private final ReportCardService reportCardService;

    @GetMapping("/student/{studentId}/exam/{examId}")
    @PreAuthorize("hasAnyRole('STUDENT','TEACHER','ADMIN')")
    public ResponseEntity<byte[]> generateReportCard(
            @PathVariable Long studentId, @PathVariable Long examId) {
        byte[] pdf = reportCardService.generateReportCard(studentId, examId);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDisposition(ContentDisposition.inline().filename("report-card.pdf").build());

        return ResponseEntity.ok().headers(headers).body(pdf);
    }
}

//No manual security check needed here —
// generateReportCard calls examResultService.getStudentResult(...) internally, which already throws AccessDeniedException if a student tries pulling someone else's report card