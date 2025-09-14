package com.ecobazaar.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ecobazaar.service.AdminService;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private AdminService adminService;

    @Value("${jwt.secret}")
    private String jwtSecret;

    @GetMapping("/carbon-report")
    public ResponseEntity<?> getCarbonEmissionReport(@RequestHeader("Authorization") String authHeader) {
        try {
            // Verify admin access
            String userRole = extractRoleFromAuthHeader(authHeader);

            if (!"admin".equals(userRole)) {
                return ResponseEntity.status(403).body(Map.of("error", "Access denied. Admin privileges required."));
            }

            return adminService.getCarbonEmissionReport();

        } catch (Exception e) {
            return ResponseEntity.status(403).body(Map.of("error", "Forbidden: Invalid or expired token"));
        }
    }

    @GetMapping("/customers")
    public ResponseEntity<?> getAllCustomers(@RequestHeader("Authorization") String authHeader) {
        try {
            // Verify admin access
            String userRole = extractRoleFromAuthHeader(authHeader);

            if (!"admin".equals(userRole)) {
                return ResponseEntity.status(403).body(Map.of("error", "Access denied. Admin privileges required."));
            }

            return adminService.getAllCustomers();

        } catch (Exception e) {
            return ResponseEntity.status(403).body(Map.of("error", "Forbidden: Invalid or expired token"));
        }
    }

    @GetMapping("/sellers")
    public ResponseEntity<?> getAllSellers(@RequestHeader("Authorization") String authHeader) {
        try {
            // Verify admin access
            String userRole = extractRoleFromAuthHeader(authHeader);

            if (!"admin".equals(userRole)) {
                return ResponseEntity.status(403).body(Map.of("error", "Access denied. Admin privileges required."));
            }

            return adminService.getAllSellers();

        } catch (Exception e) {
            return ResponseEntity.status(403).body(Map.of("error", "Forbidden: Invalid or expired token"));
        }
    }

    @PostMapping("/sellers/{sellerId}/verify")
    public ResponseEntity<?> approveSeller(@PathVariable Long sellerId, @RequestHeader("Authorization") String authHeader) {
        try {
            // Verify admin access
            String userRole = extractRoleFromAuthHeader(authHeader);

            if (!"admin".equals(userRole)) {
                return ResponseEntity.status(403).body(Map.of("error", "Access denied. Admin privileges required."));
            }

            return adminService.approveSeller(sellerId);

        } catch (Exception e) {
            return ResponseEntity.status(403).body(Map.of("error", "Forbidden: Invalid or expired token"));
        }
    }

    @DeleteMapping("/customers/{customerId}")
    public ResponseEntity<?> deleteCustomer(@PathVariable Long customerId, @RequestHeader("Authorization") String authHeader) {
        try {
            // Verify admin access
            String userRole = extractRoleFromAuthHeader(authHeader);

            if (!"admin".equals(userRole)) {
                return ResponseEntity.status(403).body(Map.of("error", "Access denied. Admin privileges required."));
            }

            return adminService.deleteCustomer(customerId);

        } catch (Exception e) {
            return ResponseEntity.status(403).body(Map.of("error", "Forbidden: Invalid or expired token"));
        }
    }

    @DeleteMapping("/sellers/{sellerId}")
    public ResponseEntity<?> deleteSeller(@PathVariable Long sellerId, @RequestHeader("Authorization") String authHeader) {
        try {
            // Verify admin access
            String userRole = extractRoleFromAuthHeader(authHeader);

            if (!"admin".equals(userRole)) {
                return ResponseEntity.status(403).body(Map.of("error", "Access denied. Admin privileges required."));
            }

            return adminService.deleteSeller(sellerId);

        } catch (Exception e) {
            return ResponseEntity.status(403).body(Map.of("error", "Forbidden: Invalid or expired token"));
        }
    }

    @GetMapping("/sellers/{sellerId}/details")
    public ResponseEntity<?> getSellerCompleteDetails(@PathVariable Long sellerId, @RequestHeader("Authorization") String authHeader) {
        try {
            // Verify admin access
            String userRole = extractRoleFromAuthHeader(authHeader);

            if (!"admin".equals(userRole)) {
                return ResponseEntity.status(403).body(Map.of("error", "Access denied. Admin privileges required."));
            }

            return adminService.getSellerCompleteDetails(sellerId);

        } catch (Exception e) {
            return ResponseEntity.status(403).body(Map.of("error", "Forbidden: Invalid or expired token"));
        }
    }

    // Extract role from JWT token
    private String extractRoleFromAuthHeader(String authHeader) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            try {
                String token = authHeader.substring(7); // Remove "Bearer " prefix
                
                // Parse and validate the JWT token
                Claims claims = Jwts.parser()
                        .setSigningKey(jwtSecret)
                        .parseClaimsJws(token)
                        .getBody();
                
                // Extract role from the token claims
                return (String) claims.get("role");
            } catch (Exception e) {
                throw new RuntimeException("Invalid JWT token: " + e.getMessage());
            }
        }
        throw new RuntimeException("Missing or invalid Authorization header");
    }
}
