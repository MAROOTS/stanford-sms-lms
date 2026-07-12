package com.stanford.schoolbackend.sms.fees;

import com.stanford.schoolbackend.sms.fees.dto.FeeItemRequest;
import com.stanford.schoolbackend.sms.fees.dto.FeeItemResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/fee-items")
@RequiredArgsConstructor
public class FeeItemController {

    private final FeeItemService feeItemService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<FeeItemResponse> create(@Valid @RequestBody FeeItemRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(feeItemService.create(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<FeeItemResponse> update(@PathVariable Long id, @Valid @RequestBody FeeItemRequest request) {
        return ResponseEntity.ok(feeItemService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        feeItemService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<FeeItemResponse>> listAll() {
        return ResponseEntity.ok(feeItemService.listAll());
    }
}