package com.ecobazaar.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.ecobazaar.model.SellerStats;

@Repository
public interface SellerStatsRepository extends JpaRepository<SellerStats, Long> {
    Optional<SellerStats> findBySellerEmail(String sellerEmail);
}
