package com.stanford.schoolbackend.sms.student;

import com.stanford.schoolbackend.core.user.User;
import com.stanford.schoolbackend.sms.academic.ClassSection;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "students")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@ToString(callSuper = true)
@EqualsAndHashCode(callSuper = true)
public class Student extends User {
    private String rollNumber;
    private String parentContactNumber;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "class_section_id")
    private ClassSection classSection; // nullable — assigned later, not at registration
}
