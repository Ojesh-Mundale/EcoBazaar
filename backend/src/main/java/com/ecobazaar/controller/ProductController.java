package com.ecobazaar.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ecobazaar.model.Product;
import com.ecobazaar.service.ProductService;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    @Autowired
    private ProductService productService;

    @PostMapping("/add")
    public ResponseEntity<?> addProduct(@RequestBody Product product, @RequestHeader("Authorization") String authHeader) {
        // Extract seller email from JWT token (simplified for now)
        String sellerEmail = extractEmailFromAuthHeader(authHeader);
        return productService.addProduct(product, sellerEmail);
    }

    @GetMapping("/my-products")
    public ResponseEntity<?> getMyProducts(@RequestHeader("Authorization") String authHeader) {
        String sellerEmail = extractEmailFromAuthHeader(authHeader);
        return productService.getProductsBySeller(sellerEmail);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getProduct(@PathVariable String id, @RequestHeader("Authorization") String authHeader) {
        String sellerEmail = extractEmailFromAuthHeader(authHeader);
        return productService.getProductById(id, sellerEmail);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateProduct(@PathVariable String id, @RequestBody Product product, @RequestHeader("Authorization") String authHeader) {
        String sellerEmail = extractEmailFromAuthHeader(authHeader);
        return productService.updateProduct(id, product, sellerEmail);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProduct(@PathVariable String id, @RequestHeader("Authorization") String authHeader) {
        String sellerEmail = extractEmailFromAuthHeader(authHeader);
        return productService.deleteProduct(id, sellerEmail);
    }

    @GetMapping("/all")
    public ResponseEntity<?> getAllProducts() {
        return productService.getAllProducts();
    }

    // Simplified method to extract email from Authorization header
    // In a real application, you would decode the JWT token
    private String extractEmailFromAuthHeader(String authHeader) {
       
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            // In a real app, decode JWT to get email
            return "seller@example.com"; // Placeholder
        }
        return "unknown@example.com";
    }
}
