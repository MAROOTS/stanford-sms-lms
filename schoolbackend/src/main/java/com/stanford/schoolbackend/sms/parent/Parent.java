package com.stanford.schoolbackend.sms.parent;

import com.stanford.schoolbackend.core.user.User;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

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