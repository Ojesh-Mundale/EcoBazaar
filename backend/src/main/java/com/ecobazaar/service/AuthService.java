package com.ecobazaar.service;

import java.util.Base64;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import com.ecobazaar.model.Customer;
import com.ecobazaar.model.Seller;
import com.ecobazaar.model.User;
import com.ecobazaar.repository.CustomerRepository;
import com.ecobazaar.repository.SellerRepository;
import com.ecobazaar.repository.UserRepository;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SellerRepository sellerRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Value("${jwt.secret}")
    private String jwtSecret;

    private BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public ResponseEntity<?> login(User user) {
        try {
            // Check Seller table first
            Optional<Seller> existingSeller = sellerRepository.findByEmail(user.getEmail());
            if (existingSeller.isPresent()) {
                Seller foundSeller = existingSeller.get();
                if (!passwordEncoder.matches(user.getPassword(), foundSeller.getPassword())) {
                    return ResponseEntity.badRequest().body(Map.of("error", "Invalid password"));
                }
                String token = generateToken(foundSeller.getEmail(), "seller");
                Map<String, Object> response = new HashMap<>();
                response.put("message", "Login successful");
                response.put("token", token);
                response.put("user", Map.of(
                    "id", foundSeller.getId(),
                    "email", foundSeller.getEmail(),
                    "role", "seller",
                    "is_verified", foundSeller.getIsVerified()
                ));
                return ResponseEntity.ok(response);
            }

            // Check Customer table
            Optional<Customer> existingCustomer = customerRepository.findByEmail(user.getEmail());
            if (existingCustomer.isPresent()) {
                Customer foundCustomer = existingCustomer.get();
                if (!passwordEncoder.matches(user.getPassword(), foundCustomer.getPassword())) {
                    return ResponseEntity.badRequest().body(Map.of("error", "Invalid password"));
                }
                String token = generateToken(foundCustomer.getEmail(), "customer");
                Map<String, Object> response = new HashMap<>();
                response.put("message", "Login successful");
                response.put("token", token);
                response.put("user", Map.of(
                    "id", foundCustomer.getId(),
                    "email", foundCustomer.getEmail(),
                    "role", "customer",
                    "is_verified", true // Customers are always verified
                ));
                return ResponseEntity.ok(response);
            }

            // Check hardcoded admin credentials
            if ("admin@gmail.com".equals(user.getEmail()) && "admin".equals(user.getPassword())) {
                String token = generateToken(user.getEmail(), "admin");
                Map<String, Object> response = new HashMap<>();
                response.put("message", "Login successful");
                response.put("token", token);
                response.put("user", Map.of(
                    "id", 1,
                    "email", "admin@gmail.com",
                    "role", "admin",
                    "is_verified", true
                ));
                return ResponseEntity.ok(response);
            }

            return ResponseEntity.badRequest().body(Map.of("error", "User not found"));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Login failed: " + e.getMessage()));
        }
    }

    public ResponseEntity<?> register(User user) {
        try {
            // Check if email exists in sellers or customers table only
            if (sellerRepository.existsByEmail(user.getEmail()) ||
                customerRepository.existsByEmail(user.getEmail())) {
                return ResponseEntity.badRequest().body(Map.of("error", "Email already exists"));
            }

            // Validate role
            if (!user.getRole().equals("customer") && !user.getRole().equals("seller")) {
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid role"));
            }

            // Hash password
            String hashedPassword = passwordEncoder.encode(user.getPassword());

            Map<String, Object> response = new HashMap<>();
            String token;

            if (user.getRole().equals("seller")) {
                Seller seller = new Seller(user.getEmail(), hashedPassword);
                seller.setIsVerified(false); // Sellers need verification
                Seller savedSeller = sellerRepository.save(seller);
                token = generateToken(savedSeller.getEmail(), "seller");
                response.put("user", Map.of(
                    "id", savedSeller.getId(),
                    "email", savedSeller.getEmail(),
                    "role", "seller",
                    "is_verified", savedSeller.getIsVerified()
                ));
            } else { // customer
                Customer customer = new Customer(user.getEmail(), hashedPassword);
                Customer savedCustomer = customerRepository.save(customer);
                token = generateToken(savedCustomer.getEmail(), "customer");
                response.put("user", Map.of(
                    "id", savedCustomer.getId(),
                    "email", savedCustomer.getEmail(),
                    "role", "customer",
                    "is_verified", true // Customers are always verified
                ));
            }

            response.put("message", "Account created successfully");
            response.put("token", token);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Registration failed: " + e.getMessage()));
        }
    }



    private String generateToken(String email, String role) {
        // Decode the base64 encoded JWT secret
        byte[] decodedKey = Base64.getDecoder().decode(jwtSecret);

        return Jwts.builder()
                .setSubject(email)
                .claim("role", role)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + 86400000)) // 24 hours
                .signWith(SignatureAlgorithm.HS512, decodedKey)
                .compact();
    }
}
