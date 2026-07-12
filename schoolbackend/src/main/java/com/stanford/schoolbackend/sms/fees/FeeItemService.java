package com.stanford.schoolbackend.sms.fees;

import com.stanford.schoolbackend.core.exception.ResourceNotFoundException;
import com.stanford.schoolbackend.sms.fees.dto.FeeItemRequest;
import com.stanford.schoolbackend.sms.fees.dto.FeeItemResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FeeItemService {

    private final FeeItemRepository feeItemRepository;

    public FeeItemResponse create(FeeItemRequest request) {
        FeeItem item = FeeItem.builder().name(request.getName()).build();
        return toResponse(feeItemRepository.save(item));
    }

    public FeeItemResponse update(Long id, FeeItemRequest request) {
        FeeItem item = getOrThrow(id);
        item.setName(request.getName());
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
        return FeeItemResponse.builder().id(i.getId()).name(i.getName()).build();
    }
}