package com.stanford.schoolbackend.sms.fees;

import com.stanford.schoolbackend.core.exception.ResourceNotFoundException;
import com.stanford.schoolbackend.core.school.School;
import com.stanford.schoolbackend.core.school.SchoolRepository;
import com.stanford.schoolbackend.core.security.SecurityUtils;
import com.stanford.schoolbackend.sms.fees.dto.FeeItemRequest;
import com.stanford.schoolbackend.sms.fees.dto.FeeItemResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FeeItemService {

    private final FeeItemRepository feeItemRepository;
    private final SchoolRepository schoolRepository;
    private final FeeInvoiceLineItemRepository feeInvoiceLineItemRepository;
    public FeeItemResponse create(FeeItemRequest request) {
        School school = schoolRepository.findById(SecurityUtils.currentSchoolId())
                .orElseThrow(() -> new ResourceNotFoundException("School not found"));
        FeeItem item = FeeItem.builder()
                .school(school)
                .name(request.getName())
                .defaultAmount(request.getDefaultAmount())
                .build();
        return toResponse(feeItemRepository.save(item));
    }

    public FeeItemResponse update(Long id, FeeItemRequest request) {
        FeeItem item = getOrThrow(id);
        item.setName(request.getName());
        item.setDefaultAmount(request.getDefaultAmount());
        return toResponse(feeItemRepository.save(item));
    }

    public void delete(Long id) {
        FeeItem item = getOrThrow(id);
        if (feeInvoiceLineItemRepository.existsByFeeItemId(id)) {
            throw new IllegalArgumentException(
                    "Cannot delete \"" + item.getName()
                            + "\" because it is already used on invoices. Remove it from those invoices first, or leave it and stop using it for new bills.");
        }
        feeItemRepository.delete(item);
    }

    public List<FeeItemResponse> listAll() {
        return feeItemRepository.findBySchoolId(SecurityUtils.currentSchoolId()).stream()
                .map(this::toResponse)
                .toList();
    }

    private FeeItem getOrThrow(Long id) {
        FeeItem item = feeItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Fee item not found"));
        Long schoolId = SecurityUtils.currentSchoolId();
        if (schoolId == null || item.getSchool() == null
                || !schoolId.equals(item.getSchool().getId())) {
            throw new ResourceNotFoundException("Fee item not found");
        }
        return item;
    }

    private FeeItemResponse toResponse(FeeItem i) {
        return FeeItemResponse.builder().id(i.getId()).name(i.getName()).defaultAmount(i.getDefaultAmount()).build();
    }
}