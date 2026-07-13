package com.stanford.schoolbackend.sms.library;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BookLoanRepository extends JpaRepository<BookLoan, Long> {
    List<BookLoan> findByBorrowerId(Long borrowerId);
    List<BookLoan> findByReturnedDateIsNull();
}