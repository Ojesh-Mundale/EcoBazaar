package com.ecobazaar.controller;

import java.util.Base64;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
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

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private static final Logger logger = LoggerFactory.getLogger(ProductController.class);

    @Autowired
    private ProductService productService;

    @Value("${jwt.secret}")
    private String jwtSecret;

    @PostMapping("/add")
    public ResponseEntity<?> addProduct(@RequestBody Product product, @RequestHeader("Authorization") String authHeader) {
        try {
            String sellerEmail = extractEmailFromAuthHeader(authHeader);
            logger.info("Extracted seller email from token: {}", sellerEmail);
            return productService.addProduct(product, sellerEmail);
        } catch (Exception e) {
            logger.error("Failed to add product due to token issue", e);
            return ResponseEntity.status(403).body(Map.of("error", "Forbidden: Invalid or expired token"));
        }
    }

    @GetMapping("/my-products")
    public ResponseEntity<?> getMyProducts(@RequestHeader("Authorization") String authHeader) {
        try {
            String sellerEmail = extractEmailFromAuthHeader(authHeader);
            return productService.getProductsBySeller(sellerEmail);
        } catch (Exception e) {
            return ResponseEntity.status(403).body(Map.of("error", "Forbidden: Invalid or expired token"));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getProduct(@PathVariable String id, @RequestHeader("Authorization") String authHeader) {
        try {
            String sellerEmail = extractEmailFromAuthHeader(authHeader);
            return productService.getProductById(id, sellerEmail);
        } catch (Exception e) {
            return ResponseEntity.status(403).body(Map.of("error", "Forbidden: Invalid or expired token"));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateProduct(@PathVariable String id, @RequestBody Product product, @RequestHeader("Authorization") String authHeader) {
        try {
            String sellerEmail = extractEmailFromAuthHeader(authHeader);
            return productService.updateProduct(id, product, sellerEmail);
        } catch (Exception e) {
            return ResponseEntity.status(403).body(Map.of("error", "Forbidden: Invalid or expired token"));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProduct(@PathVariable String id, @RequestHeader("Authorization") String authHeader) {
        try {
            String sellerEmail = extractEmailFromAuthHeader(authHeader);
            return productService.deleteProduct(id, sellerEmail);
        } catch (Exception e) {
            return ResponseEntity.status(403).body(Map.of("error", "Forbidden: Invalid or expired token"));
        }
    }

    @GetMapping("/all")
    public ResponseEntity<?> getAllProducts() {
        return productService.getAllProducts();
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
}
