package com.stanford.schoolbackend.sms.exams;

import com.stanford.schoolbackend.core.exception.ResourceNotFoundException;
import com.stanford.schoolbackend.core.security.SecurityUtils;
import com.stanford.schoolbackend.sms.academic.ClassSection;
import com.stanford.schoolbackend.sms.academic.ClassSectionRepository;
import com.stanford.schoolbackend.sms.exams.dto.ClassExamResultRow;
import com.stanford.schoolbackend.sms.exams.dto.MarkResponse;
import com.stanford.schoolbackend.sms.exams.dto.StudentExamResultResponse;
import com.stanford.schoolbackend.sms.student.Student;
import com.stanford.schoolbackend.sms.student.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@RequiredArgsConstructor
public class ExamResultService {

    private final ExamRepository examRepository;
    private final ClassSectionRepository classSectionRepository;
    private final StudentRepository studentRepository;
    private final MarkRepository markRepository;

    public List<ClassExamResultRow> getClassResults(Long examId, Long classSectionId) {
        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new ResourceNotFoundException("Exam not found"));

        boolean examCoversClass = exam.getClassSections().stream()
                .anyMatch(cs -> cs.getId().equals(classSectionId));
        if (!examCoversClass) {
            throw new IllegalArgumentException("This exam does not cover the given class");
        }

        List<Student> students = studentRepository.findByClassSectionId(classSectionId);

        record Aggregate(Student student, double totalScore, double totalMaxScore, double meanPercentage) {}

        List<Aggregate> aggregates = new ArrayList<>();
        for (Student student : students) {
            List<Mark> marks = markRepository.findByStudentIdAndExamId(student.getId(), examId);
            if (marks.isEmpty()) continue; // not yet assessed — excluded from ranking

            double totalScore = marks.stream().mapToDouble(Mark::getScore).sum();
            double totalMaxScore = marks.stream().mapToDouble(Mark::getMaxScore).sum();
            double meanPercentage = marks.stream()
                    .mapToDouble(m -> (m.getScore() / m.getMaxScore()) * 100)
                    .average()
                    .orElse(0);

            aggregates.add(new Aggregate(student, totalScore, totalMaxScore, meanPercentage));
        }

        aggregates.sort((a, b) -> Double.compare(b.meanPercentage(), a.meanPercentage()));

        List<ClassExamResultRow> rows = new ArrayList<>();
        int outOf = aggregates.size();
        int position = 0;
        Double previousMean = null;

        for (int i = 0; i < aggregates.size(); i++) {
            Aggregate agg = aggregates.get(i);
            if (previousMean == null || Double.compare(agg.meanPercentage(), previousMean) != 0) {
                position = i + 1;
            }
            previousMean = agg.meanPercentage();

            rows.add(ClassExamResultRow.builder()
                    .studentId(agg.student().getId())
                    .studentName(agg.student().getFirstName() + " " + agg.student().getLastName())
                    .totalScore(round2(agg.totalScore()))
                    .totalMaxScore(agg.totalMaxScore())
                    .meanPercentage(round2(agg.meanPercentage()))
                    .overallGrade(GradeScale.gradeFor(agg.meanPercentage()))
                    .position(position)
                    .outOf(outOf)
                    .build());
        }

        return rows;
    }

    public StudentExamResultResponse getStudentResult(Long studentId, Long examId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));

        boolean isPrivileged = SecurityUtils.currentUserHasRole("TEACHER")
                || SecurityUtils.currentUserHasRole("ADMIN");
        if (!isPrivileged && !student.getEmail().equals(SecurityUtils.currentUserEmail())) {
            throw new AccessDeniedException("You can only view your own results");
        }

        if (student.getClassSection() == null) {
            throw new IllegalArgumentException("Student is not assigned to a class section");
        }

        Long classSectionId = student.getClassSection().getId();
        ClassSection classSection = classSectionRepository.findById(classSectionId)
                .orElseThrow(() -> new ResourceNotFoundException("Class section not found"));

        List<Mark> marks = markRepository.findByStudentIdAndExamId(studentId, examId);

        List<MarkResponse> subjectResults = marks.stream()
                .map(m -> {
                    double percentage = (m.getScore() / m.getMaxScore()) * 100;
                    return MarkResponse.builder()
                            .id(m.getId())
                            .studentId(studentId)
                            .studentName(student.getFirstName() + " " + student.getLastName())
                            .subjectId(m.getSubject().getId())
                            .subjectName(m.getSubject().getName())
                            .score(m.getScore())
                            .maxScore(m.getMaxScore())
                            .percentage(round2(percentage))
                            .grade(GradeScale.gradeFor(percentage))
                            .build();
                })
                .toList();

        double totalScore = marks.stream().mapToDouble(Mark::getScore).sum();
        double totalMaxScore = marks.stream().mapToDouble(Mark::getMaxScore).sum();
        double meanPercentage = marks.stream()
                .mapToDouble(m -> (m.getScore() / m.getMaxScore()) * 100)
                .average()
                .orElse(0);

        List<ClassExamResultRow> classRanking = getClassResults(examId, classSectionId);
        ClassExamResultRow ownRow = classRanking.stream()
                .filter(r -> r.getStudentId().equals(studentId))
                .findFirst()
                .orElse(null);

        return StudentExamResultResponse.builder()
                .studentId(student.getId())
                .studentName(student.getFirstName() + " " + student.getLastName())
                .classSectionId(classSection.getId())
                .classSectionName(classSection.getName())
                .subjectResults(subjectResults)
                .totalScore(round2(totalScore))
                .totalMaxScore(totalMaxScore)
                .meanPercentage(round2(meanPercentage))
                .overallGrade(GradeScale.gradeFor(meanPercentage))
                .position(ownRow != null ? ownRow.getPosition() : 0)
                .outOf(ownRow != null ? ownRow.getOutOf() : 0)
                .build();
    }

    private double round2(double value) {
        return Math.round(value * 100.0) / 100.0;
    }
}