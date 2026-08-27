package com.stanford.schoolbackend.sms.library;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BookLoanRepository extends JpaRepository<BookLoan, Long> {
    List<BookLoan> findByBorrowerId(Long borrowerId);
    List<BookLoan> findByReturnedDateIsNull();
    boolean existsByBookCopyId(Long bookCopyId);
    List<BookLoan> findByBorrowerIdInAndReturnedDateIsNull(List<Long> borrowerIds);
    List<BookLoan> findByBorrowerIdIn(List<Long> borrowerIds);
    List<BookLoan> findByBookCopy_Book_School_Id(Long schoolId);
    List<BookLoan> findByBookCopy_Book_School_IdAndReturnedDateIsNull(Long schoolId);
}