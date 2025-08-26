package com.ecobazaar.service;

import com.ecobazaar.model.User;
import com.ecobazaar.repository.UserRepository;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Value("${jwt.secret}")
    private String jwtSecret;

    private BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public ResponseEntity<?> login(User user) {
        try {
            Optional<User> existingUser = userRepository.findByEmail(user.getEmail());
            
            if (existingUser.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "User not found"));
            }

            User foundUser = existingUser.get();
            
            if (!passwordEncoder.matches(user.getPassword(), foundUser.getPassword())) {
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid password"));
            }

            String token = generateToken(foundUser);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Login successful");
            response.put("token", token);
            response.put("user", Map.of(
                "id", foundUser.getId(),
                "email", foundUser.getEmail(),
                "role", foundUser.getRole(),
                "is_verified", foundUser.getIsVerified()
            ));

            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Login failed: " + e.getMessage()));
        }
    }

    public ResponseEntity<?> register(User user) {
        try {
            if (userRepository.existsByEmail(user.getEmail())) {
                return ResponseEntity.badRequest().body(Map.of("error", "Email already exists"));
            }

            // Validate role
            if (!user.getRole().equals("customer") && !user.getRole().equals("seller")) {
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid role"));
            }

            // Hash password
            user.setPassword(passwordEncoder.encode(user.getPassword()));
            
            User savedUser = userRepository.save(user);
            
            String token = generateToken(savedUser);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Account created successfully");
            response.put("token", token);
            response.put("user", Map.of(
                "id", savedUser.getId(),
                "email", savedUser.getEmail(),
                "role", savedUser.getRole(),
                "is_verified", savedUser.getIsVerified()
            ));

            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Registration failed: " + e.getMessage()));
        }
    }

    private String generateToken(User user) {
        return Jwts.builder()
                .setSubject(user.getEmail())
                .claim("role", user.getRole())
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + 86400000)) // 24 hours
                .signWith(SignatureAlgorithm.HS512, jwtSecret)
                .compact();
    }
}
