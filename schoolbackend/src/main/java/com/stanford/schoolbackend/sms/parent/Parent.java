package com.stanford.schoolbackend.sms.parent;

import com.stanford.schoolbackend.core.user.User;
import com.stanford.schoolbackend.sms.student.Student;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "parents")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@SuperBuilder
@ToString(callSuper = true)
@EqualsAndHashCode(callSuper = true)
public class Parent extends User {

    private String occupation;

    @Column(name = "alternate_phone")
    private String alternatePhone;

    @Column(columnDefinition = "TEXT")
    private String address;
}