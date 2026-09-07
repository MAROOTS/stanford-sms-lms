package com.stanford.schoolbackend.sms.fees;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "invoice_sequences")
@IdClass(InvoiceSequence.PK.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InvoiceSequence {

    @Id
    @Column(name = "school_id")
    private Long schoolId;

    @Id
    @Column(name = "year")
    private Integer year;

    @Column(name = "last_value", nullable = false)
    private int lastValue;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @EqualsAndHashCode
    public static class PK implements java.io.Serializable {
        private Long schoolId;
        private Integer year;
    }
}