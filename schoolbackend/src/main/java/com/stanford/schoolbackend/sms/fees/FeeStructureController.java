package com.stanford.schoolbackend.sms.fees;

import com.stanford.schoolbackend.sms.fees.dto.FeeStructureLineResponse;
import com.stanford.schoolbackend.sms.fees.dto.ReplaceGradeStructureRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/fee-structures")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN','ACCOUNTANT')")
public class FeeStructureController {

    private final FeeStructureService feeStructureService;

    @GetMapping("/{gradeLevelId}")
    public ResponseEntity<List<FeeStructureLineResponse>> list(@PathVariable Long gradeLevelId) {
        return ResponseEntity.ok(feeStructureService.listForGrade(gradeLevelId));
    }

    @PutMapping("/{gradeLevelId}")
    public ResponseEntity<List<FeeStructureLineResponse>> replace(
            @PathVariable Long gradeLevelId,
            @Valid @RequestBody ReplaceGradeStructureRequest request) {
        return ResponseEntity.ok(feeStructureService.replaceForGrade(gradeLevelId, request));
    }

    @PostMapping("/{gradeLevelId}/copy-from")
    public ResponseEntity<List<FeeStructureLineResponse>> copyFrom(
            @PathVariable Long gradeLevelId,
            @RequestBody Map<String, Long> body) {
        Long sourceId = body.get("sourceGradeLevelId");
        if (sourceId == null) throw new IllegalArgumentException("sourceGradeLevelId is required");
        return ResponseEntity.ok(feeStructureService.copyFrom(gradeLevelId, sourceId));
    }
}