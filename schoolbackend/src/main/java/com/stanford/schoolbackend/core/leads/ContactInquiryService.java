package com.stanford.schoolbackend.core.leads;

import com.stanford.schoolbackend.core.email.EmailService;
import com.stanford.schoolbackend.core.enums.ContactInquiryStatus;
import com.stanford.schoolbackend.core.exception.ResourceNotFoundException;
import com.stanford.schoolbackend.core.leads.dto.*;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ContactInquiryService {

    private final ContactInquiryRepository contactInquiryRepository;
    private final EmailService emailService;

    public void submit(PublicContactRequest request, HttpServletRequest httpRequest) {
        // honeypot tripped — silently pretend success, don't persist or notify
        if (request.getCompanyWebsite() != null && !request.getCompanyWebsite().isBlank()) {
            return;
        }

        ContactInquiry inquiry = ContactInquiry.builder()
                .schoolName(request.getSchoolName())
                .contactName(request.getContactName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .studentCountEstimate(request.getStudentCountEstimate())
                .message(request.getMessage())
                .ipAddress(resolveIp(httpRequest))
                .build();

        ContactInquiry saved = contactInquiryRepository.save(inquiry);
        emailService.sendContactInquiryNotification(saved);
    }

    public List<ContactInquiryResponse> listAll(ContactInquiryStatus statusFilter) {
        List<ContactInquiry> inquiries = statusFilter != null
                ? contactInquiryRepository.findByStatusOrderBySubmittedAtDesc(statusFilter)
                : contactInquiryRepository.findAllByOrderBySubmittedAtDesc();
        return inquiries.stream().map(this::toResponse).toList();
    }

    public ContactInquiryResponse updateStatus(Long id, UpdateInquiryStatusRequest request) {
        ContactInquiry inquiry = contactInquiryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Inquiry not found"));
        inquiry.setStatus(request.getStatus());
        return toResponse(contactInquiryRepository.save(inquiry));
    }

    private String resolveIp(HttpServletRequest request) {
        String forwardedFor = request.getHeader("X-Forwarded-For");
        if (forwardedFor != null && !forwardedFor.isBlank()) {
            return forwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    private ContactInquiryResponse toResponse(ContactInquiry i) {
        return ContactInquiryResponse.builder()
                .id(i.getId())
                .schoolName(i.getSchoolName())
                .contactName(i.getContactName())
                .email(i.getEmail())
                .phone(i.getPhone())
                .studentCountEstimate(i.getStudentCountEstimate())
                .message(i.getMessage())
                .status(i.getStatus())
                .submittedAt(i.getSubmittedAt())
                .build();
    }
}