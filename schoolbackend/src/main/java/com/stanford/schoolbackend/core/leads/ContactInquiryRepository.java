package com.stanford.schoolbackend.core.leads;

import com.stanford.schoolbackend.core.enums.ContactInquiryStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ContactInquiryRepository extends JpaRepository<ContactInquiry, Long> {
    List<ContactInquiry> findByStatusOrderBySubmittedAtDesc(ContactInquiryStatus status);
    List<ContactInquiry> findAllByOrderBySubmittedAtDesc();
}