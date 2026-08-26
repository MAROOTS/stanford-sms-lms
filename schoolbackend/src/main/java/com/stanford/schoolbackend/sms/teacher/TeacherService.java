package com.stanford.schoolbackend.sms.teacher;

import com.stanford.schoolbackend.core.exception.EmailAlreadyExistsException;
import com.stanford.schoolbackend.core.exception.ResourceNotFoundException;
import com.stanford.schoolbackend.core.security.SecurityUtils;
import com.stanford.schoolbackend.core.user.UserRepository;
import com.stanford.schoolbackend.sms.teacher.dto.TeacherResponse;
import com.stanford.schoolbackend.sms.teacher.dto.TeacherUpdateRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TeacherService {

    private final TeacherRepository teacherRepository;
    private final UserRepository userRepository;
    public List<TeacherResponse> listAll() {
        Long schoolId = SecurityUtils.currentSchoolId();
        return teacherRepository.findBySchoolId(schoolId).stream()

                .map(t -> TeacherResponse.builder()
                        .id(t.getId())
                        .firstName(t.getFirstName())
                        .lastName(t.getLastName())
                        .email(t.getEmail())
                        .build())
                .toList();
    }
    public TeacherResponse update(Long teacherId, TeacherUpdateRequest request) {
        Teacher teacher = getOwnedOrThrow(teacherId);

        if (!teacher.getEmail().equalsIgnoreCase(request.getEmail())
                && userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new EmailAlreadyExistsException("Email already exists");
        }

        teacher.setFirstName(request.getFirstName());
        teacher.setLastName(request.getLastName());
        teacher.setEmail(request.getEmail());

        Teacher saved = teacherRepository.save(teacher);
        return TeacherResponse.builder()
                .id(saved.getId())
                .firstName(saved.getFirstName())
                .lastName(saved.getLastName())
                .email(saved.getEmail())
                .build();
    }

    public void delete(Long teacherId) {
        Teacher teacher = getOwnedOrThrow(teacherId);
        teacherRepository.delete(teacher);
    }
    private Teacher getOwnedOrThrow(Long teacherId) {
        Teacher teacher = teacherRepository.findById(teacherId)
                .orElseThrow(() -> new ResourceNotFoundException("Teacher not found"));
        Long schoolId = SecurityUtils.currentSchoolId();
        if (schoolId == null || teacher.getSchool() == null
                || !schoolId.equals(teacher.getSchool().getId())) {
            throw new ResourceNotFoundException("Teacher not found");
        }
        return teacher;
    }
}