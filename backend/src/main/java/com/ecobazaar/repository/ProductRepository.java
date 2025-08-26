package com.ecobazaar.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.ecobazaar.model.Product;

@Repository
public interface ProductRepository extends MongoRepository<Product, String> {
    List<Product> findBySellerEmail(String sellerEmail);
    Optional<Product> findByIdAndSellerEmail(String id, String sellerEmail);
    List<Product> findBySellerEmailAndIsActive(String sellerEmail, boolean isActive);
    List<Product> findByCategoryAndIsActive(String category, boolean isActive);
    List<Product> findByIsActive(boolean isActive);
}
