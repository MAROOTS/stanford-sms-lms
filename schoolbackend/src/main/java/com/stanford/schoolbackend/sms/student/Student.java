package com.stanford.schoolbackend.sms.student;

import com.stanford.schoolbackend.core.user.User;
import com.stanford.schoolbackend.sms.academic.ClassSection;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "students")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@SuperBuilder
@ToString(callSuper = true)
@EqualsAndHashCode(callSuper = true)
public class Student extends User {
    private String rollNumber;
    private String parentContactNumber;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "class_section_id")
    private ClassSection classSection; // nullable — assigned later, not at registration
    @Column(unique = true)
    private String admissionNumber; // nullable — assigned by admin after enrollment, not at signup
    private java.time.LocalDate dateOfBirth;
    private String gender;
    private String nationality;
    private String religion;
    private java.time.LocalDate admissionDate;
    private String birthCertificateNo;
    private String address;
    private String guardianName;
    private String guardianPhone;
    private String guardianEmail;
    private String guardianRelationship;
    private String bloodGroup;
    private String allergies;
    private String medicalConditions;
    private String emergencyContactName;
    private String emergencyContactPhone;
    private String previousSchool;
    private String photoObjectKey;
}
