package com.stanford.schoolbackend.core.leads;

import com.stanford.schoolbackend.core.enums.ContactInquiryStatus;
import com.stanford.schoolbackend.core.leads.dto.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/contact-inquiries")
@RequiredArgsConstructor
public class ContactInquiryController {

    private final ContactInquiryService contactInquiryService;

    @PostMapping
    public ResponseEntity<Void> submit(@Valid @RequestBody PublicContactRequest request, HttpServletRequest httpRequest) {
        contactInquiryService.submit(request, httpRequest);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ContactInquiryResponse>> listAll(@RequestParam(required = false) ContactInquiryStatus status) {
        return ResponseEntity.ok(contactInquiryService.listAll(status));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ContactInquiryResponse> updateStatus(@PathVariable Long id, @Valid @RequestBody UpdateInquiryStatusRequest request) {
        return ResponseEntity.ok(contactInquiryService.updateStatus(id, request));
    }
}