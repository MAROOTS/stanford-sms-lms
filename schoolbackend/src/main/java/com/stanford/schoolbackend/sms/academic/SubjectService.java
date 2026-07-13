package com.stanford.schoolbackend.sms.academic;

import com.stanford.schoolbackend.core.exception.ResourceNotFoundException;
import com.stanford.schoolbackend.sms.academic.dto.SubjectRequest;
import com.stanford.schoolbackend.sms.academic.dto.SubjectResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SubjectService {

    private final SubjectRepository subjectRepository;

    public SubjectResponse create(SubjectRequest request) {
        Subject subject = Subject.builder()
                .name(request.getName())
                .code(request.getCode())
                .description(request.getDescription())
                .category(request.getCategory())
                .credits(request.getCredits())
                .build();
        return toResponse(subjectRepository.save(subject));
    }

    public SubjectResponse update(Long id, SubjectRequest request) {
        Subject subject = getOrThrow(id);
        subject.setName(request.getName());
        subject.setCode(request.getCode());
        subject.setDescription(request.getDescription());
        subject.setCategory(request.getCategory());
        subject.setCredits(request.getCredits());
        return toResponse(subjectRepository.save(subject));
    }

    public void delete(Long id) {
        subjectRepository.delete(getOrThrow(id));
    }

    public List<SubjectResponse> listAll() {
        return subjectRepository.findAll().stream().map(this::toResponse).toList();
    }

    private Subject getOrThrow(Long id) {
        return subjectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Subject not found"));
    }

    private SubjectResponse toResponse(Subject s) {
        return SubjectResponse.builder().id(s.getId()).name(s.getName()).code(s.getCode())
                .description(s.getDescription()).category(s.getCategory()).credits(s.getCredits()).build();
    }
}