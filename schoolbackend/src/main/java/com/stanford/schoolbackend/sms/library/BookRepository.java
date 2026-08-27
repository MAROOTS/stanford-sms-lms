package com.stanford.schoolbackend.sms.library;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BookRepository extends JpaRepository<Book, Long> {
    List<Book> findBySchoolId(Long schoolId);
}