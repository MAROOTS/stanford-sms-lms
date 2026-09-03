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
                .map(this::toResponse)
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
        teacher.setQualification(request.getQualification());
        teacher.setDepartment(request.getDepartment());
        teacher.setPhone(request.getPhone());
        teacher.setTscNumber(request.getTscNumber());
        teacher.setNationalId(request.getNationalId());
        teacher.setDateOfBirth(request.getDateOfBirth());
        teacher.setGender(request.getGender());
        teacher.setDateOfEmployment(request.getDateOfEmployment());
        teacher.setAddress(request.getAddress());

        return toResponse(teacherRepository.save(teacher));
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

    private TeacherResponse toResponse(Teacher t) {
        return TeacherResponse.builder()
                .id(t.getId())
                .firstName(t.getFirstName())
                .lastName(t.getLastName())
                .email(t.getEmail())
                .qualification(t.getQualification())
                .department(t.getDepartment())
                .phone(t.getPhone())
                .tscNumber(t.getTscNumber())
                .nationalId(t.getNationalId())
                .dateOfBirth(t.getDateOfBirth())
                .gender(t.getGender())
                .dateOfEmployment(t.getDateOfEmployment())
                .address(t.getAddress())
                .build();
    }
}