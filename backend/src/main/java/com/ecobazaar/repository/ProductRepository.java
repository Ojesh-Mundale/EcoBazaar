package com.ecobazaar.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.ecobazaar.model.Product;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findBySellerEmail(String sellerEmail);
    Optional<Product> findByIdAndSellerEmail(Long id, String sellerEmail);
    List<Product> findBySellerEmailAndIsActive(String sellerEmail, boolean isActive);
    List<Product> findByCategoryAndIsActive(String category, boolean isActive);
    List<Product> findByIsActive(boolean isActive);

    @Query("SELECT p.sellerEmail as sellerEmail, SUM(p.carbonFootprint) as totalCarbon, COUNT(p) as productCount " +
           "FROM Product p WHERE p.isActive = true GROUP BY p.sellerEmail ORDER BY totalCarbon DESC")
    List<CarbonAggregationResult> aggregateCarbonBySeller();

    interface CarbonAggregationResult {
        String getSellerEmail();
        double getTotalCarbon();
        int getProductCount();
    }
}
