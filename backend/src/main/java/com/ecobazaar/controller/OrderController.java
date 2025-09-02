package com.ecobazaar.controller;

import java.util.Base64;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ecobazaar.model.Order;
import com.ecobazaar.service.OrderService;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private static final Logger logger = LoggerFactory.getLogger(OrderController.class);

    @Autowired
    private OrderService orderService;

    @Value("${jwt.secret}")
    private String jwtSecret;

    @PostMapping("/create")
    public ResponseEntity<?> createOrder(@RequestBody Order order, @RequestHeader("Authorization") String authHeader) {
        try {
            String customerEmail = extractEmailFromAuthHeader(authHeader);
            logger.info("Creating order for customer: {}", customerEmail);
            return orderService.createOrder(order, customerEmail);
        } catch (Exception e) {
            logger.error("Failed to create order due to token issue", e);
            return ResponseEntity.status(403).body(Map.of("error", "Forbidden: Invalid or expired token"));
        }
    }

    @GetMapping("/my-orders")
    public ResponseEntity<?> getMyOrders(@RequestHeader("Authorization") String authHeader) {
        try {
            String customerEmail = extractEmailFromAuthHeader(authHeader);
            return orderService.getCustomerOrders(customerEmail);
        } catch (Exception e) {
            return ResponseEntity.status(403).body(Map.of("error", "Forbidden: Invalid or expired token"));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getOrder(@PathVariable String id, @RequestHeader("Authorization") String authHeader) {
        try {
            String customerEmail = extractEmailFromAuthHeader(authHeader);
            return orderService.getOrderById(id, customerEmail);
        } catch (Exception e) {
            return ResponseEntity.status(403).body(Map.of("error", "Forbidden: Invalid or expired token"));
        }
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<?> cancelOrder(@PathVariable String id, @RequestHeader("Authorization") String authHeader) {
        try {
            String customerEmail = extractEmailFromAuthHeader(authHeader);
            return orderService.updateOrderStatus(id, "CANCELLED", customerEmail);
        } catch (Exception e) {
            return ResponseEntity.status(403).body(Map.of("error", "Forbidden: Invalid or expired token"));
        }
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateOrderStatus(@PathVariable String id, @RequestBody Map<String, String> statusUpdate, @RequestHeader("Authorization") String authHeader) {
        try {
            String userEmail = extractEmailFromAuthHeader(authHeader);
            String userRole = extractRoleFromAuthHeader(authHeader);
            String newStatus = statusUpdate.get("status");
            if (newStatus == null || newStatus.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Status is required"));
            }
            // Determine if user is seller or customer based on role
            if ("seller".equals(userRole)) {
                return orderService.updateSellerOrderStatus(id, newStatus.toUpperCase(), userEmail);
            } else {
                return orderService.updateOrderStatus(id, newStatus.toUpperCase(), userEmail);
            }
        } catch (Exception e) {
            logger.error("Failed to update order status", e);
            return ResponseEntity.status(403).body(Map.of("error", "Forbidden: Invalid or expired token"));
        }
    }

    @GetMapping("/all")
    public ResponseEntity<?> getAllOrders(@RequestHeader("Authorization") String authHeader) {
        try {
            // Only allow admin to view all orders
            String userRole = extractRoleFromAuthHeader(authHeader);
            if ("admin".equals(userRole)) {
                return orderService.getAllOrders();
            } else {
                return ResponseEntity.status(403).body(Map.of("error", "Forbidden: Admin access required"));
            }
        } catch (Exception e) {
            return ResponseEntity.status(403).body(Map.of("error", "Forbidden: Invalid or expired token"));
        }
    }

    @GetMapping("/seller-orders")
    public ResponseEntity<?> getSellerOrders(@RequestHeader("Authorization") String authHeader) {
        try {
            String sellerEmail = extractEmailFromAuthHeader(authHeader);
            return orderService.getSellerOrders(sellerEmail);
        } catch (Exception e) {
            return ResponseEntity.status(403).body(Map.of("error", "Forbidden: Invalid or expired token"));
        }
    }

    // Proper method to extract email from JWT token in Authorization header
    private String extractEmailFromAuthHeader(String authHeader) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            try {
                String token = authHeader.substring(7); // Remove "Bearer " prefix

                // Decode the base64 encoded JWT secret
                byte[] decodedKey = Base64.getDecoder().decode(jwtSecret);

                // Parse and validate the JWT token using HS512 algorithm
                Claims claims = Jwts.parser()
                        .setSigningKey(decodedKey)
                        .parseClaimsJws(token)
                        .getBody();

                // Extract email from the token claims
                return claims.getSubject();
            } catch (Exception e) {
                throw new RuntimeException("Invalid JWT token: " + e.getMessage());
            }
        }
        throw new RuntimeException("Missing or invalid Authorization header");
    }

    // Method to extract role from JWT token in Authorization header
    private String extractRoleFromAuthHeader(String authHeader) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            try {
                String token = authHeader.substring(7); // Remove "Bearer " prefix

                // Decode the base64 encoded JWT secret
                byte[] decodedKey = Base64.getDecoder().decode(jwtSecret);

                // Parse and validate the JWT token using HS512 algorithm
                Claims claims = Jwts.parser()
                        .setSigningKey(decodedKey)
                        .parseClaimsJws(token)
                        .getBody();

                // Extract role from the token claims
                return claims.get("role", String.class);
            } catch (Exception e) {
                throw new RuntimeException("Invalid JWT token: " + e.getMessage());
            }
        }
        throw new RuntimeException("Missing or invalid Authorization header");
    }
}
