package com.stanford.schoolbackend.sms.fees;

import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface InvoiceSequenceRepository extends JpaRepository<InvoiceSequence, InvoiceSequence.PK> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT s FROM InvoiceSequence s WHERE s.schoolId = :schoolId AND s.year = :year")
    Optional<InvoiceSequence> findForUpdate(@Param("schoolId") Long schoolId, @Param("year") int year);
}