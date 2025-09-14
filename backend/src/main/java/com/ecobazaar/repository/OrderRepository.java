package com.ecobazaar.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.ecobazaar.model.Order;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByCustomerEmail(String customerEmail);
    List<Order> findByCustomerEmailOrderByOrderDateDesc(String customerEmail);
    List<Order> findByStatus(String status);
    long countByCustomerEmail(String customerEmail);
}
