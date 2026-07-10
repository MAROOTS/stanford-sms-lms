package com.stanford.schoolbackend.sms.exams;

import com.stanford.schoolbackend.core.exception.ResourceNotFoundException;
import com.stanford.schoolbackend.sms.academic.ClassSection;
import com.stanford.schoolbackend.sms.academic.ClassSectionRepository;
import com.stanford.schoolbackend.sms.academic.Subject;
import com.stanford.schoolbackend.sms.academic.SubjectRepository;
import com.stanford.schoolbackend.sms.exams.dto.ExamRequest;
import com.stanford.schoolbackend.sms.exams.dto.ExamResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class ExamService {

    private final ExamRepository examRepository;
    private final TermRepository termRepository;
    private final ClassSectionRepository classSectionRepository;
    private final SubjectRepository subjectRepository;

    public ExamResponse create(ExamRequest request) {
        Term term = termRepository.findById(request.getTermId())
                .orElseThrow(() -> new ResourceNotFoundException("Term not found"));

        Exam exam = Exam.builder()
                .name(request.getName())
                .examType(request.getExamType())
                .term(term)
                .classSections(resolveClassSections(request.getClassSectionIds()))
                .subjects(resolveSubjects(request.getSubjectIds()))
                .build();

        return toResponse(examRepository.save(exam));
    }

    public ExamResponse update(Long id, ExamRequest request) {
        Exam exam = getOrThrow(id);

        Term term = termRepository.findById(request.getTermId())
                .orElseThrow(() -> new ResourceNotFoundException("Term not found"));

        exam.setName(request.getName());
        exam.setExamType(request.getExamType());
        exam.setTerm(term);
        exam.setClassSections(resolveClassSections(request.getClassSectionIds()));
        exam.setSubjects(resolveSubjects(request.getSubjectIds()));

        return toResponse(examRepository.save(exam));
    }

    public void delete(Long id) {
        examRepository.delete(getOrThrow(id));
    }

    public List<ExamResponse> listAll() {
        return examRepository.findAll().stream().map(this::toResponse).toList();
    }

    public ExamResponse getById(Long id) {
        return toResponse(getOrThrow(id));
    }

    private Set<ClassSection> resolveClassSections(List<Long> ids) {
        Set<ClassSection> sections = new HashSet<>(classSectionRepository.findAllById(ids));
        if (sections.size() != ids.size()) {
            throw new ResourceNotFoundException("One or more class sections not found");
        }
        return sections;
    }

    private Set<Subject> resolveSubjects(List<Long> ids) {
        Set<Subject> subjects = new HashSet<>(subjectRepository.findAllById(ids));
        if (subjects.size() != ids.size()) {
            throw new ResourceNotFoundException("One or more subjects not found");
        }
        return subjects;
    }

    private Exam getOrThrow(Long id) {
        return examRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Exam not found"));
    }

    private ExamResponse toResponse(Exam e) {
        return ExamResponse.builder()
                .id(e.getId())
                .name(e.getName())
                .examType(e.getExamType())
                .termId(e.getTerm().getId())
                .termName(e.getTerm().getName())
                .classSections(e.getClassSections().stream()
                        .map(cs -> ExamResponse.NamedItem.builder().id(cs.getId()).name(cs.getName()).build())
                        .toList())
                .subjects(e.getSubjects().stream()
                        .map(s -> ExamResponse.NamedItem.builder().id(s.getId()).name(s.getName()).build())
                        .toList())
                .build();
    }
}

//resolveClassSections/resolveSubjects double-check that every ID passed in actually exists
// — findAllById silently drops IDs that don't match anything,
// so comparing sizes catches a bad ID instead of quietly creating an exam with fewer classes/subjects than requested.