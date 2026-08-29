package com.stanford.schoolbackend.sms.fees;

import org.springframework.data.jpa.repository.JpaRepository;

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
}