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
        feeItemRepository.delete(getOrThrow(id));
    }

    public List<FeeItemResponse> listAll() {
        return feeItemRepository.findAll().stream().map(this::toResponse).toList();
    }

    private FeeItem getOrThrow(Long id) {
        return feeItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Fee item not found"));
    }

    private FeeItemResponse toResponse(FeeItem i) {
        return FeeItemResponse.builder().id(i.getId()).name(i.getName()).defaultAmount(i.getDefaultAmount()).build();
    }
}