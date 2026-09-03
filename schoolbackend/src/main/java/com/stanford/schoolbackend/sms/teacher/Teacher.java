package com.stanford.schoolbackend.sms.teacher;

import com.stanford.schoolbackend.core.user.User;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.*;
import lombok.experimental.SuperBuilder;

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

    private String qualification;
    private String department;
    private String phone;
    private String tscNumber;
    private String nationalId;
    private java.time.LocalDate dateOfBirth;
    private String gender;
    private java.time.LocalDate dateOfEmployment;
    private String address;
}