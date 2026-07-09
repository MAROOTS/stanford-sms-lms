package com.stanford.schoolbackend.sms.academic;

import com.stanford.schoolbackend.core.exception.ResourceNotFoundException;
import com.stanford.schoolbackend.sms.academic.dto.GradeLevelRequest;
import com.stanford.schoolbackend.sms.academic.dto.GradeLevelResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class GradeLevelService {

    private final GradeLevelRepository gradeLevelRepository;

    public GradeLevelResponse create(GradeLevelRequest request) {
        GradeLevel gradeLevel = GradeLevel.builder()
                .name(request.getName())
                .stage(request.getStage())
                .sortOrder(request.getSortOrder())
                .build();
        return toResponse(gradeLevelRepository.save(gradeLevel));
    }

    public GradeLevelResponse update(Long id, GradeLevelRequest request) {
        GradeLevel gradeLevel = getOrThrow(id);
        gradeLevel.setName(request.getName());
        gradeLevel.setStage(request.getStage());
        gradeLevel.setSortOrder(request.getSortOrder());
        return toResponse(gradeLevelRepository.save(gradeLevel));
    }

    public void delete(Long id) {
        gradeLevelRepository.delete(getOrThrow(id));
    }

    public List<GradeLevelResponse> listAll() {
        return gradeLevelRepository.findAll().stream()
                .sorted(Comparator.comparing(GradeLevel::getSortOrder))
                .map(this::toResponse)
                .toList();
    }

    private GradeLevel getOrThrow(Long id) {
        return gradeLevelRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Grade level not found"));
    }

    private GradeLevelResponse toResponse(GradeLevel g) {
        return GradeLevelResponse.builder()
                .id(g.getId())
                .name(g.getName())
                .stage(g.getStage())
                .sortOrder(g.getSortOrder())
                .build();
    }
}
//Admin-managed — school structure shouldn't be editable by individual teachers.