package com.stanford.schoolbackend.sms.fees;

import org.springframework.data.jpa.repository.JpaRepository;

public interface FeeItemRepository extends JpaRepository<FeeItem, Long> {
}