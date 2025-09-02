package com.ecobazaar.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.ecobazaar.model.Order;

@Repository
public interface OrderRepository extends MongoRepository<Order, String> {
    List<Order> findByCustomerEmail(String customerEmail);
    List<Order> findByCustomerEmailOrderByOrderDateDesc(String customerEmail);
    List<Order> findByStatus(String status);
    long countByCustomerEmail(String customerEmail);
}
