package com.stanford.schoolbackend.sms.teacher;

import com.stanford.schoolbackend.core.user.User;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.*;

@Entity
@Table(name = "teachers")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@ToString(callSuper = true)
@EqualsAndHashCode(callSuper = true)
public class Teacher extends User {

    private String qualification;
    private String department;
}