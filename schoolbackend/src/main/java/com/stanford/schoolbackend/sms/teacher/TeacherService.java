package com.stanford.schoolbackend.sms.teacher;

import com.stanford.schoolbackend.core.exception.EmailAlreadyExistsException;
import com.stanford.schoolbackend.core.exception.ResourceNotFoundException;
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
        return teacherRepository.findAll().stream().map(this::toResponse).toList();
    }

    public TeacherResponse update(Long teacherId, TeacherUpdateRequest request) {
        Teacher teacher = teacherRepository.findById(teacherId)
                .orElseThrow(() -> new ResourceNotFoundException("Teacher not found"));

        if (!teacher.getEmail().equalsIgnoreCase(request.getEmail())
                && userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new EmailAlreadyExistsException("Email already exists");
        }

        teacher.setFirstName(request.getFirstName());
        teacher.setLastName(request.getLastName());
        teacher.setEmail(request.getEmail());
        teacher.setEmployeeId(request.getEmployeeId());
        teacher.setQualification(request.getQualification());
        teacher.setDepartment(request.getDepartment());
        teacher.setDesignation(request.getDesignation());
        teacher.setJoinDate(request.getJoinDate());
        teacher.setDateOfBirth(request.getDateOfBirth());
        teacher.setGender(request.getGender());
        teacher.setNationality(request.getNationality());
        teacher.setAddress(request.getAddress());
        teacher.setCity(request.getCity());
        teacher.setStateProvince(request.getStateProvince());
        teacher.setPostalCode(request.getPostalCode());
        teacher.setCountry(request.getCountry());
        teacher.setPhoneNumber(request.getPhoneNumber());
        teacher.setEmergencyContactName(request.getEmergencyContactName());
        teacher.setEmergencyContactPhone(request.getEmergencyContactPhone());
        teacher.setBio(request.getBio());
        teacher.setPhotoUrl(request.getPhotoUrl());

        return toResponse(teacherRepository.save(teacher));
    }

    public void delete(Long teacherId) {
        Teacher teacher = teacherRepository.findById(teacherId)
                .orElseThrow(() -> new ResourceNotFoundException("Teacher not found"));
        teacherRepository.delete(teacher);
    }

    private TeacherResponse toResponse(Teacher t) {
        return TeacherResponse.builder()
                .id(t.getId())
                .firstName(t.getFirstName())
                .lastName(t.getLastName())
                .email(t.getEmail())
                .employeeId(t.getEmployeeId())
                .qualification(t.getQualification())
                .department(t.getDepartment())
                .designation(t.getDesignation())
                .joinDate(t.getJoinDate())
                .dateOfBirth(t.getDateOfBirth())
                .gender(t.getGender())
                .nationality(t.getNationality())
                .address(t.getAddress())
                .city(t.getCity())
                .stateProvince(t.getStateProvince())
                .postalCode(t.getPostalCode())
                .country(t.getCountry())
                .phoneNumber(t.getPhoneNumber())
                .emergencyContactName(t.getEmergencyContactName())
                .emergencyContactPhone(t.getEmergencyContactPhone())
                .bio(t.getBio())
                .photoUrl(t.getPhotoUrl())
                .build();
    }
}
