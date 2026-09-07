package com.stanford.schoolbackend.sms.fees;

import com.stanford.schoolbackend.core.exception.ResourceNotFoundException;
import com.stanford.schoolbackend.core.school.School;
import com.stanford.schoolbackend.core.school.SchoolRepository;
import com.stanford.schoolbackend.core.security.SecurityUtils;
import com.stanford.schoolbackend.sms.academic.GradeLevel;
import com.stanford.schoolbackend.sms.academic.GradeLevelRepository;
import com.stanford.schoolbackend.sms.fees.dto.FeeStructureLineRequest;
import com.stanford.schoolbackend.sms.fees.dto.FeeStructureLineResponse;
import com.stanford.schoolbackend.sms.fees.dto.ReplaceGradeStructureRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class FeeStructureService {

    private final FeeStructureLineRepository feeStructureLineRepository;
    private final FeeItemRepository feeItemRepository;
    private final GradeLevelRepository gradeLevelRepository;
    private final SchoolRepository schoolRepository;

    @Transactional(readOnly = true)
    public List<FeeStructureLineResponse> listForGrade(Long gradeLevelId) {
        Long schoolId = SecurityUtils.currentSchoolId();
        assertGrade(gradeLevelId, schoolId);
        return feeStructureLineRepository.findBySchoolIdAndGradeLevelId(schoolId, gradeLevelId)
                .stream().map(this::toResponse).toList();
    }

    @Transactional
    public List<FeeStructureLineResponse> replaceForGrade(Long gradeLevelId, ReplaceGradeStructureRequest request) {
        Long schoolId = SecurityUtils.currentSchoolId();
        GradeLevel grade = assertGrade(gradeLevelId, schoolId);
        School school = schoolRepository.findById(schoolId)
                .orElseThrow(() -> new ResourceNotFoundException("School not found"));

        feeStructureLineRepository.deleteBySchoolIdAndGradeLevelId(schoolId, gradeLevelId);

        List<FeeStructureLine> saved = new ArrayList<>();
        for (FeeStructureLineRequest line : request.getLines()) {
            FeeItem item = feeItemRepository.findById(line.getFeeItemId())
                    .orElseThrow(() -> new ResourceNotFoundException("Fee item not found"));
            if (item.getSchool() == null || !schoolId.equals(item.getSchool().getId())) {
                throw new ResourceNotFoundException("Fee item not found");
            }
            saved.add(feeStructureLineRepository.save(FeeStructureLine.builder()
                    .school(school)
                    .gradeLevel(grade)
                    .feeItem(item)
                    .amount(line.getAmount())
                    .build()));
        }
        return saved.stream().map(this::toResponse).toList();
    }

    @Transactional
    public List<FeeStructureLineResponse> copyFrom(Long targetGradeId, Long sourceGradeId) {
        Long schoolId = SecurityUtils.currentSchoolId();
        assertGrade(targetGradeId, schoolId);
        assertGrade(sourceGradeId, schoolId);
        if (targetGradeId.equals(sourceGradeId)) {
            throw new IllegalArgumentException("Pick a different grade to copy from");
        }
        List<FeeStructureLineRequest> lines = feeStructureLineRepository
                .findBySchoolIdAndGradeLevelId(schoolId, sourceGradeId)
                .stream()
                .map(l -> {
                    FeeStructureLineRequest r = new FeeStructureLineRequest();
                    r.setFeeItemId(l.getFeeItem().getId());
                    r.setAmount(l.getAmount());
                    return r;
                })
                .toList();
        ReplaceGradeStructureRequest req = new ReplaceGradeStructureRequest();
        req.setLines(lines);
        return replaceForGrade(targetGradeId, req);
    }

    private GradeLevel assertGrade(Long gradeLevelId, Long schoolId) {
        GradeLevel grade = gradeLevelRepository.findById(gradeLevelId)
                .orElseThrow(() -> new ResourceNotFoundException("Grade not found"));
        if (grade.getSchool() == null || !schoolId.equals(grade.getSchool().getId())) {
            throw new ResourceNotFoundException("Grade not found");
        }
        return grade;
    }

    private FeeStructureLineResponse toResponse(FeeStructureLine l) {
        return FeeStructureLineResponse.builder()
                .id(l.getId())
                .gradeLevelId(l.getGradeLevel().getId())
                .gradeLevelName(l.getGradeLevel().getName())
                .feeItemId(l.getFeeItem().getId())
                .feeItemName(l.getFeeItem().getName())
                .amount(l.getAmount())
                .build();
    }
}