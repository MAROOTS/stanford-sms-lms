package com.stanford.schoolbackend.sms.teacher;

import com.stanford.schoolbackend.core.user.User;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.time.LocalDate;

@Entity
@Table(name = "teachers")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@SuperBuilder
@ToString(callSuper = true)
@EqualsAndHashCode(callSuper = true)
public class Teacher extends User {

    // ── Professional ──
    private String employeeId;
    private String qualification;
    private String department;
    private String designation; // e.g. "Senior Teacher", "Head of Department"
    private LocalDate joinDate;

    // ── Personal ──
    private LocalDate dateOfBirth;
    private String gender;
    private String nationality;

    // ── Contact & Address ──
    @Column(columnDefinition = "TEXT")
    private String address;
    private String city;
    private String stateProvince;
    private String postalCode;
    private String country;
    private String phoneNumber;

    // ── Emergency Contact ──
    private String emergencyContactName;
    private String emergencyContactPhone;

    // ── Notes ──
    @Column(columnDefinition = "TEXT")
    private String bio;

    // ── Photo ──
    private String photoUrl;
}
