package com.stanford.schoolbackend.sms.parent;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface ParentRepository extends JpaRepository<Parent, Long> {

    @Query("SELECT p FROM Parent p LEFT JOIN FETCH p.children")
    List<Parent> findAllWithChildren();

    @Query("SELECT p FROM Parent p LEFT JOIN FETCH p.children WHERE p.id = :id")
    java.util.Optional<Parent> findByIdWithChildren(Long id);
}