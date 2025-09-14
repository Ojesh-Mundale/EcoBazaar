package com.ecobazaar.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.ecobazaar.model.Feedback;

@Repository
public interface FeedbackRepository extends JpaRepository<Feedback, Long> {

    // Find all feedback for a specific seller
    List<Feedback> findBySellerEmail(String sellerEmail);

    // Find all feedback for a specific seller and product
    List<Feedback> findBySellerEmailAndProductId(String sellerEmail, String productId);

    // Find all feedback for a specific customer
    List<Feedback> findByCustomerEmail(String customerEmail);

    // Find all feedback for a specific order
    List<Feedback> findByOrderId(Long orderId);

    // Find feedback for a specific product
    List<Feedback> findByProductId(String productId);

    // Find feedback for a specific seller ordered by creation date (newest first)
    List<Feedback> findBySellerEmailOrderByCreatedAtDesc(String sellerEmail);

    // Find feedback for a specific product ordered by creation date (newest first)
    List<Feedback> findByProductIdOrderByCreatedAtDesc(String productId);

    // Get average rating for a seller's products
    @Query("SELECT AVG(f.rating) FROM Feedback f WHERE f.sellerEmail = ?1 AND f.rating IS NOT NULL")
    Double findAverageRatingBySellerEmail(String sellerEmail);

    // Get average rating for a specific product
    @Query("SELECT AVG(f.rating) FROM Feedback f WHERE f.productId = ?1 AND f.rating IS NOT NULL")
    Double findAverageRatingByProductId(String productId);

    // Count feedback for a seller
    Long countBySellerEmail(String sellerEmail);

    // Count feedback for a product
    Long countByProductId(String productId);

    // Check if customer has already given feedback for a specific order and product
    boolean existsByOrderIdAndProductIdAndCustomerEmail(Long orderId, String productId, String customerEmail);
}
