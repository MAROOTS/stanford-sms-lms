package com.stanford.schoolbackend.sms.exams;

import com.stanford.schoolbackend.core.exception.ResourceNotFoundException;
import com.stanford.schoolbackend.core.school.School;
import com.stanford.schoolbackend.core.school.SchoolRepository;
import com.stanford.schoolbackend.core.security.SecurityUtils;
import com.stanford.schoolbackend.sms.exams.dto.TermRequest;
import com.stanford.schoolbackend.sms.exams.dto.TermResponse;
import com.stanford.schoolbackend.sms.fees.FeeInvoiceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TermService {

    private final TermRepository termRepository;
    private final SchoolRepository schoolRepository;
    private final FeeInvoiceRepository feeInvoiceRepository;
    private final ExamRepository examRepository;
    @Transactional
    public TermResponse create(TermRequest request) {
        if (Boolean.TRUE.equals(request.getIsCurrent())) {
            unsetExistingCurrent();
        }
        School school = schoolRepository.findById(SecurityUtils.currentSchoolId())
                .orElseThrow(() -> new ResourceNotFoundException("School not found"));
        Term term = Term.builder()
                .school(school)
                .name(request.getName())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .isCurrent(Boolean.TRUE.equals(request.getIsCurrent()))
                .build();

        return toResponse(termRepository.save(term));
    }

    @Transactional
    public TermResponse update(Long id, TermRequest request) {
        Term term = getOrThrow(id);

        if (Boolean.TRUE.equals(request.getIsCurrent())) {
            unsetExistingCurrent();
        }

        term.setName(request.getName());
        term.setStartDate(request.getStartDate());
        term.setEndDate(request.getEndDate());
        term.setCurrent(Boolean.TRUE.equals(request.getIsCurrent()));
        return toResponse(termRepository.save(term));
    }

    public void delete(Long id) {
        Term term = getOrThrow(id);
        if (feeInvoiceRepository.existsByTermId(id)) {
            throw new IllegalArgumentException(
                    "Cannot delete \"" + term.getName()
                            + "\" because invoices exist for this term.");
        }
        if (examRepository.existsByTermId(id)) {
            throw new IllegalArgumentException(
                    "Cannot delete \"" + term.getName()
                            + "\" because exams exist for this term.");
        }
        termRepository.delete(term);
    }

    public List<TermResponse> listAll() {
        return termRepository.findBySchoolId(SecurityUtils.currentSchoolId()).stream()
                .map(this::toResponse)
                .toList();    }

    private void unsetExistingCurrent() {
        termRepository.findByIsCurrentTrueAndSchoolId(SecurityUtils.currentSchoolId())
                .ifPresent(existing -> {
                    existing.setCurrent(false);
                    termRepository.save(existing);
                });
    }

    private Term getOrThrow(Long id) {
        Term term = termRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Term not found"));
        Long schoolId = SecurityUtils.currentSchoolId();
        if (schoolId == null || term.getSchool() == null
                || !schoolId.equals(term.getSchool().getId())) {
            throw new ResourceNotFoundException("Term not found");
        }
        return term;
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