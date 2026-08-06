package com.stanford.schoolbackend.sms.library;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface BookHoldRepository extends JpaRepository<BookHold, Long> {
    List<BookHold> findByBookIdAndFulfilledFalseOrderByRequestedAtAsc(Long bookId);
    Optional<BookHold> findFirstByBookIdAndFulfilledFalseAndNotifiedFalseOrderByRequestedAtAsc(Long bookId);
    Optional<BookHold> findByBookIdAndBorrowerIdAndFulfilledFalse(Long bookId, Long borrowerId);
}