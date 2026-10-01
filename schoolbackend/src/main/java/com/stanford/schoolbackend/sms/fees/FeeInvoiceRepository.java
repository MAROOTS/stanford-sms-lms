package com.stanford.schoolbackend.sms.fees;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface FeeInvoiceRepository extends JpaRepository<FeeInvoice, Long> {
    Optional<FeeInvoice> findByStudentIdAndTermId(Long studentId, Long termId);
    List<FeeInvoice> findByTermId(Long termId);
    List<FeeInvoice> findByStudentId(Long studentId);
    List<FeeInvoice> findByTermIdAndStudent_ClassSection_Id(Long termId, Long classSectionId);
    List<FeeInvoice> findBySchoolIdAndTermId(Long schoolId, Long termId);
    List<FeeInvoice> findBySchoolIdAndTermIdAndStudent_ClassSection_Id(
     Long schoolId, Long termId, Long classSectionId);
    List<FeeInvoice> findBySchoolId(Long schoolId);
    boolean existsByTermId(Long termId);
    @Query("SELECT i FROM FeeInvoice i WHERE i.dueDate IS NOT NULL AND i.dueDate < :today")
    List<FeeInvoice> findDueBefore(@Param("today") LocalDate today);
    Optional<FeeInvoice> findTopByStudentIdAndSchoolIdAndTerm_StartDateBeforeOrderByTerm_StartDateDesc(
            Long studentId, Long schoolId, java.time.LocalDate startDate);
}