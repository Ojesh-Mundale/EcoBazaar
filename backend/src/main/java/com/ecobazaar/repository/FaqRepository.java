package com.ecobazaar.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.ecobazaar.model.FaqDoc;

@Repository
public interface FaqRepository extends JpaRepository<FaqDoc, Long> {
    // Additional query methods can be added here if needed
}
