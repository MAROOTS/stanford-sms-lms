package com.stanford.schoolbackend.sms.library;

import com.stanford.schoolbackend.core.enums.CopyStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BookCopyRepository extends JpaRepository<BookCopy, Long> {
    List<BookCopy> findByBookId(Long bookId);
    Optional<BookCopy> findFirstByBookIdAndStatus(Long bookId, CopyStatus status);
}