package com.stanford.schoolbackend.sms.fees;

import com.stanford.schoolbackend.core.school.School;
import com.stanford.schoolbackend.sms.academic.GradeLevel;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "fee_structure_lines",
        uniqueConstraints = @UniqueConstraint(columnNames = {"grade_level_id", "fee_item_id"}))
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
public class FeeStructureLine {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "school_id", nullable = false)
    private School school;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "grade_level_id", nullable = false)
    private GradeLevel gradeLevel;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "fee_item_id", nullable = false)
    private FeeItem feeItem;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;
}