package com.stanford.schoolbackend.sms.academic;

import com.stanford.schoolbackend.core.exception.ResourceNotFoundException;
import com.stanford.schoolbackend.core.school.School;
import com.stanford.schoolbackend.core.school.SchoolRepository;
import com.stanford.schoolbackend.core.security.SecurityUtils;
import com.stanford.schoolbackend.sms.academic.dto.*;
import com.stanford.schoolbackend.sms.student.Student;
import com.stanford.schoolbackend.sms.student.StudentRepository;
import com.stanford.schoolbackend.sms.teacher.Teacher;
import com.stanford.schoolbackend.sms.teacher.TeacherRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TimetableService {

    private final TimetablePeriodRepository periodRepository;
    private final TimetableSlotRepository slotRepository;
    private final TeachingAssignmentRepository teachingAssignmentRepository;
    private final ClassSectionRepository classSectionRepository;
    private final SchoolRepository schoolRepository;
    private final TeacherRepository teacherRepository;
    private final StudentRepository studentRepository;

    public List<TimetablePeriodResponse> listPeriods() {
        return periodRepository.findBySchoolIdOrderBySortOrderAsc(schoolId())
                .stream().map(this::toPeriod).toList();
    }

    @Transactional
    public TimetablePeriodResponse createPeriod(TimetablePeriodRequest request) {
        School school = school();
        TimetablePeriod saved = periodRepository.save(TimetablePeriod.builder()
                .school(school)
                .name(request.getName().trim())
                .sortOrder(request.getSortOrder())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .breakPeriod(request.isBreakPeriod())
                .build());
        return toPeriod(saved);
    }

    @Transactional
    public void deletePeriod(Long id) {
        TimetablePeriod p = ownedPeriod(id);
        periodRepository.delete(p); // slots cascade
    }

    @Transactional
    public List<TimetablePeriodResponse> seedDefaults() {
        Long schoolId = schoolId();
        if (periodRepository.existsBySchoolId(schoolId)) {
            throw new IllegalArgumentException("Periods already exist for this school");
        }
        School school = school();
        Object[][] rows = {
                {"P1", 1, "08:00", "08:40", false},
                {"P2", 2, "08:40", "09:20", false},
                {"P3", 3, "09:20", "10:00", false},
                {"Break", 4, "10:00", "10:20", true},
                {"P4", 5, "10:20", "11:00", false},
                {"P5", 6, "11:00", "11:40", false},
                {"Lunch", 7, "11:40", "12:40", true},
                {"P6", 8, "12:40", "13:20", false},
                {"P7", 9, "13:20", "14:00", false},
                {"P8", 10, "14:00", "14:40", false},
        };
        for (Object[] r : rows) {
            periodRepository.save(TimetablePeriod.builder()
                    .school(school)
                    .name((String) r[0])
                    .sortOrder((Integer) r[1])
                    .startTime(LocalTime.parse((String) r[2]))
                    .endTime(LocalTime.parse((String) r[3]))
                    .breakPeriod((Boolean) r[4])
                    .build());
        }
        return listPeriods();
    }

    public ClassTimetableResponse getClassTimetable(Long classSectionId) {
        ClassSection section = ownedSection(classSectionId);
        return ClassTimetableResponse.builder()
                .classSectionId(section.getId())
                .classSectionName(section.getName())
                .periods(listPeriods())
                .slots(slotRepository.findBySchoolIdAndClassSectionId(schoolId(), classSectionId)
                        .stream().map(this::toSlot).toList())
                .build();
    }

    @Transactional
    public TimetableSlotResponse putSlot(Long classSectionId, PutTimetableSlotRequest request) {
        int day = request.getDayOfWeek();
        if (day < 1 || day > 5) {
            throw new IllegalArgumentException("dayOfWeek must be 1 (Mon) to 5 (Fri)");
        }
        ClassSection section = ownedSection(classSectionId);
        TimetablePeriod period = ownedPeriod(request.getPeriodId());
        if (period.isBreakPeriod() && request.getTeachingAssignmentId() != null) {
            throw new IllegalArgumentException("Cannot place a lesson in a break");
        }

        TeachingAssignment assignment = null;
        if (request.getTeachingAssignmentId() != null) {
            assignment = teachingAssignmentRepository.findById(request.getTeachingAssignmentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Teaching assignment not found"));
            if (!schoolId().equals(assignment.getSchool().getId())) {
                throw new ResourceNotFoundException("Teaching assignment not found");
            }
            if (!assignment.getClassSection().getId().equals(classSectionId)) {
                throw new IllegalArgumentException("That assignment is for a different class");
            }
            assertTeacherFree(assignment.getTeacher().getId(), day, period.getId(), classSectionId);
        }

        TimetableSlot slot = slotRepository
                .findByClassSectionIdAndPeriodIdAndDayOfWeek(classSectionId, period.getId(), day)
                .orElseGet(() -> TimetableSlot.builder()
                        .school(school())
                        .classSection(section)
                        .period(period)
                        .dayOfWeek(day)
                        .build());

        slot.setTeachingAssignment(assignment);
        slot.setRoom(request.getRoom() != null && !request.getRoom().isBlank()
                ? request.getRoom().trim() : null);

        if (assignment == null && (slot.getRoom() == null)) {
            if (slot.getId() != null) {
                slotRepository.delete(slot);
                return TimetableSlotResponse.builder()
                        .dayOfWeek(day).periodId(period.getId()).build();
            }
        }
        return toSlot(slotRepository.save(slot));
    }

    private void assertTeacherFree(Long teacherId, int day, Long periodId, Long classSectionId) {
        for (TimetableSlot other : slotRepository.findBySchoolIdAndDayOfWeekAndPeriodId(
                schoolId(), day, periodId)) {
            if (other.getClassSection().getId().equals(classSectionId)) continue;
            if (other.getTeachingAssignment() == null) continue;
            if (teacherId.equals(other.getTeachingAssignment().getTeacher().getId())) {
                throw new IllegalArgumentException(
                        other.getTeachingAssignment().getTeacher().getFirstName()
                                + " is already teaching "
                                + other.getClassSection().getName()
                                + " at this time");
            }
        }
    }

    private Long schoolId() { return SecurityUtils.currentSchoolId(); }
    private School school() {
        return schoolRepository.findById(schoolId())
                .orElseThrow(() -> new ResourceNotFoundException("School not found"));
    }
    private TimetablePeriod ownedPeriod(Long id) {
        TimetablePeriod p = periodRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Period not found"));
        if (!schoolId().equals(p.getSchool().getId())) {
            throw new ResourceNotFoundException("Period not found");
        }
        return p;
    }
    private ClassSection ownedSection(Long id) {
        ClassSection s = classSectionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Class not found"));
        if (!schoolId().equals(s.getSchool().getId())) {
            throw new ResourceNotFoundException("Class not found");
        }
        return s;
    }
    public ClassTimetableResponse getMine() {
        Long schoolId = schoolId();
        if (SecurityUtils.currentUserHasRole("STUDENT")) {
            Student student = studentRepository.findByUsername(SecurityUtils.currentUsername())
                    .orElseThrow(() -> new ResourceNotFoundException("Student not found"));
            if (student.getClassSection() == null) {
                return ClassTimetableResponse.builder()
                        .classSectionName(null)
                        .periods(listPeriods())
                        .slots(List.of())
                        .build();
            }
            return getClassTimetable(student.getClassSection().getId());
        }
        if (SecurityUtils.currentUserHasRole("TEACHER")) {
            Teacher teacher = teacherRepository.findByUsername(SecurityUtils.currentUsername())
                    .orElseThrow(() -> new ResourceNotFoundException("Teacher not found"));
            return ClassTimetableResponse.builder()
                    .classSectionName(null)
                    .periods(listPeriods())
                    .slots(slotRepository
                            .findBySchoolIdAndTeachingAssignment_Teacher_Id(schoolId, teacher.getId())
                            .stream().map(this::toSlot).toList())
                    .build();
        }
        throw new AccessDeniedException("No personal timetable for this role");
    }

    private TimetablePeriodResponse toPeriod(TimetablePeriod p) {
        return TimetablePeriodResponse.builder()
                .id(p.getId()).name(p.getName()).sortOrder(p.getSortOrder())
                .startTime(p.getStartTime()).endTime(p.getEndTime())
                .breakPeriod(p.isBreakPeriod()).build();
    }

    private TimetableSlotResponse toSlot(TimetableSlot s) {
        var ta = s.getTeachingAssignment();
        return TimetableSlotResponse.builder()
                .id(s.getId())
                .dayOfWeek(s.getDayOfWeek())
                .periodId(s.getPeriod().getId())
                .teachingAssignmentId(ta != null ? ta.getId() : null)
                .subjectName(ta != null ? ta.getSubject().getName() : null)
                .teacherName(ta != null
                        ? ta.getTeacher().getFirstName() + " " + ta.getTeacher().getLastName()
                        : null)
                .room(s.getRoom())
                .classSectionName(s.getClassSection() != null ? s.getClassSection().getName() : null)
                .build();
    }
}