package com.ecobazaar.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.ecobazaar.model.Seller;
import com.ecobazaar.model.SellerCompleteDetails;

@Repository
public interface SellerCompleteDetailsRepository extends JpaRepository<SellerCompleteDetails, Long> {
    Optional<SellerCompleteDetails> findBySeller(Seller seller);
}
