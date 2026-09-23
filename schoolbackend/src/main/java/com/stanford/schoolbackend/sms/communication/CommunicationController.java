package com.stanford.schoolbackend.sms.communication;

import com.stanford.schoolbackend.sms.communication.dto.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/communications")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN','ACCOUNTANT')")
public class CommunicationController {

    private final CommunicationService communicationService;

    @PostMapping("/preview")
    public CampaignPreviewResponse preview(@Valid @RequestBody CampaignRequest request) {
        return communicationService.preview(request);
    }

    @PostMapping
    public ResponseEntity<CampaignResponse> send(@Valid @RequestBody CampaignRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(communicationService.createAndSend(request));
    }

    @GetMapping
    public List<CampaignResponse> list() {
        return communicationService.list();
    }

    @GetMapping("/{id}")
    public CampaignResponse get(@PathVariable Long id) {
        return communicationService.get(id);
    }
}