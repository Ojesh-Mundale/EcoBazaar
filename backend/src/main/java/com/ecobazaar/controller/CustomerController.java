package com.ecobazaar.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ecobazaar.service.OrderService;

@RestController
@RequestMapping("/api/customer")
public class CustomerController {

    @Autowired
    private OrderService orderService;

    @GetMapping("/details/{email}")
    public ResponseEntity<?> getCustomerDetails(@PathVariable String email) {
        return orderService.getCustomerDetails(email);
    }
}
