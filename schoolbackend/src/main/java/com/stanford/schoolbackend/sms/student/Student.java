package com.stanford.schoolbackend.sms.student;

import com.stanford.schoolbackend.core.enums.EnrollmentStatus;
import com.stanford.schoolbackend.core.user.User;
import com.stanford.schoolbackend.sms.academic.ClassSection;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.time.LocalDate;

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

    // ── Academic IDs ──
    private String rollNumber;

    @Column(unique = true)
    private String admissionNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "class_section_id")
    private ClassSection classSection;

    // ── Personal ──
    private String middleName;

    private LocalDate dateOfBirth;

    private String gender; // Male, Female, Other

    private String nationality;

    private String religion;

    // ── Contact & Address ──
    @Column(columnDefinition = "TEXT")
    private String address;

    private String city;

    private String stateProvince;

    private String postalCode;

    private String country;

    private String phoneNumber; // Student's own phone (if any)

    // ── Parent / Guardian ──
    private String guardianName;

    private String guardianRelationship; // Father, Mother, Guardian, etc.

    private String guardianEmail;

    private String guardianPhone; // Primary guardian contact

    private String emergencyContactName;

    private String emergencyContactPhone;

    // ── Medical ──
    private String bloodGroup; // A+, B+, O+, etc.

    @Column(columnDefinition = "TEXT")
    private String medicalNotes; // Allergies, conditions, medications

    // ── Enrollment ──
    private LocalDate enrollmentDate;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private EnrollmentStatus enrollmentStatus = EnrollmentStatus.ACTIVE;

    private String previousSchool;

    // ── Photo ──
    private String photoUrl;
}
