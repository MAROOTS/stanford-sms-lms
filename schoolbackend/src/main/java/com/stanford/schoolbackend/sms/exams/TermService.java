package com.stanford.schoolbackend.sms.exams;

import com.stanford.schoolbackend.core.exception.ResourceNotFoundException;
import com.stanford.schoolbackend.sms.exams.dto.TermRequest;
import com.stanford.schoolbackend.sms.exams.dto.TermResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TermService {

    private final TermRepository termRepository;

    @Transactional
    public TermResponse create(TermRequest request) {
        if (request.isCurrent()) {
            unsetExistingCurrent();
        }

        Term term = Term.builder()
                .name(request.getName())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .isCurrent(request.isCurrent())
                .build();

        return toResponse(termRepository.save(term));
    }

    @Transactional
    public TermResponse update(Long id, TermRequest request) {
        Term term = getOrThrow(id);

        if (request.isCurrent() && !term.isCurrent()) {
            unsetExistingCurrent();
        }

        term.setName(request.getName());
        term.setStartDate(request.getStartDate());
        term.setEndDate(request.getEndDate());
        term.setCurrent(request.isCurrent());

        return toResponse(termRepository.save(term));
    }

    public void delete(Long id) {
        termRepository.delete(getOrThrow(id));
    }

    public List<TermResponse> listAll() {
        return termRepository.findAll().stream().map(this::toResponse).toList();
    }

    private void unsetExistingCurrent() {
        termRepository.findByIsCurrentTrue().ifPresent(existing -> {
            existing.setCurrent(false);
            termRepository.save(existing);
        });
    }

    private Term getOrThrow(Long id) {
        return termRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Term not found"));
    }

    private TermResponse toResponse(Term t) {
        return TermResponse.builder()
                .id(t.getId())
                .name(t.getName())
                .startDate(t.getStartDate())
                .endDate(t.getEndDate())
                .isCurrent(t.isCurrent())
                .build();
    }
}