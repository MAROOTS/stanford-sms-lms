package com.stanford.schoolbackend.sms.exams;

import com.stanford.schoolbackend.core.enums.NotificationType;
import com.stanford.schoolbackend.core.exception.ResourceNotFoundException;
import com.stanford.schoolbackend.core.notification.NotificationService;
import com.stanford.schoolbackend.sms.academic.ClassSection;
import com.stanford.schoolbackend.sms.academic.ClassSectionOwnershipService;
import com.stanford.schoolbackend.sms.academic.Subject;
import com.stanford.schoolbackend.sms.academic.SubjectRepository;
import com.stanford.schoolbackend.sms.exams.dto.MarkEntryRequest;
import com.stanford.schoolbackend.sms.exams.dto.MarkResponse;
import com.stanford.schoolbackend.sms.exams.dto.MarkSheetRow;
import com.stanford.schoolbackend.sms.student.Student;
import com.stanford.schoolbackend.sms.student.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MarkService {

    private final MarkRepository markRepository;
    private final ExamRepository examRepository;
    private final SubjectRepository subjectRepository;
    private final StudentRepository studentRepository;
    private final ClassSectionOwnershipService classSectionOwnershipService;
    private final NotificationService notificationService;

    public List<MarkSheetRow> getEntrySheet(Long examId, Long subjectId, Long classSectionId) {
        classSectionOwnershipService.getOwnedClassSectionOrThrow(classSectionId);
        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new ResourceNotFoundException("Exam not found"));

        boolean examCoversSubject = exam.getSubjects().stream().anyMatch(s -> s.getId().equals(subjectId));
        boolean examCoversClass = exam.getClassSections().stream().anyMatch(cs -> cs.getId().equals(classSectionId));
        if (!examCoversSubject || !examCoversClass) {
            throw new IllegalArgumentException("This exam does not cover the given subject/class combination");
        }

        List<Student> students = studentRepository.findByClassSectionId(classSectionId);
        Map<Long, Mark> existingMarks = markRepository.findByExamIdAndSubjectId(examId, subjectId).stream()
                .collect(Collectors.toMap(m -> m.getStudent().getId(), Function.identity()));

        return students.stream()
                .map(student -> {
                    Mark mark = existingMarks.get(student.getId());
                    return MarkSheetRow.builder()
                            .studentId(student.getId())
                            .studentName(student.getFirstName() + " " + student.getLastName())
                            .markId(mark != null ? mark.getId() : null)
                            .score(mark != null ? mark.getScore() : null)
                            .maxScore(mark != null ? mark.getMaxScore() : 100.0)
                            .grade(mark != null ? GradeScale.gradeFor((mark.getScore() / mark.getMaxScore()) * 100) : null)
                            .build();
                })
                .toList();
    }

    public List<MarkResponse> saveMarks(MarkEntryRequest request) {
        ClassSection classSection = classSectionOwnershipService.getOwnedClassSectionOrThrow(request.getClassSectionId());

        Exam exam = examRepository.findById(request.getExamId())
                .orElseThrow(() -> new ResourceNotFoundException("Exam not found"));

        Subject subject = subjectRepository.findById(request.getSubjectId())
                .orElseThrow(() -> new ResourceNotFoundException("Subject not found"));

        boolean examCoversSubject = exam.getSubjects().stream().anyMatch(s -> s.getId().equals(subject.getId()));
        boolean examCoversClass = exam.getClassSections().stream().anyMatch(cs -> cs.getId().equals(classSection.getId()));
        if (!examCoversSubject || !examCoversClass) {
            throw new IllegalArgumentException("This exam does not cover the given subject/class combination");
        }

        List<Mark> saved = request.getEntries().stream()
                .map(entry -> {
                    Student student = studentRepository.findById(entry.getStudentId())
                            .orElseThrow(() -> new ResourceNotFoundException(
                                    "Student not found: " + entry.getStudentId()));

                    if (student.getClassSection() == null
                            || !student.getClassSection().getId().equals(classSection.getId())) {
                        throw new IllegalArgumentException(
                                "Student " + entry.getStudentId() + " does not belong to the selected class");
                    }

                    double maxScore = entry.getMaxScore() != null ? entry.getMaxScore() : 100.0;
                    if (entry.getScore() < 0 || entry.getScore() > maxScore) {
                        throw new IllegalArgumentException(
                                "Score for student " + entry.getStudentId() + " must be between 0 and " + maxScore);
                    }

                    Mark mark = markRepository
                            .findByExamIdAndSubjectIdAndStudentId(exam.getId(), subject.getId(), student.getId())
                            .orElse(Mark.builder().exam(exam).subject(subject).student(student).build());

                    mark.setScore(entry.getScore());
                    mark.setMaxScore(maxScore);
                    Mark savedMark = markRepository.save(mark);
                    notificationService.notifyUser(student, NotificationType.EXAM_RESULT,
                            "Your " + subject.getName() + " score for " + exam.getName() + " has been posted.",
                            "/results");
                    return savedMark;

                })
                .toList();

        return saved.stream().map(this::toResponse).toList();
    }

    public List<MarkResponse> listByStudentAndExam(Long studentId, Long examId) {
        return markRepository.findByStudentIdAndExamId(studentId, examId).stream()
                .map(this::toResponse)
                .toList();
    }

    private MarkResponse toResponse(Mark m) {
        double percentage = (m.getScore() / m.getMaxScore()) * 100;
        return MarkResponse.builder()
                .id(m.getId())
                .studentId(m.getStudent().getId())
                .studentName(m.getStudent().getFirstName() + " " + m.getStudent().getLastName())
                .subjectId(m.getSubject().getId())
                .subjectName(m.getSubject().getName())
                .score(m.getScore())
                .maxScore(m.getMaxScore())
                .percentage(Math.round(percentage * 100.0) / 100.0)
                .grade(GradeScale.gradeFor(percentage))
                .build();
    }
}