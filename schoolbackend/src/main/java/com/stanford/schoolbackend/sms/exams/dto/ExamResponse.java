package com.stanford.schoolbackend.sms.exams.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class ExamResponse {
    private Long id;
    private String name;
    private String examType;
    private Long termId;
    private String termName;
    private List<NamedItem> classSections;
    private List<NamedItem> subjects;

    @Data
    @Builder
    public static class NamedItem {
        private Long id;
        private String name;
    }
}

//Using a small NamedItem shape rather than the full ClassSectionResponse/SubjectResponse
// — the Examinations table only needs id+name for both, and classSections.size() / subjects.size()
// on the frontend gives you the CLASSES=2 / SUBJECTS=1 counts directly, no separate count fields needed.