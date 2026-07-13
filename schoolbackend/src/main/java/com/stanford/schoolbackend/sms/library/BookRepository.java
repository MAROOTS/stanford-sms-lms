package com.stanford.schoolbackend.sms.library;

import org.springframework.data.jpa.repository.JpaRepository;

public interface BookRepository extends JpaRepository<Book, Long> {
    java.util.Optional<Book> findByIsbn(String isbn);
}